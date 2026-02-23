"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { LevelGauge } from "@/components/dashboard/LevelGauge";
import { ErrorTable } from "@/components/dashboard/ErrorTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const trpc = useTRPC();

  const { data: streak } = useQuery(trpc.progress.getStreak.queryOptions());
  const { data: dailyProgress } = useQuery(
    trpc.progress.getDailyProgress.queryOptions({ days: 90 })
  );
  const { data: weeklyStats } = useQuery(
    trpc.progress.getWeeklyStats.queryOptions()
  );
  const { data: errors } = useQuery(
    trpc.progress.getErrorSummary.queryOptions()
  );
  const { data: prediction } = useQuery(
    trpc.progress.getLevelPrediction.queryOptions()
  );

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
            confidence={prediction.confidence}
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
