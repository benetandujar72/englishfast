"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { UseOfEnglish } from "@/components/exam/UseOfEnglish";
import { WritingPrompt } from "@/components/exam/WritingPrompt";
import { ScoreDisplay } from "@/components/exam/ScoreDisplay";
import { SessionFlowHeader } from "@/components/learning/SessionFlowHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ExamResult } from "@/types";
import type { ExamType } from "@prisma/client";

const TYPE_MAP: Record<string, { examType: ExamType; part: string; isWriting: boolean }> = {
  "use-of-english-1": { examType: "USE_OF_ENGLISH", part: "Use of English Part 1", isWriting: false },
  "use-of-english-2": { examType: "USE_OF_ENGLISH", part: "Use of English Part 2", isWriting: false },
  "use-of-english-3": { examType: "USE_OF_ENGLISH", part: "Use of English Part 3", isWriting: false },
  "use-of-english-4": { examType: "USE_OF_ENGLISH", part: "Use of English Part 4", isWriting: false },
  "writing-1": { examType: "WRITING", part: "Writing Part 1", isWriting: true },
  "writing-2": { examType: "WRITING", part: "Writing Part 2", isWriting: true },
};

export default function ExamTypePage() {
  const params = useParams<{ type: string }>();
  const config = TYPE_MAP[params.type];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exercise, setExercise] = useState<any>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [startTime] = useState(Date.now());

  const generateMutation = trpc.exam.generate.useMutation({
    onSuccess: (data) => setExercise(data),
  });

  const submitMutation = trpc.exam.submit.useMutation({
    onSuccess: (data) => setResult(data as ExamResult),
  });

  if (!config) {
    return (
      <div className="container mx-auto max-w-4xl p-4 text-center">
        <p>Unknown exam type</p>
        <Link href="/exam">
          <Button variant="outline" className="mt-4">Back to Exams</Button>
        </Link>
      </div>
    );
  }

  const handleGenerate = () => {
    setExercise(null);
    setResult(null);
    generateMutation.mutate({
      examType: config.examType,
      part: config.part,
    });
  };

  const handleSubmitAnswers = async (answers: Record<number, string>) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    await submitMutation.mutateAsync({
      examType: config.examType,
      part: config.part,
      exercise,
      answers,
      timeSpent,
    });
  };

  const handleSubmitWriting = async (text: string) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    await submitMutation.mutateAsync({
      examType: config.examType,
      part: config.part,
      exercise,
      answers: { text },
      timeSpent,
    });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <SessionFlowHeader
        title={config.part}
        subtitle="Generate, solve, submit, and review corrections in one focused flow."
        goalMinutes={20}
        doneMinutes={result ? 20 : exercise ? 10 : 0}
        status={result ? "completed" : generateMutation.isPending || submitMutation.isPending ? "active" : "ready"}
      />

      <div className="flex items-center justify-between">
        <Link href="/exam">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold">{config.part}</h1>
      </div>

      {/* Generate button */}
      {!exercise && !generateMutation.isPending && (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-muted-foreground">Ready to start?</p>
          <Button onClick={handleGenerate} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Exercise
          </Button>
        </div>
      )}

      {/* Loading state */}
      {generateMutation.isPending && (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating exercise...</p>
        </div>
      )}

      {/* Exercise */}
      {exercise && !result && (
        <>
          {config.isWriting ? (
            <WritingPrompt
              exercise={exercise}
              onSubmit={handleSubmitWriting}
              isSubmitting={submitMutation.isPending}
            />
          ) : (
            <UseOfEnglish
              exercise={exercise}
              onSubmit={handleSubmitAnswers}
              isSubmitting={submitMutation.isPending}
            />
          )}
        </>
      )}

      {/* Result */}
      {result && (
        <>
          <ScoreDisplay result={result} />
          <Button onClick={handleGenerate} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Another Exercise
          </Button>
        </>
      )}
    </div>
  );
}
