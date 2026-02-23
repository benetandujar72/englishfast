"use client";

import { useState } from "react";
import type { SpeakingMode } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";

interface AnalyzeResponse {
  transcript: string;
  transcriptionConfidence: number;
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
  referenceAudioBase64: string | null;
  referenceAudioMimeType: string | null;
}

interface AnalyzeInput {
  audioBlob: Blob;
  prompt: string;
  mode: SpeakingMode;
  targetLevel: string;
  durationSec?: number;
  imageFile?: File | null;
}

interface ReevaluateInput {
  transcript: string;
  prompt: string;
  mode: SpeakingMode;
  targetLevel: string;
  imageFile?: File | null;
}

export function useSpeakingSession() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const startSessionMutation = trpc.speaking.startSession.useMutation();
  const saveAttemptMutation = trpc.speaking.saveAttempt.useMutation({
    onSuccess: async () => {
      await utils.speaking.listSessions.invalidate();
    },
  });

  const analyzeAndSave = async (
    sessionId: string,
    input: AnalyzeInput
  ): Promise<AnalyzeResponse> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("audio", input.audioBlob, "speaking.webm");
      formData.append("prompt", input.prompt);
      formData.append("mode", input.mode);
      formData.append("targetLevel", input.targetLevel);
      if (input.imageFile) {
        formData.append("image", input.imageFile);
      }

      const response = await fetch("/api/speaking/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "";
        try {
          const data = (await response.json()) as { error?: string };
          errorMessage = data.error ?? "";
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(
          `Analyze request failed (${response.status}): ${errorMessage}`
        );
      }

      const result = (await response.json()) as AnalyzeResponse;

      await saveAttemptMutation.mutateAsync({
        sessionId,
        mode: input.mode,
        targetLevel: input.targetLevel,
        promptText: input.prompt,
        transcript: result.transcript,
        referenceAnswer: result.referenceAnswer,
        strength: result.strength,
        priorityFix: result.priorityFix,
        retryPrompt: result.retryPrompt,
        estimatedLevel: result.estimatedLevel,
        durationSec: input.durationSec,
        audioMimeType: input.audioBlob.type,
        audioSizeBytes: input.audioBlob.size,
        imageMimeType: input.imageFile?.type,
        scores: result.scores,
        feedback: {
          errorTags: result.errorTags,
          adaptiveHints: result.adaptiveHints,
          transcriptionConfidence: result.transcriptionConfidence,
        },
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Speaking analysis failed.";
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reevaluateAndSave = async (
    sessionId: string,
    input: ReevaluateInput
  ): Promise<AnalyzeResponse> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("transcript", input.transcript);
      formData.append("prompt", input.prompt);
      formData.append("mode", input.mode);
      formData.append("targetLevel", input.targetLevel);
      if (input.imageFile) {
        formData.append("image", input.imageFile);
      }

      const response = await fetch("/api/speaking/reevaluate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "";
        try {
          const data = (await response.json()) as { error?: string };
          errorMessage = data.error ?? "";
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(
          `Reevaluate request failed (${response.status}): ${errorMessage}`
        );
      }

      const result = (await response.json()) as AnalyzeResponse;

      await saveAttemptMutation.mutateAsync({
        sessionId,
        mode: input.mode,
        targetLevel: input.targetLevel,
        promptText: input.prompt,
        transcript: result.transcript,
        referenceAnswer: result.referenceAnswer,
        strength: result.strength,
        priorityFix: result.priorityFix,
        retryPrompt: result.retryPrompt,
        estimatedLevel: result.estimatedLevel,
        durationSec: 0,
        scores: result.scores,
        feedback: {
          errorTags: result.errorTags,
          adaptiveHints: result.adaptiveHints,
          transcriptionConfidence: result.transcriptionConfidence,
          reevaluated: true,
        },
      });

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Speaking reevaluation failed.";
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    error,
    startSession: startSessionMutation.mutateAsync,
    analyzeAndSave,
    reevaluateAndSave,
  };
}
