"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle } from "lucide-react";

interface Question {
  id: number;
  options?: string[];
  answer?: string;
  rootWord?: string;
  sentence1?: string;
  keyword?: string;
  sentence2Start?: string;
  sentence2End?: string;
}

interface Exercise {
  title: string;
  instructions: string;
  passage?: string;
  questions: Question[];
}

interface UseOfEnglishProps {
  exercise: Exercise;
  onSubmit: (answers: Record<number, string>) => Promise<void>;
  isSubmitting: boolean;
}

export function UseOfEnglish({
  exercise,
  onSubmit,
  isSubmitting,
}: UseOfEnglishProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const setAnswer = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const allAnswered = exercise.questions.every(
    (q) => answers[q.id]?.trim()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{exercise.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {exercise.instructions}
          </p>
        </CardHeader>
        <CardContent>
          {exercise.passage && (
            <div className="mb-6 rounded-lg bg-muted p-4 text-sm leading-relaxed">
              {exercise.passage}
            </div>
          )}

          <div className="space-y-4">
            {exercise.questions.map((q) => (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{q.id}</Badge>
                  {q.rootWord && (
                    <span className="font-mono font-bold uppercase text-blue-600">
                      {q.rootWord}
                    </span>
                  )}
                </div>

                {/* Key word transformation */}
                {q.sentence1 && (
                  <div className="mb-2 space-y-1 text-sm">
                    <p>{q.sentence1}</p>
                    {q.keyword && (
                      <p className="font-mono font-bold uppercase">
                        {q.keyword}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      <span>{q.sentence2Start}</span>
                      <Input
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        className="mx-1 inline-block w-48"
                        placeholder="..."
                      />
                      <span>{q.sentence2End}</span>
                    </div>
                  </div>
                )}

                {/* Multiple choice */}
                {q.options && (
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <Button
                        key={opt}
                        variant={answers[q.id] === opt ? "default" : "outline"}
                        className="justify-start text-sm"
                        onClick={() => setAnswer(q.id, opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Open cloze / word formation */}
                {!q.options && !q.sentence1 && (
                  <Input
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => onSubmit(answers)}
        disabled={!allAnswered || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Grading...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit Answers
          </>
        )}
      </Button>
    </div>
  );
}
