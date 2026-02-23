import type { SpeakingMode } from "@prisma/client";
import { buildSpeakingEvaluationPrompt } from "@/server/ai/prompts/speaking";

export interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface GeminiTextPart {
  text: string;
}

type GeminiPart = GeminiTextPart | GeminiInlineDataPart;

interface GeminiEvaluationInput {
  mode: SpeakingMode;
  targetLevel: string;
  prompt: string;
  transcript: string;
  audioPart?: GeminiInlineDataPart;
  imagePart?: GeminiInlineDataPart;
}

export interface SpeakingEvaluationResult {
  strength: string;
  priorityFix: string;
  retryPrompt: string;
  referenceAnswer: string;
  scores: {
    pronunciation: number;
    fluency: number;
    grammar: number;
    lexicalRange: number;
    overall: number;
  };
  estimatedLevel: string;
  errorTags: string[];
  adaptiveHints: string[];
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
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}

function parseJsonObject<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON from Gemini response.");
    return JSON.parse(jsonMatch[0]) as T;
  }
}

async function callGemini({
  model,
  parts,
  responseMimeType = "application/json",
}: {
  model: string;
  parts: GeminiPart[];
  responseMimeType?: "application/json" | "text/plain";
}) {
  const apiKey = getGoogleApiKey();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.3,
          responseMimeType,
        },
        contents: [
          {
            role: "user",
            parts,
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }

  return res.json();
}

export async function evaluateSpeakingWithGemini(
  input: GeminiEvaluationInput
): Promise<SpeakingEvaluationResult> {
  const basePrompt = buildSpeakingEvaluationPrompt({
    level: input.targetLevel,
    mode: input.mode,
  });

  const parts: GeminiPart[] = [
    {
      text: `${basePrompt}

Exercise prompt:
${input.prompt}

Learner transcript:
${input.transcript}
`,
    },
  ];

  if (input.audioPart) parts.push(input.audioPart);
  if (input.imagePart) {
    parts.push({ text: "Reference image for context:" });
    parts.push(input.imagePart);
  }

  const payload = await callGemini({
    model: "gemini-2.0-flash",
    parts,
    responseMimeType: "application/json",
  });

  const raw = extractTextResponse(payload);
  const parsed = parseJsonObject<Partial<SpeakingEvaluationResult>>(raw);

  return {
    strength: parsed.strength ?? "Good effort and clear intent.",
    priorityFix:
      parsed.priorityFix ?? "Use shorter sentences and focus on verb tense consistency.",
    retryPrompt:
      parsed.retryPrompt ??
      "Try again in 30 seconds: introduce yourself and describe your daily routine.",
    referenceAnswer:
      parsed.referenceAnswer ??
      "Hello, my name is Alex. I work in a small company and I study English every day.",
    scores: {
      pronunciation: parsed.scores?.pronunciation ?? 65,
      fluency: parsed.scores?.fluency ?? 65,
      grammar: parsed.scores?.grammar ?? 65,
      lexicalRange: parsed.scores?.lexicalRange ?? 65,
      overall: parsed.scores?.overall ?? 65,
    },
    estimatedLevel: parsed.estimatedLevel ?? input.targetLevel,
    errorTags: parsed.errorTags ?? [],
    adaptiveHints: parsed.adaptiveHints ?? [],
  };
}
