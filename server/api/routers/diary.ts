import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { anthropic } from "@/server/ai/client";
import { buildDiaryCorrectionPrompt } from "@/server/ai/prompts/diary";
import type { DiaryFeedback } from "@/types";

export const diaryRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.diaryEntry.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        topic: true,
        wordCount: true,
        feedback: true,
        createdAt: true,
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.diaryEntry.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  submit: protectedProcedure
    .input(
      z.object({
        text: z.string().min(50, "Write at least 50 words"),
        topic: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { currentLevel: true },
      });

      const wordCount = input.text.trim().split(/\s+/).length;

      const response = await anthropic.messages.create({
        model: "claude-opus-4-20250514",
        max_tokens: 4096,
        system: buildDiaryCorrectionPrompt(user?.currentLevel ?? "A2"),
        messages: [{ role: "user", content: input.text }],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      let feedback: DiaryFeedback;
      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        feedback = JSON.parse(jsonMatch?.[0] ?? content.text);
      } catch {
        throw new Error("Failed to parse AI feedback");
      }

      // Save the diary entry
      const entry = await ctx.db.diaryEntry.create({
        data: {
          userId: ctx.userId,
          originalText: input.text,
          correctedText: feedback.correctedText,
          feedback: feedback as unknown as Record<string, unknown>,
          wordCount,
          topic: input.topic,
        },
      });

      // Log errors for tracking
      if (feedback.errors?.length) {
        for (const error of feedback.errors.slice(0, 10)) {
          await ctx.db.errorRecord.upsert({
            where: {
              id: `${ctx.userId}-${error.original.substring(0, 50)}`,
            },
            update: {
              frequency: { increment: 1 },
              lastSeen: new Date(),
            },
            create: {
              userId: ctx.userId,
              errorType: mapErrorType(error.type),
              originalText: error.original,
              correction: error.correction,
              explanation: error.explanation,
            },
          });
        }
      }

      // Update daily progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await ctx.db.dailyProgress.upsert({
        where: { userId_date: { userId: ctx.userId, date: today } },
        update: {
          diaryWords: { increment: wordCount },
          errorsCount: { increment: feedback.errors?.length ?? 0 },
        },
        create: {
          userId: ctx.userId,
          date: today,
          diaryWords: wordCount,
          errorsCount: feedback.errors?.length ?? 0,
        },
      });

      return { entry, feedback };
    }),
});

function mapErrorType(type: string) {
  const mapping: Record<string, string> = {
    grammar: "GRAMMAR",
    vocabulary: "VOCABULARY",
    spelling: "SPELLING",
    preposition: "PREPOSITION",
    article: "ARTICLE",
    tense: "TENSE",
    word_order: "WORD_ORDER",
    collocation: "COLLOCATION",
    false_friend: "FALSE_FRIEND",
  };
  return (mapping[type.toLowerCase()] ?? "GRAMMAR") as any;
}
