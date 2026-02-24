import type { LearningModule, LearningPace, LearningSkill } from "@prisma/client";

export interface ActivitySnapshot {
  date: Date;
  minutesPracticed: number;
  speakingMinutes: number;
  conversationCount: number;
  wordsProduced: number;
}

export interface SchedulerProfile {
  pace: LearningPace;
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  preferredSessionMinutes: number;
}

export interface GeneratedTaskTemplate {
  skill: LearningSkill;
  module: LearningModule;
  title: string;
  targetMinutes: number;
  targetXp: number;
}

const TASK_POOL: GeneratedTaskTemplate[] = [
  {
    skill: "SPEAKING",
    module: "SPEAKING",
    title: "Speaking precision drill",
    targetMinutes: 10,
    targetXp: 25,
  },
  {
    skill: "READING",
    module: "TRAINER_READING",
    title: "Reading aloud with live feedback",
    targetMinutes: 10,
    targetXp: 22,
  },
  {
    skill: "VOCABULARY",
    module: "VOCABULARY",
    title: "Spaced vocabulary review",
    targetMinutes: 8,
    targetXp: 18,
  },
  {
    skill: "CONVERSATION",
    module: "CHAT",
    title: "Guided conversation round",
    targetMinutes: 10,
    targetXp: 22,
  },
  {
    skill: "WRITING",
    module: "DIARY",
    title: "Short writing diary reflection",
    targetMinutes: 12,
    targetXp: 24,
  },
  {
    skill: "EXAM",
    module: "EXAM",
    title: "Targeted exam mini-practice",
    targetMinutes: 15,
    targetXp: 30,
  },
];

function getTasksPerDayByPace(pace: LearningPace) {
  if (pace === "GENTLE") return 2;
  if (pace === "INTENSIVE") return 4;
  return 3;
}

export function estimateLearningPace(recent: ActivitySnapshot[]): SchedulerProfile {
  if (recent.length === 0) {
    return {
      pace: "GENTLE",
      dailyGoalMinutes: 12,
      weeklyGoalMinutes: 72,
      preferredSessionMinutes: 10,
    };
  }

  const activeDays = recent.filter((d) => d.minutesPracticed > 0).length;
  const totalMinutes = recent.reduce((sum, d) => sum + d.minutesPracticed, 0);
  const avgMinutesActiveDay = totalMinutes / Math.max(1, activeDays);
  const activeRatio = activeDays / Math.max(1, recent.length);

  if (activeRatio >= 0.65 && avgMinutesActiveDay >= 24) {
    return {
      pace: "INTENSIVE",
      dailyGoalMinutes: 30,
      weeklyGoalMinutes: 180,
      preferredSessionMinutes: 15,
    };
  }

  if (activeRatio >= 0.4 && avgMinutesActiveDay >= 12) {
    return {
      pace: "STEADY",
      dailyGoalMinutes: 20,
      weeklyGoalMinutes: 120,
      preferredSessionMinutes: 12,
    };
  }

  return {
    pace: "GENTLE",
    dailyGoalMinutes: 12,
    weeklyGoalMinutes: 72,
    preferredSessionMinutes: 10,
  };
}

function rotateTaskPool(offset: number) {
  return TASK_POOL.map((_, idx) => TASK_POOL[(idx + offset) % TASK_POOL.length]);
}

export function buildDailyTemplates(
  pace: LearningPace,
  dayOffset: number
): GeneratedTaskTemplate[] {
  const perDay = getTasksPerDayByPace(pace);
  return rotateTaskPool(dayOffset).slice(0, perDay);
}

export function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function moduleProgressSignals(module: LearningModule) {
  if (module === "SPEAKING") {
    return { conversationCount: 0, wordsProduced: 50, speakingSessions: 1 };
  }
  if (module === "CHAT") {
    return { conversationCount: 1, wordsProduced: 80, speakingSessions: 0 };
  }
  if (module === "DIARY") {
    return { conversationCount: 0, wordsProduced: 140, speakingSessions: 0 };
  }
  if (module === "VOCABULARY") {
    return { conversationCount: 0, wordsProduced: 40, speakingSessions: 0 };
  }
  if (module === "TRAINER_READING") {
    return { conversationCount: 0, wordsProduced: 90, speakingSessions: 0 };
  }
  return { conversationCount: 0, wordsProduced: 110, speakingSessions: 0 };
}
