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

export async function POST(req: Request) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Rate limiting (skip if Redis not configured)
  if (ratelimit) {
    const { success } = await ratelimit.limit(session.user.id);
    if (!success) {
      return new Response("Rate limit exceeded. Please wait a moment.", {
        status: 429,
      });
    }
  }

  // 3. Validate input
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.flatten()), { status: 400 });
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
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
