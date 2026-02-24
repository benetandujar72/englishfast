import { auth } from "@/auth";
import { z } from "zod";
import { translateTextWithGemini } from "@/server/ai/google/gemini";

const bodySchema = z.object({
  text: z.string().min(1),
  targetLanguage: z.string().default("es"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return Response.json(
        {
          error:
            "Missing GOOGLE_AI_API_KEY. Configure it in Vercel Environment Variables.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid translate payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await translateTextWithGemini({
      text: parsed.data.text,
      targetLanguage: parsed.data.targetLanguage,
    });

    return Response.json(result);
  } catch (error) {
    console.error("[READING TRANSLATE ERROR]", error);
    const message =
      error instanceof Error ? error.message : "Unknown reading translate error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
