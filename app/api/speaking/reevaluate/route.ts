import { auth } from "@/auth";
import { z } from "zod";
import {
  reevaluateTranscriptWithGemini,
  type GeminiInlineDataPart,
} from "@/server/ai/google/gemini";

export const runtime = "nodejs";

const bodySchema = z.object({
  prompt: z.string().min(3),
  mode: z.enum([
    "PRONUNCIATION",
    "SHORT_ANSWER",
    "PICTURE_DESCRIPTION",
    "GUIDED_CONVERSATION",
  ]),
  targetLevel: z.string().default("A2"),
  transcript: z.string().min(3),
});

function fileToInlineData(file: File): Promise<GeminiInlineDataPart> {
  return file.arrayBuffer().then((buffer) => ({
    inlineData: {
      mimeType: file.type || "image/jpeg",
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
      mode: formData.get("mode"),
      targetLevel: formData.get("targetLevel") ?? "A2",
      transcript: formData.get("transcript"),
    });

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid reevaluate payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const imageFile = formData.get("image");
    const imagePart =
      imageFile instanceof File ? await fileToInlineData(imageFile) : undefined;

    const started = Date.now();
    const evaluation = await reevaluateTranscriptWithGemini({
      mode: parsed.data.mode,
      targetLevel: parsed.data.targetLevel,
      prompt: parsed.data.prompt,
      transcript: parsed.data.transcript,
      imagePart,
    });
    const evalMs = Date.now() - started;

    return Response.json({
      transcript: parsed.data.transcript,
      transcriptionConfidence: 1,
      ...evaluation,
      referenceAudioBase64: null,
      referenceAudioMimeType: null,
      timings: { sttMs: 0, evalMs, ttsMs: 0 },
      analysisMode: "reevaluate-transcript",
    });
  } catch (error) {
    console.error("[SPEAKING REEVALUATE ERROR]", error);
    const message =
      error instanceof Error ? error.message : "Unknown speaking reevaluate error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
