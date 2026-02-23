"use client";

import { trpc } from "@/lib/trpc/client";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { LevelGauge } from "@/components/dashboard/LevelGauge";
import { ErrorTable } from "@/components/dashboard/ErrorTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: streak } = trpc.progress.getStreak.useQuery();
  const { data: dailyProgress } = trpc.progress.getDailyProgress.useQuery({ days: 90 });
  const { data: weeklyStats } = trpc.progress.getWeeklyStats.useQuery();
  const { data: errors } = trpc.progress.getErrorSummary.useQuery();
  const { data: prediction } = trpc.progress.getLevelPrediction.useQuery();

  const calendarDays = (dailyProgress ?? []).map((d) => ({
    date: new Date(d.date).toISOString().split("T")[0],
    minutesPracticed: d.minutesPracticed,
  }));

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="rounded-2xl border border-white/20 bg-white/75 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your progress, streak, and personalized learning signals.
        </p>
      </div>

      {/* Streak Calendar */}
      {streak ? (
        <StreakCalendar
          days={calendarDays}
          currentStreak={streak.currentDays}
          longestStreak={streak.longestDays}
        />
      ) : (
        <Skeleton className="h-48 w-full" />
      )}

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly stats */}
        {weeklyStats ? (
          <ProgressChart
            data={weeklyStats.days}
            totalMinutes={weeklyStats.totalMinutes}
            totalWords={weeklyStats.totalWords}
          />
        ) : (
          <Skeleton className="h-64 w-full" />
        )}

        {/* Level gauge */}
        {prediction ? (
          <LevelGauge
            currentLevel={prediction.currentLevel}
            targetLevel={prediction.targetLevel}
            estimatedWeeks={prediction.estimatedWeeks}
            confidence={prediction.confidence as "high" | "medium" | "low"}
          />
        ) : (
          <Skeleton className="h-64 w-full" />
        )}
      </div>

      {/* Error table */}
      <ErrorTable errors={errors ?? []} />
    </div>
  );
}
