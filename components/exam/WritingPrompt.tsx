"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send } from "lucide-react";

interface WritingExercise {
  title: string;
  instructions: string;
  prompt: string;
  notes?: string[];
  type?: string;
  wordRange: { min: number; max: number };
}

interface WritingPromptProps {
  exercise: WritingExercise;
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
}

export function WritingPrompt({
  exercise,
  onSubmit,
  isSubmitting,
}: WritingPromptProps) {
  const [text, setText] = useState("");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const inRange =
    wordCount >= exercise.wordRange.min && wordCount <= exercise.wordRange.max;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{exercise.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {exercise.instructions}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
            <p>{exercise.prompt}</p>
            {exercise.notes && (
              <ul className="mt-3 list-inside list-disc space-y-1">
                {exercise.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            )}
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer here..."
            className="min-h-[250px] resize-y text-base leading-relaxed"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={inRange ? "default" : "secondary"}>
                {wordCount} words
              </Badge>
              <span className="text-xs text-muted-foreground">
                Target: {exercise.wordRange.min}-{exercise.wordRange.max}
              </span>
            </div>

            <Button
              onClick={() => onSubmit(text)}
              disabled={wordCount < exercise.wordRange.min * 0.8 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
