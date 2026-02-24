"use client";

import { trpc } from "@/lib/trpc/client";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { LevelGauge } from "@/components/dashboard/LevelGauge";
import { ErrorTable } from "@/components/dashboard/ErrorTable";
import { TodayPlanCard } from "@/components/dashboard/TodayPlanCard";
import { NextBestAction } from "@/components/dashboard/NextBestAction";
import { CompetencyFocusCard } from "@/components/dashboard/CompetencyFocusCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearningPlan } from "@/hooks/useLearningPlan";

const MODULE_TO_CARD = {
  SPEAKING: "speaking",
  TRAINER_READING: "entreno",
  VOCABULARY: "vocabulary",
  CHAT: "chat",
  DIARY: "diary",
  EXAM: "exam",
} as const;

const MODULE_TO_HREF = {
  SPEAKING: "/speaking/practice",
  TRAINER_READING: "/entreno",
  VOCABULARY: "/vocabulary",
  CHAT: "/chat",
  DIARY: "/diary",
  EXAM: "/exam",
} as const;

export default function DashboardPage() {
  const { data: streak } = trpc.progress.getStreak.useQuery();
  const { data: dailyProgress } = trpc.progress.getDailyProgress.useQuery({ days: 90 });
  const { data: weeklyStats } = trpc.progress.getWeeklyStats.useQuery();
  const { data: errors } = trpc.progress.getErrorSummary.useQuery();
  const { data: prediction } = trpc.progress.getLevelPrediction.useQuery();
  const { todayTasks, planStats, generateOrRefreshPlan } = useLearningPlan();

  const calendarDays = (dailyProgress ?? []).map((d) => ({
    date: new Date(d.date).toISOString().split("T")[0],
    minutesPracticed: d.minutesPracticed,
  }));

  const doneMinutes =
    planStats.data?.doneMinutes ?? weeklyStats?.days.at(-1)?.minutesPracticed ?? 0;
  const goalMinutes =
    planStats.data?.goalMinutes ??
    (prediction?.avgMinutesPerDay && prediction.avgMinutesPerDay > 0
      ? Math.max(10, prediction.avgMinutesPerDay)
      : 20);

  const todayPlanTasks =
    todayTasks.data?.map((task) => ({
      id: task.id,
      title: task.title,
      module: MODULE_TO_CARD[task.module],
      minutes: task.targetMinutes,
      status: task.status,
      href: MODULE_TO_HREF[task.module],
    })) ?? [];

  const nextPendingTask = todayPlanTasks.find((t) => t.status !== "COMPLETED");

  const competencyItems = [
    { id: "comprension" as const, label: "Comprension", value: Math.min(95, 52 + doneMinutes) },
    { id: "interaccion" as const, label: "Interaccion", value: Math.min(95, 45 + (weeklyStats?.totalSpeakingSessions ?? 0) * 6) },
    { id: "produccion" as const, label: "Produccion", value: Math.min(95, 48 + Math.round((weeklyStats?.totalSpeakingMinutes ?? 0) / 2)) },
    { id: "escritura" as const, label: "Escritura", value: Math.min(95, 40 + Math.round((weeklyStats?.totalWords ?? 0) / 120)) },
  ];

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="surface-hero p-5">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily rhythm, adaptive priorities, and weekly consistency in one place.
        </p>
      </div>

      {weeklyStats ? (
        <TodayPlanCard
          tasks={todayPlanTasks}
          goalMinutes={goalMinutes}
          doneMinutes={doneMinutes}
          onRefresh={() => generateOrRefreshPlan.mutate({ forceRefresh: true })}
        />
      ) : (
        <Skeleton className="h-64 w-full rounded-2xl" />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <NextBestAction
          href={nextPendingTask?.href ?? "/speaking/practice"}
          title={nextPendingTask?.title ?? "Start speaking to build daily momentum"}
          reason={
            nextPendingTask
              ? "This is the next pending task in your adaptive plan."
              : "No pending tasks found. Start with a short speaking block."
          }
          etaMinutes={nextPendingTask?.minutes ?? 10}
        />
        <CompetencyFocusCard
          level={prediction?.currentLevel ?? "A2"}
          items={competencyItems}
        />
      </div>

      {streak ? (
        <StreakCalendar
          days={calendarDays}
          currentStreak={streak.currentDays}
          longestStreak={streak.longestDays}
        />
      ) : (
        <Skeleton className="h-48 w-full rounded-2xl" />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {weeklyStats ? (
          <ProgressChart
            data={weeklyStats.days}
            totalMinutes={weeklyStats.totalMinutes}
            totalWords={weeklyStats.totalWords}
          />
        ) : (
          <Skeleton className="h-64 w-full rounded-2xl" />
        )}

        {prediction ? (
          <LevelGauge
            currentLevel={prediction.currentLevel}
            targetLevel={prediction.targetLevel}
            estimatedWeeks={prediction.estimatedWeeks}
            confidence={prediction.confidence as "high" | "medium" | "low"}
          />
        ) : (
          <Skeleton className="h-64 w-full rounded-2xl" />
        )}
      </div>

      <ErrorTable errors={errors ?? []} />
    </div>
  );
}
