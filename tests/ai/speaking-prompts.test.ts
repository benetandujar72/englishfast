import test from "node:test";
import assert from "node:assert/strict";
import { buildAudioTranscriptionPrompt, buildSpeakingEvaluationPrompt } from "@/server/ai/prompts/speaking";

test("buildSpeakingEvaluationPrompt includes JSON schema guidance", () => {
  const prompt = buildSpeakingEvaluationPrompt({
    level: "A2",
    mode: "SHORT_ANSWER",
  });
  assert.ok(prompt.includes('"scores"'));
  assert.ok(prompt.includes("Return ONLY valid JSON"));
});

test("buildAudioTranscriptionPrompt enforces JSON output", () => {
  const prompt = buildAudioTranscriptionPrompt();
  assert.ok(prompt.includes('"transcript"'));
  assert.ok(prompt.includes('"confidence"'));
});
