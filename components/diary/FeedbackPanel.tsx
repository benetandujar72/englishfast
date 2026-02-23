"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DiaryFeedback } from "@/types";

interface FeedbackPanelProps {
  feedback: DiaryFeedback;
}

function getLevelColor(level: string) {
  if (level.startsWith("B2")) return "bg-green-500";
  if (level.startsWith("B1+")) return "bg-blue-500";
  if (level.startsWith("B1")) return "bg-yellow-500";
  return "bg-orange-500";
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <div className="space-y-4">
      {/* Score and Level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{feedback.overallScore}</p>
              <p className="text-xs text-muted-foreground">/100</p>
            </div>
            <div className="flex-1">
              <Progress value={feedback.overallScore} className="h-3" />
            </div>
            <Badge className={getLevelColor(feedback.estimatedLevel)}>
              {feedback.estimatedLevel}
            </Badge>
          </div>
          {feedback.positiveFeedback && (
            <p className="mt-3 text-sm text-muted-foreground">
              {feedback.positiveFeedback}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Errors */}
      {feedback.errors?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Errors ({feedback.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.errors.map((error, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/20"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {error.type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">
                    <span className="text-red-600 line-through dark:text-red-400">
                      {error.original}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {error.correction}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {error.explanation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Upgrades */}
      {feedback.vocabularyUpgrades?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vocabulary Upgrades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {feedback.vocabularyUpgrades.map((upgrade, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="text-sm">
                    <span className="text-muted-foreground">
                      {upgrade.basic}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {upgrade.advanced}
                    </span>
                  </p>
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    &ldquo;{upgrade.context}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* C1 Rewrite */}
      {feedback.c1Rewrite && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              C1 Level Rewrite (Aspirational)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              {feedback.c1Rewrite}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
