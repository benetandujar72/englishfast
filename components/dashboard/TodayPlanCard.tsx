"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TodayTask {
  id: string;
  title: string;
  module: "speaking" | "entreno" | "vocabulary" | "chat" | "diary" | "exam";
  minutes: number;
  status?: "PENDING" | "COMPLETED" | "SKIPPED";
  href?: string;
}

interface TodayPlanCardProps {
  tasks: TodayTask[];
  goalMinutes: number;
  doneMinutes: number;
  onRefresh?: () => void;
}

const MODULE_LABELS: Record<TodayTask["module"], string> = {
  speaking: "Speaking",
  entreno: "Reading Trainer",
  vocabulary: "Vocabulary",
  chat: "Chat",
  diary: "Diary",
  exam: "Exam Prep",
};

export function TodayPlanCard({
  tasks,
  goalMinutes,
  doneMinutes,
  onRefresh,
}: TodayPlanCardProps) {
  const progress = Math.min(100, Math.round((doneMinutes / Math.max(1, goalMinutes)) * 100));

  return (
    <Card variant="hero">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Your plan for today</CardTitle>
            <CardDescription>
              Short sessions to keep consistency and reduce friction.
            </CardDescription>
          </div>
          <Badge variant={progress >= 100 ? "success" : "info"}>{progress}% done</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily goal</span>
            <span className="font-medium">
              {doneMinutes}/{goalMinutes} min
            </span>
          </div>
          <Progress value={progress} tone={progress >= 100 ? "success" : "info"} />
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {task.status === "COMPLETED" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{task.title}</span>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {MODULE_LABELS[task.module]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{task.minutes} min</span>
                </div>
                {task.href && task.status !== "COMPLETED" ? (
                  <Button asChild size="sm" variant="soft">
                    <Link href={task.href}>Start</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="soft" onClick={onRefresh}>
            Recalculate day plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
