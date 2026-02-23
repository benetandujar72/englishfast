import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { anthropic } from "@/server/ai/client";
import { CLAUDE_EXAM_MODEL } from "@/server/ai/models";
import {
  buildExamGenerationPrompt,
  buildExamGradingPrompt,
} from "@/server/ai/prompts/exam";

export const examRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        examType: z.enum([
          "USE_OF_ENGLISH",
          "READING",
          "WRITING",
          "LISTENING_TRANSCRIPT",
          "SPEAKING_PROMPT",
        ]),
        part: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { currentLevel: true },
      });

      const response = await anthropic.messages.create({
        model: CLAUDE_EXAM_MODEL,
        max_tokens: 4096,
        system: buildExamGenerationPrompt(
          input.examType,
          input.part,
          user?.currentLevel ?? "A2"
        ),
        messages: [
          {
            role: "user",
            content: `Generate a new Cambridge First ${input.part} exercise.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch?.[0] ?? content.text);
    }),

  submit: protectedProcedure
    .input(
      z.object({
        examType: z.enum([
          "USE_OF_ENGLISH",
          "READING",
          "WRITING",
          "LISTENING_TRANSCRIPT",
          "SPEAKING_PROMPT",
        ]),
        part: z.string(),
        exercise: z.any(),
        answers: z.any(),
        timeSpent: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await anthropic.messages.create({
        model: CLAUDE_EXAM_MODEL,
        max_tokens: 2048,
        system: buildExamGradingPrompt(input.examType, input.part),
        messages: [
          {
            role: "user",
            content: JSON.stringify({
              exercise: input.exercise,
              answers: input.answers,
            }),
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch?.[0] ?? content.text);

      // Save the attempt
      await ctx.db.examAttempt.create({
        data: {
          userId: ctx.userId,
          examType: input.examType,
          part: input.part,
          content: {
            exercise: input.exercise,
            answers: input.answers,
            result,
          },
          score: result.percentage ?? result.score,
          feedback: result.feedback,
          timeSpent: input.timeSpent,
        },
      });

      // Update daily progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await ctx.db.dailyProgress.upsert({
        where: { userId_date: { userId: ctx.userId, date: today } },
        update: {
          examScore: result.percentage ?? result.score,
        },
        create: {
          userId: ctx.userId,
          date: today,
          examScore: result.percentage ?? result.score,
        },
      });

      return result;
    }),

  listAttempts: protectedProcedure
    .input(
      z.object({
        examType: z
          .enum([
            "USE_OF_ENGLISH",
            "READING",
            "WRITING",
            "LISTENING_TRANSCRIPT",
            "SPEAKING_PROMPT",
          ])
          .optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.examAttempt.findMany({
        where: {
          userId: ctx.userId,
          ...(input.examType ? { examType: input.examType } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        select: {
          id: true,
          examType: true,
          part: true,
          score: true,
          feedback: true,
          timeSpent: true,
          createdAt: true,
        },
      });
    }),
});
