"use client";

import { useState } from "react";
import { DiaryEditor } from "@/components/diary/DiaryEditor";
import { CorrectionDiff } from "@/components/diary/CorrectionDiff";
import { FeedbackPanel } from "@/components/diary/FeedbackPanel";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionFlowHeader } from "@/components/learning/SessionFlowHeader";
import Link from "next/link";
import type { DiaryFeedback } from "@/types";

export default function DiaryPage() {
  const [feedback, setFeedback] = useState<{
    originalText: string;
    feedback: DiaryFeedback;
  } | null>(null);

  const { data: entries } = trpc.diary.list.useQuery();

  const submitMutation = trpc.diary.submit.useMutation({
    onSuccess: (data) => {
      setFeedback({
        originalText: data.entry.originalText,
        feedback: data.feedback,
      });
    },
  });

  const handleSubmit = async (text: string, topic?: string) => {
    await submitMutation.mutateAsync({ text, topic });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <SessionFlowHeader
        title="Writing diary"
        subtitle="Write, get corrections, then reuse key improvements."
        goalMinutes={15}
        doneMinutes={feedback ? 15 : 0}
        status={feedback ? "completed" : submitMutation.isPending ? "active" : "ready"}
      />

      {!feedback ? (
        <>
          <DiaryEditor
            onSubmit={handleSubmit}
            isLoading={submitMutation.isPending}
          />

          {/* Previous entries */}
          {entries && entries.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Previous Entries</h2>
              {entries.map((entry) => {
                const fb = entry.feedback as DiaryFeedback | null;
                return (
                  <Link key={entry.id} href={`/diary/${entry.id}`}>
                    <Card
                      variant="soft"
                      className="cursor-pointer transition-shadow hover:shadow-md"
                    >
                      <CardContent className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {entry.topic ?? "Diary entry"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()} ·{" "}
                            {entry.wordCount} words
                          </p>
                        </div>
                        {fb?.estimatedLevel && (
                          <Badge variant="outline">{fb.estimatedLevel}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setFeedback(null)}
          >
            Write New Entry
          </Button>
          <CorrectionDiff
            original={feedback.originalText}
            corrected={feedback.feedback.correctedText}
          />
          <FeedbackPanel feedback={feedback.feedback} />
        </div>
      )}
    </div>
  );
}
