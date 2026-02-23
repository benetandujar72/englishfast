import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  // Find streaks where last activity was before yesterday (broken streaks)
  const brokenStreaks = await db.streak.findMany({
    where: {
      lastActivity: { lt: yesterday },
      currentDays: { gt: 0 },
    },
  });

  // Reset broken streaks
  for (const streak of brokenStreaks) {
    await db.streak.update({
      where: { id: streak.id },
      data: { currentDays: 0 },
    });
  }

  return NextResponse.json({
    message: `Reset ${brokenStreaks.length} broken streaks`,
    timestamp: new Date().toISOString(),
  });
}
