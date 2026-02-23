import test from "node:test";
import assert from "node:assert/strict";
import { recommendAdaptivePlan } from "@/server/ai/adaptive/speaking-adapter";

test("recommendAdaptivePlan returns default plan without attempts", () => {
  const plan = recommendAdaptivePlan([]);
  assert.equal(plan.nextMode, "SHORT_ANSWER");
  assert.equal(plan.nextLevel, "A2");
});

test("recommendAdaptivePlan prioritizes weakest skill", () => {
  const plan = recommendAdaptivePlan([
    {
      mode: "GUIDED_CONVERSATION",
      targetLevel: "A2",
      scores: {
        pronunciation: 80,
        fluency: 75,
        grammar: 60,
        lexicalRange: 78,
        overall: 72,
      },
    },
  ]);

  assert.equal(plan.focusSkill, "grammar");
  assert.equal(plan.nextMode, "SHORT_ANSWER");
});

test("recommendAdaptivePlan downshifts level when score is very low", () => {
  const plan = recommendAdaptivePlan([
    {
      mode: "PICTURE_DESCRIPTION",
      targetLevel: "B1",
      scores: {
        pronunciation: 40,
        fluency: 38,
        grammar: 35,
        lexicalRange: 44,
        overall: 39,
      },
    },
  ]);

  assert.equal(plan.nextLevel, "A2");
});
