"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { CorrectionDiff } from "@/components/diary/CorrectionDiff";
import { FeedbackPanel } from "@/components/diary/FeedbackPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { DiaryFeedback } from "@/types";

export default function DiaryEntryPage() {
  const params = useParams<{ id: string }>();
  const { data: entry, isLoading } = trpc.diary.getById.useQuery({ id: params.id });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container mx-auto max-w-4xl p-4 text-center">
        <p>Entry not found</p>
        <Link href="/diary">
          <Button variant="outline" className="mt-4">
            Back to Diary
          </Button>
        </Link>
      </div>
    );
  }

  const feedback = entry.feedback as DiaryFeedback | null;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <Link href="/diary">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Diary
        </Button>
      </Link>

      <h1 className="text-2xl font-bold">
        {entry.topic ?? "Diary Entry"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {new Date(entry.createdAt).toLocaleDateString("en", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · {entry.wordCount} words
      </p>

      {/* Original text */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-sm font-semibold">Your Original Text</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {entry.originalText}
        </p>
      </div>

      {/* Corrected diff */}
      {entry.correctedText && (
        <CorrectionDiff
          original={entry.originalText}
          corrected={entry.correctedText}
        />
      )}

      {/* Full feedback */}
      {feedback && <FeedbackPanel feedback={feedback} />}
    </div>
  );
}
