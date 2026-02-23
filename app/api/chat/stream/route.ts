import { anthropic } from "@/server/ai/client";
import { buildChatSystemPrompt } from "@/server/ai/prompts/chat";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { z } from "zod";

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
    })
  : null;

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  mode: z.enum(["CHAT", "ROLEPLAY", "DEBATE", "INTERVIEW", "STORYTELLING"]),
  grammarFocus: z.string().optional(),
  conversationId: z.string().optional(),
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function handleStreamRequest(body: unknown) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders() });
  }

  // 2. Rate limiting (skip if Redis not configured)
  if (ratelimit) {
    const { success } = await ratelimit.limit(session.user.id);
    if (!success) {
      return new Response("Rate limit exceeded. Please wait a moment.", {
        status: 429,
        headers: corsHeaders(),
      });
    }
  }

  // 3. Validate input
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.flatten()), {
      status: 400,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
      },
    });
  }

  const { messages, mode, grammarFocus } = parsed.data;

  // 4. Get user context
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { currentLevel: true },
  });

  const recentErrors = await db.errorRecord.findMany({
    where: { userId: session.user.id, mastered: false },
    orderBy: { frequency: "desc" },
    take: 10,
    select: {
      originalText: true,
      correction: true,
      grammarPoint: true,
    },
  });

  // 5. Build system prompt
  const systemPrompt = buildChatSystemPrompt({
    currentLevel: user?.currentLevel ?? "A2",
    mode,
    grammarFocus,
    recentErrors,
  });

  // 6. Stream from Claude
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  // 7. Return as streaming response
  return new Response(stream.toReadableStream(), {
    headers: {
      ...corsHeaders(),
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return await handleStreamRequest(body);
  } catch (error) {
    console.error("[CHAT STREAM POST ERROR]", error);
    return new Response("Invalid request body.", {
      status: 400,
      headers: corsHeaders(),
    });
  }
}

export async function GET(req: Request) {
  // Compatibility fallback for clients that call GET (e.g. cached old bundles).
  try {
    const { searchParams } = new URL(req.url);
    const payloadRaw = searchParams.get("payload");
    if (!payloadRaw) {
      return new Response(
        JSON.stringify({
          error:
            "Missing payload. Use POST /api/chat/stream or provide ?payload=<urlencoded-json>.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
    }
    const payload = JSON.parse(payloadRaw);
    return await handleStreamRequest(payload);
  } catch (error) {
    console.error("[CHAT STREAM GET ERROR]", error);
    return new Response("Invalid payload.", {
      status: 400,
      headers: corsHeaders(),
    });
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
