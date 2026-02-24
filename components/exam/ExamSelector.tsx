"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const EXAM_PARTS = [
  {
    type: "use-of-english-1",
    title: "Use of English Part 1",
    subtitle: "Multiple Choice Cloze",
    description: "Choose the correct word to fill 8 gaps in a text",
    icon: "📝",
    difficulty: "Medium",
  },
  {
    type: "use-of-english-2",
    title: "Use of English Part 2",
    subtitle: "Open Cloze",
    description: "Fill in 8 gaps with one word each",
    icon: "✏️",
    difficulty: "Hard",
  },
  {
    type: "use-of-english-3",
    title: "Use of English Part 3",
    subtitle: "Word Formation",
    description: "Transform a root word to fit 8 gaps",
    icon: "🔤",
    difficulty: "Medium",
  },
  {
    type: "use-of-english-4",
    title: "Use of English Part 4",
    subtitle: "Key Word Transformation",
    description: "Rewrite 6 sentences using a given word",
    icon: "🔄",
    difficulty: "Hard",
  },
  {
    type: "writing-1",
    title: "Writing Part 1",
    subtitle: "Essay",
    description: "Write an essay of 140-190 words",
    icon: "📄",
    difficulty: "Medium",
  },
  {
    type: "writing-2",
    title: "Writing Part 2",
    subtitle: "Article / Letter / Review",
    description: "Write in a specific format, 140-190 words",
    icon: "📰",
    difficulty: "Medium",
  },
];

export function ExamSelector() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {EXAM_PARTS.map((part) => (
        <Link key={part.type} href={`/exam/${part.type}`}>
          <Card variant="soft" className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{part.icon}</span>
                <Badge
                  variant={
                    part.difficulty === "Hard" ? "destructive" : "secondary"
                  }
                >
                  {part.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-base">{part.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">
                {part.subtitle}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {part.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
