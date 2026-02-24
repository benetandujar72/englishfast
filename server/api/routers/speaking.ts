import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { recommendAdaptivePlan } from "@/server/ai/adaptive/speaking-adapter";
import { completePendingTaskForModule } from "@/server/api/learning-task-tracker";

const speakingModeSchema = z.enum([
  "PRONUNCIATION",
  "SHORT_ANSWER",
  "PICTURE_DESCRIPTION",
  "GUIDED_CONVERSATION",
]);

export const speakingRouter = createTRPCRouter({
  listSessions: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.speakingSession.findMany({
        where: { userId: ctx.userId },
        include: {
          attempts: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
      });
    }),

  getSessionById: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.speakingSession.findFirst({
        where: { id: input.sessionId, userId: ctx.userId },
        include: {
          attempts: {
            orderBy: { attemptIndex: "desc" },
          },
        },
      });
    }),

  startSession: protectedProcedure
    .input(
      z.object({
        mode: speakingModeSchema.default("SHORT_ANSWER"),
        topic: z.string().optional(),
        targetLevel: z.string().default("A2"),
        sourceImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.speakingSession.create({
        data: {
          userId: ctx.userId,
          mode: input.mode,
          topic: input.topic,
          targetLevel: input.targetLevel,
          sourceImageUrl: input.sourceImageUrl,
        },
      });
    }),

  saveAttempt: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        mode: speakingModeSchema,
        targetLevel: z.string(),
        promptText: z.string().min(3),
        transcript: z.string().default(""),
        referenceAnswer: z.string().optional(),
        strength: z.string().optional(),
        priorityFix: z.string().optional(),
        retryPrompt: z.string().optional(),
        scores: z.object({
          pronunciation: z.number(),
          fluency: z.number(),
          grammar: z.number(),
          lexicalRange: z.number(),
          overall: z.number(),
        }),
        estimatedLevel: z.string().optional(),
        feedback: z.any().optional(),
        durationSec: z.number().optional(),
        audioMimeType: z.string().optional(),
        audioSizeBytes: z.number().optional(),
        imageMimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.speakingSession.findFirst({
        where: { id: input.sessionId, userId: ctx.userId },
        include: { attempts: true },
      });

      if (!session) {
        throw new Error("Speaking session not found.");
      }

      const attemptIndex = session.attempts.length + 1;
      const attempt = await ctx.db.speakingAttempt.create({
        data: {
          sessionId: session.id,
          userId: ctx.userId,
          attemptIndex,
          mode: input.mode,
          promptText: input.promptText,
          userTranscript: input.transcript,
          referenceAnswer: input.referenceAnswer,
          strength: input.strength,
          priorityFix: input.priorityFix,
          retryPrompt: input.retryPrompt,
          pronunciationScore: input.scores.pronunciation,
          fluencyScore: input.scores.fluency,
          grammarScore: input.scores.grammar,
          lexicalScore: input.scores.lexicalRange,
          overallScore: input.scores.overall,
          estimatedLevel: input.estimatedLevel,
          durationSec: input.durationSec,
          audioMimeType: input.audioMimeType,
          audioSizeBytes: input.audioSizeBytes,
          imageMimeType: input.imageMimeType,
          feedback: input.feedback,
        },
      });

      const allScores = [...session.attempts, attempt]
        .map((a) => a.overallScore)
        .filter((n): n is number => typeof n === "number");
      const averageScore =
        allScores.length > 0
          ? Number(
              (allScores.reduce((sum, n) => sum + n, 0) / allScores.length).toFixed(
                1
              )
            )
          : null;

      await ctx.db.speakingSession.update({
        where: { id: session.id },
        data: {
          mode: input.mode,
          averageScore: averageScore ?? undefined,
          durationSec: input.durationSec ?? undefined,
          status: "COMPLETED",
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await ctx.db.dailyProgress.findUnique({
        where: { userId_date: { userId: ctx.userId, date: today } },
      });

      const speakingSessions = (existing?.speakingSessions ?? 0) + 1;
      const previousAvg = existing?.speakingAvgScore ?? input.scores.overall;
      const speakingAvgScore = Number(
        (
          (previousAvg * (speakingSessions - 1) + input.scores.overall) /
          speakingSessions
        ).toFixed(1)
      );

      await ctx.db.dailyProgress.upsert({
        where: { userId_date: { userId: ctx.userId, date: today } },
        update: {
          minutesPracticed: input.durationSec
            ? { increment: Math.ceil(input.durationSec / 60) }
            : undefined,
          speakingMinutes: input.durationSec
            ? { increment: Math.ceil(input.durationSec / 60) }
            : undefined,
          speakingSessions: { increment: 1 },
          speakingAvgScore,
        },
        create: {
          userId: ctx.userId,
          date: today,
          minutesPracticed: input.durationSec
            ? Math.ceil(input.durationSec / 60)
            : 0,
          speakingMinutes: input.durationSec ? Math.ceil(input.durationSec / 60) : 0,
          speakingSessions: 1,
          speakingAvgScore,
        },
      });

      await completePendingTaskForModule(ctx.db, ctx.userId, "SPEAKING", {
        completedMinutes: input.durationSec ? Math.ceil(input.durationSec / 60) : 10,
        earnedXp: Math.max(15, Math.round(input.scores.overall / 3)),
      });

      return attempt;
    }),

  getAdaptiveNext: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const attempts = await ctx.db.speakingAttempt.findMany({
        where: { sessionId: input.sessionId, userId: ctx.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      return recommendAdaptivePlan(
        attempts.map((a) => ({
          mode: a.mode,
          targetLevel: a.estimatedLevel ?? "A2",
          scores: {
            pronunciation: a.pronunciationScore ?? 60,
            fluency: a.fluencyScore ?? 60,
            grammar: a.grammarScore ?? 60,
            lexicalRange: a.lexicalScore ?? 60,
            overall: a.overallScore ?? 60,
          },
        }))
      );
    }),
});
