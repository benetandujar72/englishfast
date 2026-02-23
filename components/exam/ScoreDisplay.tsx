"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ExamResult } from "@/types";

interface ScoreDisplayProps {
  result: ExamResult;
}

function getBandColor(band: string) {
  if (band.startsWith("C")) return "bg-purple-500";
  if (band === "B2+" || band === "B2") return "bg-green-500";
  if (band.startsWith("B1")) return "bg-blue-500";
  return "bg-orange-500";
}

export function ScoreDisplay({ result }: ScoreDisplayProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{result.percentage}%</p>
              <p className="text-sm text-muted-foreground">
                {result.score}/{result.maxScore}
              </p>
            </div>
            <div className="flex-1">
              <Progress value={result.percentage} className="h-4" />
            </div>
            <Badge className={`${getBandColor(result.band)} text-lg px-3 py-1`}>
              {result.band}
            </Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {result.feedback}
          </p>
        </CardContent>
      </Card>

      {result.corrections?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Review Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.corrections.map((c) => (
                <div
                  key={c.questionId}
                  className={`rounded-lg border p-3 ${
                    c.userAnswer === c.correct
                      ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                      : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Q{c.questionId}</Badge>
                    {c.userAnswer === c.correct ? (
                      <span className="text-sm text-green-600">Correct</span>
                    ) : (
                      <span className="text-sm text-red-600">Incorrect</span>
                    )}
                  </div>
                  {c.userAnswer !== c.correct && (
                    <div className="mt-2 text-sm">
                      <p>
                        Your answer:{" "}
                        <span className="text-red-600 line-through">
                          {c.userAnswer}
                        </span>
                      </p>
                      <p>
                        Correct:{" "}
                        <span className="font-medium text-green-600">
                          {c.correct}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
