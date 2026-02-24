import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { completePendingTaskForModule } from "@/server/api/learning-task-tracker";

export const conversationRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.conversation.findMany({
      where: { userId: ctx.userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        topic: true,
        mode: true,
        wordCount: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.conversation.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
    }),

  save: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string().optional(),
        topic: z.string().optional(),
        mode: z.enum(["CHAT", "ROLEPLAY", "DEBATE", "INTERVIEW", "STORYTELLING"]),
        messages: z.any(),
        duration: z.number().optional(),
        wordCount: z.number().optional(),
        level: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const conversation = id
        ? await ctx.db.conversation.update({
          where: { id },
          data,
        })
        : await ctx.db.conversation.create({
            data: {
              ...data,
              userId: ctx.userId,
            },
          });

      const meaningfulChat =
        (conversation.wordCount ?? 0) >= 40 || (conversation.duration ?? 0) >= 180;
      if (meaningfulChat) {
        await completePendingTaskForModule(ctx.db, ctx.userId, "CHAT", {
          completedMinutes: conversation.duration
            ? Math.max(6, Math.ceil(conversation.duration / 60))
            : 8,
          earnedXp: Math.max(12, Math.round((conversation.wordCount ?? 40) / 4)),
        });
      }

      return conversation;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.conversation.delete({
        where: { id: input.id },
      });
    }),
});
