import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDailyTemplates,
  estimateLearningPace,
} from "@/server/ai/adaptive/scheduler";

test("estimateLearningPace returns gentle profile for no activity", () => {
  const profile = estimateLearningPace([]);
  assert.equal(profile.pace, "GENTLE");
  assert.equal(profile.dailyGoalMinutes, 12);
});

test("estimateLearningPace returns steady profile for moderate consistency", () => {
  const profile = estimateLearningPace([
    {
      date: new Date("2026-01-01"),
      minutesPracticed: 18,
      speakingMinutes: 8,
      conversationCount: 1,
      wordsProduced: 90,
    },
    {
      date: new Date("2026-01-02"),
      minutesPracticed: 0,
      speakingMinutes: 0,
      conversationCount: 0,
      wordsProduced: 0,
    },
    {
      date: new Date("2026-01-03"),
      minutesPracticed: 20,
      speakingMinutes: 10,
      conversationCount: 1,
      wordsProduced: 120,
    },
    {
      date: new Date("2026-01-04"),
      minutesPracticed: 14,
      speakingMinutes: 4,
      conversationCount: 0,
      wordsProduced: 80,
    },
    {
      date: new Date("2026-01-05"),
      minutesPracticed: 0,
      speakingMinutes: 0,
      conversationCount: 0,
      wordsProduced: 0,
    },
    {
      date: new Date("2026-01-06"),
      minutesPracticed: 16,
      speakingMinutes: 7,
      conversationCount: 1,
      wordsProduced: 85,
    },
    {
      date: new Date("2026-01-07"),
      minutesPracticed: 0,
      speakingMinutes: 0,
      conversationCount: 0,
      wordsProduced: 0,
    },
  ]);

  assert.equal(profile.pace, "STEADY");
  assert.equal(profile.weeklyGoalMinutes, 120);
});

test("estimateLearningPace returns intensive profile for high consistency", () => {
  const base = new Date("2026-01-01");
  const recent = Array.from({ length: 10 }).map((_, idx) => {
    const date = new Date(base);
    date.setDate(base.getDate() + idx);
    return {
      date,
      minutesPracticed: idx === 2 ? 0 : 30,
      speakingMinutes: idx === 2 ? 0 : 12,
      conversationCount: idx === 2 ? 0 : 1,
      wordsProduced: idx === 2 ? 0 : 140,
    };
  });

  const profile = estimateLearningPace(recent);
  assert.equal(profile.pace, "INTENSIVE");
  assert.equal(profile.dailyGoalMinutes, 30);
});

test("buildDailyTemplates adjusts task count by pace", () => {
  assert.equal(buildDailyTemplates("GENTLE", 0).length, 2);
  assert.equal(buildDailyTemplates("STEADY", 1).length, 3);
  assert.equal(buildDailyTemplates("INTENSIVE", 2).length, 4);
});
