"use client";

import { ExamSelector } from "@/components/exam/ExamSelector";

export default function ExamPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Cambridge First Exam Practice</h1>
        <p className="text-muted-foreground">
          Choose an exam part to practice. New exercises are generated each time.
        </p>
      </div>
      <ExamSelector />
    </div>
  );
}
