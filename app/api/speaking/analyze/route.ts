import { auth } from "@/auth";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import {
  evaluateSpeakingWithGemini,
  type GeminiInlineDataPart,
} from "@/server/ai/google/gemini";
import { transcribeAudioWithGemini } from "@/server/ai/google/stt";
import { synthesizeSpeechWithGoogle } from "@/server/ai/google/tts";

export const runtime = "nodejs";

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        Number(process.env.SPEAKING_RATE_LIMIT_PER_MIN ?? 8),
        "1 m"
      ),
    })
  : null;

const bodySchema = z.object({
  prompt: z.string().min(3),
  mode: z.enum([
    "PRONUNCIATION",
    "SHORT_ANSWER",
    "PICTURE_DESCRIPTION",
    "GUIDED_CONVERSATION",
  ]),
  targetLevel: z.string().default("A2"),
});

const maxAudioBytes = Number(process.env.SPEAKING_MAX_AUDIO_BYTES ?? 6_000_000);

function fileToInlineData(file: File): Promise<GeminiInlineDataPart> {
  return file.arrayBuffer().then((buffer) => ({
    inlineData: {
      mimeType: file.type || "audio/webm",
      data: Buffer.from(buffer).toString("base64"),
    },
  }));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(`speaking:${session.user.id}`);
    if (!success) {
      return Response.json(
        { error: "Rate limit exceeded for speaking analysis." },
        { status: 429 }
      );
    }
  }

  const formData = await req.formData();
  const parsed = bodySchema.safeParse({
    prompt: formData.get("prompt"),
    mode: formData.get("mode"),
    targetLevel: formData.get("targetLevel") ?? "A2",
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid speaking payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const audioFile = formData.get("audio");
  if (!(audioFile instanceof File)) {
    return Response.json({ error: "Audio file is required." }, { status: 400 });
  }

  if (audioFile.size > maxAudioBytes) {
    return Response.json(
      {
        error: `Audio exceeds max size (${maxAudioBytes} bytes).`,
      },
      { status: 413 }
    );
  }

  const imageFile = formData.get("image");
  const timings = { sttMs: 0, evalMs: 0, ttsMs: 0 };

  const startedStt = Date.now();
  const audioPart = await fileToInlineData(audioFile);
  const transcription = await transcribeAudioWithGemini(audioPart);
  timings.sttMs = Date.now() - startedStt;

  const imagePart =
    imageFile instanceof File ? await fileToInlineData(imageFile) : undefined;

  const startedEval = Date.now();
  const evaluation = await evaluateSpeakingWithGemini({
    mode: parsed.data.mode,
    targetLevel: parsed.data.targetLevel,
    prompt: parsed.data.prompt,
    transcript: transcription.transcript,
    audioPart,
    imagePart,
  });
  timings.evalMs = Date.now() - startedEval;

  let referenceAudioBase64: string | null = null;
  let referenceAudioMimeType: string | null = null;

  try {
    const startedTts = Date.now();
    const tts = await synthesizeSpeechWithGoogle({
      text: evaluation.referenceAnswer,
    });
    referenceAudioBase64 = tts.audioContentBase64;
    referenceAudioMimeType = tts.mimeType;
    timings.ttsMs = Date.now() - startedTts;
  } catch (error) {
    console.warn("[SPEAKING TTS WARNING]", error);
  }

  return Response.json({
    transcript: transcription.transcript,
    transcriptionConfidence: transcription.confidence,
    ...evaluation,
    referenceAudioBase64,
    referenceAudioMimeType,
    timings,
  });
}
