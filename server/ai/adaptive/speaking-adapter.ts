import type { SpeakingMode } from "@prisma/client";

export interface SpeakingScoreSnapshot {
  pronunciation: number;
  fluency: number;
  grammar: number;
  lexicalRange: number;
  overall: number;
}

export interface SpeakingAttemptSnapshot {
  mode: SpeakingMode;
  targetLevel: string;
  scores: SpeakingScoreSnapshot;
}

export interface AdaptivePlan {
  nextMode: SpeakingMode;
  nextLevel: string;
  focusSkill: "pronunciation" | "fluency" | "grammar" | "lexicalRange";
  rationale: string;
}

function clampLevel(level: string) {
  const supported = new Set(["A1", "A2", "B1", "B1+", "B2"]);
  return supported.has(level) ? level : "A2";
}

function getFocusSkill(scores: SpeakingScoreSnapshot) {
  const ordered: Array<
    ["pronunciation" | "fluency" | "grammar" | "lexicalRange", number]
  > = [
    ["pronunciation", scores.pronunciation],
    ["fluency", scores.fluency],
    ["grammar", scores.grammar],
    ["lexicalRange", scores.lexicalRange],
  ];
  ordered.sort((a, b) => a[1] - b[1]);
  return ordered[0][0];
}

function shiftLevel(current: string, overall: number) {
  const levels = ["A1", "A2", "B1", "B1+", "B2"];
  const idx = levels.indexOf(clampLevel(current));
  if (overall >= 80 && idx < levels.length - 1) return levels[idx + 1];
  if (overall <= 45 && idx > 0) return levels[idx - 1];
  return levels[idx];
}

export function recommendAdaptivePlan(
  recentAttempts: SpeakingAttemptSnapshot[]
): AdaptivePlan {
  const latest = recentAttempts[0];
  if (!latest) {
    return {
      nextMode: "SHORT_ANSWER",
      nextLevel: "A2",
      focusSkill: "fluency",
      rationale: "First session starts with short and familiar prompts.",
    };
  }

  const focusSkill = getFocusSkill(latest.scores);
  const nextLevel = shiftLevel(latest.targetLevel, latest.scores.overall);

  const modeBySkill: Record<AdaptivePlan["focusSkill"], SpeakingMode> = {
    pronunciation: "PRONUNCIATION",
    fluency: "GUIDED_CONVERSATION",
    grammar: "SHORT_ANSWER",
    lexicalRange: "PICTURE_DESCRIPTION",
  };

  return {
    nextMode: modeBySkill[focusSkill],
    nextLevel,
    focusSkill,
    rationale:
      focusSkill === "pronunciation"
        ? "Prioritize sound clarity before adding complexity."
        : focusSkill === "fluency"
          ? "Increase speaking continuity with guided conversation turns."
          : focusSkill === "grammar"
            ? "Reinforce sentence structure with controlled short answers."
            : "Expand vocabulary using visual prompts and contextual phrasing.",
  };
}
