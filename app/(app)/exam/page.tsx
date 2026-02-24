"use client";

import { ExamSelector } from "@/components/exam/ExamSelector";
import { SessionFlowHeader } from "@/components/learning/SessionFlowHeader";

export default function ExamPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <SessionFlowHeader
        title="Exam practice"
        subtitle="Train one official-style part per session with targeted feedback."
        goalMinutes={20}
        doneMinutes={0}
        status="ready"
      />
      <ExamSelector />
    </div>
  );
}
