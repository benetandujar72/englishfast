import type { SM2Result } from "@/types";

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * @param quality - User's self-assessment (0-5)
 *   0: Complete blackout
 *   1: Incorrect; correct answer remembered on seeing it
 *   2: Incorrect; correct answer seemed easy to recall
 *   3: Correct with serious difficulty
 *   4: Correct after hesitation
 *   5: Perfect response
 * @param repetitions - Current repetition count
 * @param easeFactor - Current ease factor (minimum 1.3)
 * @param interval - Current interval in days
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  // If answer quality is below 3, reset repetitions
  if (quality < 3) {
    return {
      interval: 1,
      easeFactor,
      repetitions: 0,
    };
  }

  // Calculate new interval
  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easeFactor);
  }

  // Calculate new ease factor
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: repetitions + 1,
  };
}

/**
 * Map SM-2 quality to user-friendly labels
 */
export const QUALITY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Blackout", color: "text-red-600" },
  1: { label: "Wrong", color: "text-red-500" },
  2: { label: "Hard", color: "text-orange-500" },
  3: { label: "Difficult", color: "text-yellow-500" },
  4: { label: "Good", color: "text-green-500" },
  5: { label: "Easy", color: "text-green-600" },
};
