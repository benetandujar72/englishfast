"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizWord {
  id: string;
  word: string;
  definition: string;
  exampleSent: string;
}

interface VocabQuizProps {
  words: QuizWord[];
  mode: "definition-to-word" | "word-to-definition" | "fill-the-gap";
  onResult: (wordId: string, correct: boolean) => void;
}

export function VocabQuiz({ words, mode, onResult }: VocabQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const current = words[currentIndex];
  if (!current) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium">Quiz Complete!</p>
          <p className="mt-2 text-muted-foreground">
            Score: {score.correct}/{score.total} (
            {score.total > 0
              ? Math.round((score.correct / score.total) * 100)
              : 0}
            %)
          </p>
        </CardContent>
      </Card>
    );
  }

  const checkAnswer = () => {
    const correct =
      answer.trim().toLowerCase() === current.word.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    onResult(current.id, correct);
  };

  const nextWord = () => {
    setCurrentIndex((prev) => prev + 1);
    setAnswer("");
    setShowResult(false);
  };

  const prompt =
    mode === "definition-to-word"
      ? current.definition
      : mode === "fill-the-gap"
        ? current.exampleSent.replace(
            new RegExp(current.word, "gi"),
            "_____"
          )
        : current.word;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          {currentIndex + 1}/{words.length}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Score: {score.correct}/{score.total}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {mode === "definition-to-word"
              ? "What word matches this definition?"
              : mode === "fill-the-gap"
                ? "Fill in the blank"
                : "What does this word mean?"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{prompt}</p>

          {!showResult ? (
            <div className="flex gap-2">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Type your answer..."
                autoFocus
              />
              <Button onClick={checkAnswer} disabled={!answer.trim()}>
                Check
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-2 rounded-lg p-3 ${
                  isCorrect
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {isCorrect
                    ? "Correct!"
                    : `Incorrect. The answer is: ${current.word}`}
                </span>
              </div>
              <Button onClick={nextWord} className="w-full">
                Next Word
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
