import type { SpeakingMode } from "@prisma/client";
import { buildSpeakingEvaluationPrompt } from "@/server/ai/prompts/speaking";
import {
  GEMINI_DEFAULT_MODEL,
  GEMINI_FALLBACK_MODELS,
  GEMINI_SPEAKING_MODEL,
} from "@/server/ai/models";

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

export interface SpeakingAnalysisResult extends SpeakingEvaluationResult {
  transcript: string;
  transcriptionConfidence: number;
}

export interface ReadingAloudAnalysisResult {
  transcript: string;
  transcriptionConfidence: number;
  feedbackEnglish: string;
  feedbackSubtitle: string;
  pronunciationTipsEnglish: string[];
  pronunciationTipsSubtitle: string[];
  suggestedReadingEnglish: string;
  suggestedReadingSubtitle: string;
  scores: {
    pronunciation: number;
    fluency: number;
    clarity: number;
    overall: number;
  };
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
  const modelsToTry = Array.from(new Set([model, ...GEMINI_FALLBACK_MODELS]));
  let lastError = "";

  for (const currentModel of modelsToTry) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`,
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

    if (res.ok) {
      return res.json();
    }

    const body = await res.text();
    lastError = `Gemini model ${currentModel} failed (${res.status}): ${body}`;
  }

  throw new Error(lastError || "Gemini request failed for all configured models.");
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
    model: GEMINI_DEFAULT_MODEL,
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

interface GeminiOnePassInput {
  mode: SpeakingMode;
  targetLevel: string;
  prompt: string;
  audioPart: GeminiInlineDataPart;
  imagePart?: GeminiInlineDataPart;
}

export async function analyzeSpeakingOnePassWithGemini(
  input: GeminiOnePassInput
): Promise<SpeakingAnalysisResult> {
  const basePrompt = buildSpeakingEvaluationPrompt({
    level: input.targetLevel,
    mode: input.mode,
  });

  const onePassPrompt = `${basePrompt}

You must do TWO tasks in a single response:
1) Transcribe the learner audio.
2) Evaluate speaking quality.

Return ONLY valid JSON with this schema:
{
  "transcript": "string",
  "transcriptionConfidence": number,
  "strength": "string",
  "priorityFix": "string",
  "retryPrompt": "string",
  "referenceAnswer": "string",
  "scores": {
    "pronunciation": number,
    "fluency": number,
    "grammar": number,
    "lexicalRange": number,
    "overall": number
  },
  "estimatedLevel": "A1|A2|B1|B1+|B2",
  "errorTags": ["string"],
  "adaptiveHints": ["string"]
}

Exercise prompt:
${input.prompt}
`;

  const parts: GeminiPart[] = [{ text: onePassPrompt }, input.audioPart];
  if (input.imagePart) {
    parts.push({ text: "Reference image for context:" });
    parts.push(input.imagePart);
  }

  const payload = await callGemini({
    model: GEMINI_SPEAKING_MODEL,
    parts,
    responseMimeType: "application/json",
  });

  const raw = extractTextResponse(payload);
  const parsed = parseJsonObject<Partial<SpeakingAnalysisResult>>(raw);

  return {
    transcript: parsed.transcript ?? "",
    transcriptionConfidence: parsed.transcriptionConfidence ?? 0.75,
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

interface GeminiReevaluateInput {
  mode: SpeakingMode;
  targetLevel: string;
  prompt: string;
  transcript: string;
  imagePart?: GeminiInlineDataPart;
}

export async function reevaluateTranscriptWithGemini(
  input: GeminiReevaluateInput
): Promise<SpeakingEvaluationResult> {
  const basePrompt = buildSpeakingEvaluationPrompt({
    level: input.targetLevel,
    mode: input.mode,
  });

  const parts: GeminiPart[] = [
    {
      text: `${basePrompt}

Re-evaluate this learner transcript (edited manually):
Exercise prompt:
${input.prompt}

Learner transcript:
${input.transcript}
`,
    },
  ];

  if (input.imagePart) {
    parts.push({ text: "Reference image for context:" });
    parts.push(input.imagePart);
  }

  const payload = await callGemini({
    model: GEMINI_SPEAKING_MODEL,
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

interface ReadingAloudInput {
  prompt: string;
  targetLevel: string;
  subtitleLanguage: string;
  audioPart: GeminiInlineDataPart;
}

export async function analyzeReadingAloudWithGemini(
  input: ReadingAloudInput
): Promise<ReadingAloudAnalysisResult> {
  const prompt = `
You are an English reading-aloud coach for language learners.
Target level: ${input.targetLevel}
Subtitle language code: ${input.subtitleLanguage}

Task:
1) Transcribe learner audio.
2) Evaluate oral reading quality (pronunciation, fluency, clarity).
3) Give concise feedback in English.
4) Provide subtitle translation of the same feedback in the requested subtitle language.
5) Provide pronunciation tips in English and translated subtitle language.
6) Suggest one corrected/smoother version to read next in English and subtitle language.

Reference text the learner should read:
${input.prompt}

Return ONLY valid JSON with this schema:
{
  "transcript": "string",
  "transcriptionConfidence": number,
  "feedbackEnglish": "string",
  "feedbackSubtitle": "string",
  "pronunciationTipsEnglish": ["string"],
  "pronunciationTipsSubtitle": ["string"],
  "suggestedReadingEnglish": "string",
  "suggestedReadingSubtitle": "string",
  "scores": {
    "pronunciation": number,
    "fluency": number,
    "clarity": number,
    "overall": number
  }
}
`;

  const payload = await callGemini({
    model: GEMINI_SPEAKING_MODEL,
    parts: [{ text: prompt }, input.audioPart],
    responseMimeType: "application/json",
  });

  const raw = extractTextResponse(payload);
  const parsed = parseJsonObject<Partial<ReadingAloudAnalysisResult>>(raw);

  return {
    transcript: parsed.transcript ?? "",
    transcriptionConfidence: parsed.transcriptionConfidence ?? 0.75,
    feedbackEnglish:
      parsed.feedbackEnglish ??
      "Good effort. Keep a steady pace and stress key words more clearly.",
    feedbackSubtitle:
      parsed.feedbackSubtitle ??
      "Buen esfuerzo. Mantén un ritmo constante y enfatiza con más claridad las palabras clave.",
    pronunciationTipsEnglish: parsed.pronunciationTipsEnglish ?? [
      "Open vowels clearly and avoid dropping final consonants.",
      "Pause briefly at commas for natural rhythm.",
    ],
    pronunciationTipsSubtitle: parsed.pronunciationTipsSubtitle ?? [
      "Abre bien las vocales y evita omitir consonantes finales.",
      "Haz pausas breves en las comas para un ritmo natural.",
    ],
    suggestedReadingEnglish:
      parsed.suggestedReadingEnglish ??
      input.prompt,
    suggestedReadingSubtitle:
      parsed.suggestedReadingSubtitle ??
      "Lectura sugerida no disponible.",
    scores: {
      pronunciation: parsed.scores?.pronunciation ?? 65,
      fluency: parsed.scores?.fluency ?? 65,
      clarity: parsed.scores?.clarity ?? 65,
      overall: parsed.scores?.overall ?? 65,
    },
  };
}
