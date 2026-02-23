import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { calculateSM2 } from "@/lib/spaced-repetition";

export const vocabularyRouter = createTRPCRouter({
  getDueCards: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.vocabularyItem.findMany({
        where: {
          userId: ctx.userId,
          mastered: false,
          nextReview: { lte: new Date() },
        },
        orderBy: { nextReview: "asc" },
        take: input.limit,
      });
    }),

  review: protectedProcedure
    .input(
      z.object({
        wordId: z.string(),
        quality: z.number().min(0).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.vocabularyItem.findFirst({
        where: { id: input.wordId, userId: ctx.userId },
      });

      if (!item) throw new Error("Vocabulary item not found");

      const result = calculateSM2(
        input.quality,
        item.repetitions,
        item.easeFactor,
        item.interval
      );

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + result.interval);

      return ctx.db.vocabularyItem.update({
        where: { id: input.wordId },
        data: {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReview,
          timesReviewed: { increment: 1 },
          timesCorrect: input.quality >= 3 ? { increment: 1 } : undefined,
          mastered: result.repetitions >= 5 && item.timesCorrect >= 4,
        },
      });
    }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.vocabularyItem.findMany({
        where: {
          userId: ctx.userId,
          OR: [
            { word: { contains: input.query, mode: "insensitive" } },
            { definition: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
        orderBy: { word: "asc" },
      });
    }),

  addFromConversation: protectedProcedure
    .input(
      z.object({
        word: z.string(),
        definition: z.string(),
        exampleSent: z.string(),
        translation: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.vocabularyItem.upsert({
        where: {
          userId_word: { userId: ctx.userId, word: input.word.toLowerCase() },
        },
        update: {
          definition: input.definition,
          exampleSent: input.exampleSent,
        },
        create: {
          userId: ctx.userId,
          word: input.word.toLowerCase(),
          definition: input.definition,
          exampleSent: input.exampleSent,
          translation: input.translation,
          category: input.category ?? "Conversation",
          difficulty: 3,
        },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.vocabularyItem.count({
      where: { userId: ctx.userId },
    });
    const mastered = await ctx.db.vocabularyItem.count({
      where: { userId: ctx.userId, mastered: true },
    });
    const dueToday = await ctx.db.vocabularyItem.count({
      where: {
        userId: ctx.userId,
        mastered: false,
        nextReview: { lte: new Date() },
      },
    });

    return { total, mastered, dueToday, learning: total - mastered };
  }),

  browse: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.vocabularyItem.findMany({
        where: {
          userId: ctx.userId,
          ...(input.category ? { category: input.category } : {}),
        },
        orderBy: { word: "asc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }

      return { items, nextCursor };
    }),
});
