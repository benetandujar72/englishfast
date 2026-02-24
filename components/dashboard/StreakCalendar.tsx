"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface DayData {
  date: string;
  minutesPracticed: number;
}

interface StreakCalendarProps {
  days: DayData[];
  currentStreak: number;
  longestStreak: number;
}

function getIntensity(minutes: number): string {
  if (minutes === 0) return "bg-muted";
  if (minutes < 30) return "bg-cyan-200 dark:bg-cyan-900";
  if (minutes < 60) return "bg-cyan-400 dark:bg-cyan-700";
  if (minutes < 120) return "bg-sky-500 dark:bg-sky-600";
  return "bg-sky-700 dark:bg-sky-500";
}

export function StreakCalendar({
  days,
  currentStreak,
  longestStreak,
}: StreakCalendarProps) {
  // Build 90-day grid
  const today = new Date();
  const dayMap = new Map(days.map((d) => [d.date, d.minutesPracticed]));

  const grid: Array<{ date: string; minutes: number }> = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    grid.push({ date: dateStr, minutes: dayMap.get(dateStr) ?? 0 });
  }

  // Split into weeks (columns)
  const weeks: typeof grid[] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Activity</CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="font-bold">{currentStreak}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Best: {longestStreak}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          "h-3 w-3 rounded-sm",
                          getIntensity(day.minutes)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {day.date}: {day.minutes} min
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {["bg-muted", "bg-cyan-200 dark:bg-cyan-900", "bg-cyan-400 dark:bg-cyan-700", "bg-sky-500 dark:bg-sky-600", "bg-sky-700 dark:bg-sky-500"].map(
              (cls, i) => (
                <div key={i} className={cn("h-3 w-3 rounded-sm", cls)} />
              )
            )}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
