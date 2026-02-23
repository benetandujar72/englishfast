"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send } from "lucide-react";

interface DiaryEditorProps {
  onSubmit: (text: string, topic?: string) => Promise<void>;
  isLoading: boolean;
}

export function DiaryEditor({ onSubmit, isLoading }: DiaryEditorProps) {
  const [text, setText] = useState("");
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minWords = 100;

  const handleSubmit = async () => {
    if (wordCount < 50) return;
    await onSubmit(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Write your diary entry</span>
          <Badge
            variant={wordCount >= minWords ? "default" : "secondary"}
          >
            {wordCount} / {minWords} words
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write about your day, your thoughts, a topic that interests you... The more you write, the better feedback you'll get!"
          className="min-h-[300px] resize-y text-base leading-relaxed"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {wordCount < 50
              ? `Write at least 50 more words to submit`
              : wordCount < minWords
                ? `${minWords - wordCount} more words recommended for detailed feedback`
                : "Great length! Ready to submit."}
          </p>

          <Button
            onClick={handleSubmit}
            disabled={wordCount < 50 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
