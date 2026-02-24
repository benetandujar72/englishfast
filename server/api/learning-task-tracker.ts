import type { LearningModule, PrismaClient } from "@prisma/client";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function completePendingTaskForModule(
  db: PrismaClient,
  userId: string,
  module: LearningModule,
  options?: {
    completedMinutes?: number;
    earnedXp?: number;
  }
) {
  const today = startOfToday();

  const activePlan = await db.learningPlan.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      endDate: { gte: today },
    },
    select: { id: true },
    orderBy: { startDate: "desc" },
  });

  if (!activePlan) {
    return null;
  }

  const task = await db.learningTask.findFirst({
    where: {
      userId,
      planId: activePlan.id,
      dayDate: today,
      module,
      status: "PENDING",
    },
    orderBy: { orderIndex: "asc" },
  });

  if (!task) {
    return null;
  }

  return db.learningTask.update({
    where: { id: task.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completedMinutes: options?.completedMinutes ?? task.targetMinutes,
      earnedXp: options?.earnedXp ?? task.targetXp,
    },
  });
}
