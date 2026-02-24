"use client";

import { CheckCircle2, PlayCircle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SessionFlowHeaderProps {
  title: string;
  subtitle: string;
  goalMinutes: number;
  doneMinutes?: number;
  status?: "ready" | "active" | "completed";
}

export function SessionFlowHeader({
  title,
  subtitle,
  goalMinutes,
  doneMinutes = 0,
  status = "ready",
}: SessionFlowHeaderProps) {
  const progress = Math.min(100, Math.round((doneMinutes / Math.max(1, goalMinutes)) * 100));

  return (
    <Card variant="hero">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Badge
            variant={
              status === "completed" ? "success" : status === "active" ? "info" : "secondary"
            }
          >
            {status === "completed"
              ? "Completed"
              : status === "active"
                ? "In progress"
                : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
          <div className="rounded-lg border bg-background/80 px-3 py-2">
            <div className="flex items-center gap-1">
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Start</span>
            </div>
            <p className="mt-1">Choose task and begin quickly.</p>
          </div>
          <div className="rounded-lg border bg-background/80 px-3 py-2">
            <div className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              <span>Focus</span>
            </div>
            <p className="mt-1">Keep a short focused session.</p>
          </div>
          <div className="rounded-lg border bg-background/80 px-3 py-2">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Close</span>
            </div>
            <p className="mt-1">Review feedback and move to next step.</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Session goal</span>
            <span className="font-medium">
              {doneMinutes}/{goalMinutes} min
            </span>
          </div>
          <Progress value={progress} tone={progress >= 100 ? "success" : "info"} />
        </div>
      </CardContent>
    </Card>
  );
}
