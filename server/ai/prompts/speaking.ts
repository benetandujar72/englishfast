import type { SpeakingMode } from "@prisma/client";

interface SpeakingPromptContext {
  level: string;
  mode: SpeakingMode;
}

export function buildSpeakingEvaluationPrompt({
  level,
  mode,
}: SpeakingPromptContext) {
  return `
You are an expert English speaking coach for adult learners (${level}, CEFR).
Task mode: ${mode}.

Neuroeducation constraints:
- Keep feedback concise and motivating.
- Prioritize one improvement action at a time.
- Use low cognitive load language for A1-A2 and progressive challenge for B1.
- Include immediate retry guidance (20-40 seconds).

Return ONLY valid JSON with this schema:
{
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

Scoring rules:
- Use 0-100 range.
- "overall" is balanced average with stronger weight on fluency and grammar for A1-B1.
- Provide practical, specific and encouraging guidance.
`;
}

export function buildAudioTranscriptionPrompt() {
  return `
Transcribe the learner audio in English.
Rules:
- Preserve hesitations only when meaningful (e.g., long pauses marked as "...").
- Keep punctuation simple.
- Return ONLY valid JSON:
{
  "transcript": "string",
  "confidence": number
}
confidence must be between 0 and 1.
`;
}
