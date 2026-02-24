import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  addDays,
  buildDailyTemplates,
  estimateLearningPace,
  moduleProgressSignals,
  startOfToday,
} from "@/server/ai/adaptive/scheduler";

function assertSchedulerEnabled() {
  if (process.env.FEATURE_LEARNING_SCHEDULER === "false") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Learning scheduler feature is disabled.",
    });
  }
}

async function updateStreakForToday(ctx: {
  db: {
    streak: {
      findUnique: Function;
      update: Function;
      create: Function;
    };
  };
  userId: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await ctx.db.streak.findUnique({
    where: { userId: ctx.userId },
  });

  if (!streak) {
    await ctx.db.streak.create({
      data: {
        userId: ctx.userId,
        currentDays: 1,
        longestDays: 1,
        totalDays: 1,
        lastActivity: new Date(),
      },
    });
    return;
  }

  const lastActivity = new Date(streak.lastActivity);
  lastActivity.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    await ctx.db.streak.update({
      where: { userId: ctx.userId },
      data: {
        currentDays: { increment: 1 },
        longestDays: Math.max(streak.longestDays, streak.currentDays + 1),
        lastActivity: new Date(),
        totalDays: { increment: 1 },
      },
    });
  } else if (diffDays > 1) {
    await ctx.db.streak.update({
      where: { userId: ctx.userId },
      data: {
        currentDays: 1,
        lastActivity: new Date(),
        totalDays: { increment: 1 },
      },
    });
  } else {
    await ctx.db.streak.update({
      where: { userId: ctx.userId },
      data: { lastActivity: new Date() },
    });
  }
}

export const schedulerRouter = createTRPCRouter({
  getCurrentPlan: protectedProcedure.query(async ({ ctx }) => {
    assertSchedulerEnabled();
    const today = startOfToday();
    return ctx.db.learningPlan.findFirst({
      where: {
        userId: ctx.userId,
        status: "ACTIVE",
        endDate: { gte: today },
      },
      include: {
        tasks: {
          orderBy: [{ dayDate: "asc" }, { orderIndex: "asc" }],
        },
      },
      orderBy: { startDate: "desc" },
    });
  }),

  getTodayTasks: protectedProcedure.query(async ({ ctx }) => {
    assertSchedulerEnabled();
    const today = startOfToday();

    const activePlan = await ctx.db.learningPlan.findFirst({
      where: {
        userId: ctx.userId,
        status: "ACTIVE",
        endDate: { gte: today },
      },
      orderBy: { startDate: "desc" },
    });

    if (!activePlan) {
      return [];
    }

    return ctx.db.learningTask.findMany({
      where: {
        userId: ctx.userId,
        planId: activePlan.id,
        dayDate: today,
      },
      orderBy: { orderIndex: "asc" },
    });
  }),

  generateOrRefreshPlan: protectedProcedure
    .input(
      z.object({
        forceRefresh: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertSchedulerEnabled();
      const today = startOfToday();

      const existing = await ctx.db.learningPlan.findFirst({
        where: {
          userId: ctx.userId,
          status: "ACTIVE",
          endDate: { gte: today },
        },
        include: {
          tasks: {
            where: { dayDate: today },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { startDate: "desc" },
      });

      if (existing && !input.forceRefresh) {
        return existing;
      }

      if (existing && input.forceRefresh) {
        await ctx.db.learningPlan.update({
          where: { id: existing.id },
          data: { status: "ARCHIVED" },
        });
      }

      const from = addDays(today, -30);
      const recentProgress = await ctx.db.dailyProgress.findMany({
        where: {
          userId: ctx.userId,
          date: { gte: from },
        },
        orderBy: { date: "asc" },
      });

      const profile = estimateLearningPace(recentProgress);

      await ctx.db.userLearningProfile.upsert({
        where: { userId: ctx.userId },
        update: {
          pace: profile.pace,
          dailyGoalMinutes: profile.dailyGoalMinutes,
          weeklyGoalMinutes: profile.weeklyGoalMinutes,
          preferredSessionMinutes: profile.preferredSessionMinutes,
        },
        create: {
          userId: ctx.userId,
          pace: profile.pace,
          dailyGoalMinutes: profile.dailyGoalMinutes,
          weeklyGoalMinutes: profile.weeklyGoalMinutes,
          preferredSessionMinutes: profile.preferredSessionMinutes,
        },
      });

      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { targetLevel: true },
      });

      const plan = await ctx.db.learningPlan.create({
        data: {
          userId: ctx.userId,
          status: "ACTIVE",
          startDate: today,
          endDate: addDays(today, 6),
          targetLevel: user?.targetLevel ?? "B1",
          goalMinutes: profile.weeklyGoalMinutes,
          goalXp: profile.weeklyGoalMinutes * 2,
        },
      });

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const dayDate = addDays(today, dayOffset);
        const templates = buildDailyTemplates(profile.pace, dayOffset);
        await ctx.db.learningTask.createMany({
          data: templates.map((task, idx) => ({
            planId: plan.id,
            userId: ctx.userId,
            dayDate,
            orderIndex: idx + 1,
            skill: task.skill,
            module: task.module,
            title: task.title,
            targetMinutes: task.targetMinutes,
            targetXp: task.targetXp,
          })),
        });
      }

      return ctx.db.learningPlan.findUnique({
        where: { id: plan.id },
        include: {
          tasks: {
            where: { dayDate: today },
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    }),

  completeTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        completedMinutes: z.number().min(1).max(180).optional(),
        earnedXp: z.number().min(1).max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertSchedulerEnabled();
      const task = await ctx.db.learningTask.findFirst({
        where: { id: input.taskId, userId: ctx.userId },
      });

      if (!task) {
        throw new Error("Learning task not found.");
      }

      if (task.status === "COMPLETED") {
        return task;
      }

      const completedMinutes = input.completedMinutes ?? task.targetMinutes;
      const earnedXp = input.earnedXp ?? task.targetXp;

      const updatedTask = await ctx.db.learningTask.update({
        where: { id: task.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          completedMinutes,
          earnedXp,
        },
      });

      const moduleSignals = moduleProgressSignals(task.module);

      await ctx.db.dailyProgress.upsert({
        where: {
          userId_date: {
            userId: ctx.userId,
            date: task.dayDate,
          },
        },
        update: {
          minutesPracticed: { increment: completedMinutes },
          speakingMinutes:
            task.module === "SPEAKING" || task.module === "TRAINER_READING"
              ? { increment: completedMinutes }
              : undefined,
          speakingSessions:
            moduleSignals.speakingSessions > 0
              ? { increment: moduleSignals.speakingSessions }
              : undefined,
          conversationCount:
            moduleSignals.conversationCount > 0
              ? { increment: moduleSignals.conversationCount }
              : undefined,
          wordsProduced: { increment: moduleSignals.wordsProduced },
          xpEarned: { increment: earnedXp },
        },
        create: {
          userId: ctx.userId,
          date: task.dayDate,
          minutesPracticed: completedMinutes,
          speakingMinutes:
            task.module === "SPEAKING" || task.module === "TRAINER_READING"
              ? completedMinutes
              : 0,
          speakingSessions: moduleSignals.speakingSessions,
          conversationCount: moduleSignals.conversationCount,
          wordsProduced: moduleSignals.wordsProduced,
          xpEarned: earnedXp,
        },
      });

      await updateStreakForToday(ctx);

      return updatedTask;
    }),

  skipTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      assertSchedulerEnabled();
      const task = await ctx.db.learningTask.findFirst({
        where: { id: input.taskId, userId: ctx.userId },
      });

      if (!task) {
        throw new Error("Learning task not found.");
      }

      if (task.status === "COMPLETED") {
        return task;
      }

      return ctx.db.learningTask.update({
        where: { id: task.id },
        data: { status: "SKIPPED" },
      });
    }),

  getPlanStats: protectedProcedure.query(async ({ ctx }) => {
    assertSchedulerEnabled();
    const today = startOfToday();
    const plan = await ctx.db.learningPlan.findFirst({
      where: {
        userId: ctx.userId,
        status: "ACTIVE",
        endDate: { gte: today },
      },
      include: {
        tasks: true,
      },
      orderBy: { startDate: "desc" },
    });

    if (!plan) {
      return null;
    }

    const totals = plan.tasks.reduce(
      (acc, task) => {
        acc.total += 1;
        acc.goalMinutes += task.targetMinutes;
        acc.goalXp += task.targetXp;
        acc.doneMinutes += task.completedMinutes;
        acc.doneXp += task.earnedXp;
        if (task.status === "COMPLETED") acc.completed += 1;
        if (task.status === "SKIPPED") acc.skipped += 1;
        return acc;
      },
      {
        total: 0,
        completed: 0,
        skipped: 0,
        goalMinutes: 0,
        goalXp: 0,
        doneMinutes: 0,
        doneXp: 0,
      }
    );

    return {
      planId: plan.id,
      status: plan.status,
      startDate: plan.startDate,
      endDate: plan.endDate,
      ...totals,
      pending: totals.total - totals.completed - totals.skipped,
    };
  }),
});
