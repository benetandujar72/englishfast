import { auth } from "@/auth";
import { z } from "zod";
import {
  analyzeReadingAloudWithGemini,
  type GeminiInlineDataPart,
} from "@/server/ai/google/gemini";

export const runtime = "nodejs";

const bodySchema = z.object({
  prompt: z.string().min(10),
  targetLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).default("A2"),
  subtitleLanguage: z.string().default("es"),
  competencyFocus: z
    .enum(["comprension", "interaccion", "produccion", "escritura"])
    .optional(),
});

function fileToInlineData(file: File): Promise<GeminiInlineDataPart> {
  return file.arrayBuffer().then((buffer) => ({
    inlineData: {
      mimeType: file.type || "audio/webm",
      data: Buffer.from(buffer).toString("base64"),
    },
  }));
}

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

    const formData = await req.formData();
    const parsed = bodySchema.safeParse({
      prompt: formData.get("prompt"),
      targetLevel: formData.get("targetLevel") ?? "A2",
      subtitleLanguage: formData.get("subtitleLanguage") ?? "es",
      competencyFocus: formData.get("competencyFocus") ?? undefined,
    });

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid reading analyze payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const audioFile = formData.get("audio");
    if (!(audioFile instanceof File)) {
      return Response.json({ error: "Audio file is required." }, { status: 400 });
    }

    const started = Date.now();
    const audioPart = await fileToInlineData(audioFile);
    const result = await analyzeReadingAloudWithGemini({
      prompt: parsed.data.prompt,
      targetLevel: parsed.data.targetLevel,
      subtitleLanguage: parsed.data.subtitleLanguage,
      competencyFocus: parsed.data.competencyFocus,
      audioPart,
    });
    const evalMs = Date.now() - started;

    return Response.json({
      ...result,
      timings: { evalMs },
    });
  } catch (error) {
    console.error("[READING ANALYZE ERROR]", error);
    const message =
      error instanceof Error ? error.message : "Unknown reading analyze error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
