import { buildAudioTranscriptionPrompt } from "@/server/ai/prompts/speaking";
import type { GeminiInlineDataPart } from "@/server/ai/google/gemini";
import { GEMINI_STT_MODEL } from "@/server/ai/models";

interface TranscriptionResult {
  transcript: string;
  confidence: number;
}

function getGoogleApiKey() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error("Missing GOOGLE_AI_API_KEY environment variable.");
  }
  return key;
}

function extractTextResponse(payload: unknown): string {
  const text =
    (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
      ?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) {
    throw new Error("Gemini returned empty transcription.");
  }
  return text;
}

function parseJsonObject<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON from transcription response.");
    return JSON.parse(jsonMatch[0]) as T;
  }
}

export async function transcribeAudioWithGemini(
  audioPart: GeminiInlineDataPart
): Promise<TranscriptionResult> {
  const apiKey = getGoogleApiKey();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_STT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildAudioTranscriptionPrompt() }, audioPart],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`STT request failed (${res.status}): ${body}`);
  }

  const payload = await res.json();
  const raw = extractTextResponse(payload);
  const parsed = parseJsonObject<Partial<TranscriptionResult>>(raw);
  return {
    transcript: parsed.transcript ?? "",
    confidence: parsed.confidence ?? 0.7,
  };
}
