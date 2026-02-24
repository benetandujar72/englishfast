"use client";

import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";

export function useLearningPlan() {
  const utils = trpc.useUtils();

  const currentPlan = trpc.scheduler.getCurrentPlan.useQuery(undefined, {
    retry: false,
  });
  const todayTasks = trpc.scheduler.getTodayTasks.useQuery(undefined, {
    retry: false,
  });
  const planStats = trpc.scheduler.getPlanStats.useQuery(undefined, {
    retry: false,
  });

  const generateOrRefreshPlan = trpc.scheduler.generateOrRefreshPlan.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.scheduler.getCurrentPlan.invalidate(),
        utils.scheduler.getTodayTasks.invalidate(),
        utils.scheduler.getPlanStats.invalidate(),
      ]);
    },
  });

  useEffect(() => {
    if (
      currentPlan.data === null &&
      !currentPlan.isLoading &&
      !generateOrRefreshPlan.isPending
    ) {
      generateOrRefreshPlan.mutate({ forceRefresh: false });
    }
  }, [
    currentPlan.data,
    currentPlan.isLoading,
    generateOrRefreshPlan,
    generateOrRefreshPlan.isPending,
  ]);

  return {
    currentPlan,
    todayTasks,
    planStats,
    generateOrRefreshPlan,
  };
}
