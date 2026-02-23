import { createTRPCRouter } from "./trpc";
import { conversationRouter } from "./routers/conversation";
import { diaryRouter } from "./routers/diary";
import { examRouter } from "./routers/exam";
import { progressRouter } from "./routers/progress";
import { vocabularyRouter } from "./routers/vocabulary";

export const appRouter = createTRPCRouter({
  conversation: conversationRouter,
  diary: diaryRouter,
  exam: examRouter,
  progress: progressRouter,
  vocabulary: vocabularyRouter,
});

export type AppRouter = typeof appRouter;
