"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface LevelGaugeProps {
  currentLevel: string;
  targetLevel: string;
  estimatedWeeks: number;
  confidence: "low" | "medium" | "high";
}

const LEVELS = ["A1", "A2", "B1", "B1+", "B2", "B2+", "C1"];

function getLevelProgress(level: string): number {
  const idx = LEVELS.indexOf(level);
  if (idx === -1) return 0;
  return ((idx + 1) / LEVELS.length) * 100;
}

export function LevelGauge({
  currentLevel,
  targetLevel,
  estimatedWeeks,
  confidence,
}: LevelGaugeProps) {
  const progress = getLevelProgress(currentLevel);
  const target = getLevelProgress(targetLevel);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Current Level</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-4">
          <div className="relative h-32 w-32">
            {/* Background circle */}
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              {/* Target indicator */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted-foreground) / 0.3)"
                strokeWidth="8"
                strokeDasharray={`${target * 2.51} ${251 - target * 2.51}`}
              />
              {/* Current progress */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 251" }}
                animate={{
                  strokeDasharray: `${progress * 2.51} ${251 - progress * 2.51}`,
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{currentLevel}</span>
              <span className="text-xs text-muted-foreground">current</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm">
            Target:{" "}
            <span className="font-bold text-primary">{targetLevel}</span>
          </p>
          {estimatedWeeks < 99 && (
            <p className="text-xs text-muted-foreground">
              Estimated{" "}
              <span className="font-medium">~{estimatedWeeks} weeks</span> at
              current pace
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Prediction confidence:{" "}
            <span
              className={
                confidence === "high"
                  ? "text-green-500"
                  : confidence === "medium"
                    ? "text-yellow-500"
                    : "text-red-500"
              }
            >
              {confidence}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
