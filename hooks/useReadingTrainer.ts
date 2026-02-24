"use client";

import { useState } from "react";
import type { ReadingLevel } from "@/lib/reading-training";

export interface ReadingAnalyzeResult {
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
  timings?: {
    evalMs: number;
  };
}

interface AnalyzeInput {
  audioBlob: Blob;
  prompt: string;
  targetLevel: ReadingLevel;
  subtitleLanguage: string;
}

export function useReadingTrainer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (input: AnalyzeInput): Promise<ReadingAnalyzeResult> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("audio", input.audioBlob, "reading.webm");
      formData.append("prompt", input.prompt);
      formData.append("targetLevel", input.targetLevel);
      formData.append("subtitleLanguage", input.subtitleLanguage);

      const response = await fetch("/api/reading/analyze", {
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
        throw new Error(`Reading analyze failed (${response.status}): ${errorMessage}`);
      }

      return (await response.json()) as ReadingAnalyzeResult;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Reading trainer analysis failed.";
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    error,
    analyze,
  };
}
