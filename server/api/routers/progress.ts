import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const progressRouter = createTRPCRouter({
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    let streak = await ctx.db.streak.findUnique({
      where: { userId: ctx.userId },
    });
    if (!streak) {
      streak = await ctx.db.streak.create({
        data: { userId: ctx.userId },
      });
    }
    return streak;
  }),

  getDailyProgress: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      startDate.setHours(0, 0, 0, 0);

      return ctx.db.dailyProgress.findMany({
        where: {
          userId: ctx.userId,
          date: { gte: startDate },
        },
        orderBy: { date: "asc" },
      });
    }),

  getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const days = await ctx.db.dailyProgress.findMany({
      where: {
        userId: ctx.userId,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    const totalMinutes = days.reduce((sum, d) => sum + d.minutesPracticed, 0);
    const totalWords = days.reduce((sum, d) => sum + d.wordsProduced, 0);

    return {
      days: days.map((d) => ({
        date: d.date.toISOString().split("T")[0],
        minutesPracticed: d.minutesPracticed,
        wordsProduced: d.wordsProduced,
      })),
      totalMinutes,
      totalWords,
    };
  }),

  getErrorSummary: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.errorRecord.findMany({
      where: { userId: ctx.userId, mastered: false },
      orderBy: { frequency: "desc" },
      take: 20,
      select: {
        id: true,
        errorType: true,
        originalText: true,
        correction: true,
        explanation: true,
        grammarPoint: true,
        frequency: true,
        lastSeen: true,
      },
    });
  }),

  getLevelPrediction: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { currentLevel: true, targetLevel: true, createdAt: true },
    });

    const recentProgress = await ctx.db.dailyProgress.findMany({
      where: { userId: ctx.userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    const avgMinutesPerDay =
      recentProgress.length > 0
        ? recentProgress.reduce((sum, d) => sum + d.minutesPracticed, 0) /
          recentProgress.length
        : 0;

    const avgWordsPerDay =
      recentProgress.length > 0
        ? recentProgress.reduce((sum, d) => sum + d.wordsProduced, 0) /
          recentProgress.length
        : 0;

    // Simple estimation: ~200 hours of practice to go from A2 to B2
    const levelHours: Record<string, number> = {
      A1: 0,
      A2: 100,
      "B1": 200,
      "B1+": 300,
      B2: 400,
      "B2+": 500,
      C1: 600,
    };

    const currentHours = levelHours[user?.currentLevel ?? "A2"] ?? 100;
    const targetHours = levelHours[user?.targetLevel ?? "B2"] ?? 400;
    const remainingHours = Math.max(0, targetHours - currentHours);
    const hoursPerDay = avgMinutesPerDay / 60;
    const estimatedWeeks =
      hoursPerDay > 0
        ? Math.ceil(remainingHours / (hoursPerDay * 7))
        : 99;

    return {
      currentLevel: user?.currentLevel ?? "A2",
      targetLevel: user?.targetLevel ?? "B2",
      estimatedWeeks,
      confidence:
        recentProgress.length > 14
          ? "high"
          : recentProgress.length > 7
            ? "medium"
            : ("low" as const),
      avgMinutesPerDay: Math.round(avgMinutesPerDay),
      avgWordsPerDay: Math.round(avgWordsPerDay),
      activeDays: recentProgress.length,
    };
  }),

  updateActivity: protectedProcedure
    .input(
      z.object({
        minutesPracticed: z.number().optional(),
        wordsProduced: z.number().optional(),
        conversationCount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await ctx.db.dailyProgress.upsert({
        where: { userId_date: { userId: ctx.userId, date: today } },
        update: {
          minutesPracticed: input.minutesPracticed
            ? { increment: input.minutesPracticed }
            : undefined,
          wordsProduced: input.wordsProduced
            ? { increment: input.wordsProduced }
            : undefined,
          conversationCount: input.conversationCount
            ? { increment: input.conversationCount }
            : undefined,
        },
        create: {
          userId: ctx.userId,
          date: today,
          minutesPracticed: input.minutesPracticed ?? 0,
          wordsProduced: input.wordsProduced ?? 0,
          conversationCount: input.conversationCount ?? 0,
        },
      });

      // Update streak
      const streak = await ctx.db.streak.findUnique({
        where: { userId: ctx.userId },
      });

      if (streak) {
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
          // Same day, just update lastActivity
          await ctx.db.streak.update({
            where: { userId: ctx.userId },
            data: { lastActivity: new Date() },
          });
        }
      } else {
        await ctx.db.streak.create({
          data: {
            userId: ctx.userId,
            currentDays: 1,
            longestDays: 1,
            totalDays: 1,
            lastActivity: new Date(),
          },
        });
      }
    }),
});
