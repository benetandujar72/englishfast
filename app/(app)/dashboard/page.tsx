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
      <h1 className="text-2xl font-bold">Dashboard</h1>

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
