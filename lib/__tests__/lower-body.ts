import assert from "node:assert/strict";
import {
  lowerBodyA,
  upperBodyA,
  estimateMinutes,
  setDescription,
  withVariant,
} from "../workout";
import {
  workoutSequence,
  followingSet,
  recordSet,
  completionStats,
  type SetResult,
} from "../workout-progress";
import { initialCoach, validateCoach } from "../coach";
import { EXERCISE_CATALOG } from "../exercise-catalog";
import {
  LOWER_ANIMATION_IDS,
  lowerPose,
} from "../../components/LowerBodyAnimation";

const base = lowerBodyA.exercises.filter((e) => !e.optional);
assert.equal(base.length, 6);
assert.equal(
  base.reduce((n, e) => n + e.sets, 0),
  18,
);
assert.deepEqual(
  base.map((e) => [e.sets, e.targetReps, e.workSeconds, e.restSeconds]),
  [
    [3, 10, 45, 60],
    [3, 10, 45, 60],
    [4, 8, 45, 45],
    [3, 12, 45, 45],
    [2, 16, 50, 60],
    [3, 15, 40, 30],
  ],
);
assert.equal(base[4].repsPerSide, 8);
assert.deepEqual(base[2].sides, [
  "LEFT LEG",
  "RIGHT LEG",
  "LEFT LEG",
  "RIGHT LEG",
]);
assert.equal(setDescription(base[2], 3), "Set 2 of 2 · LEFT LEG");
assert.equal(setDescription(base[2], 4), "Set 2 of 2 · RIGHT LEG");
assert.equal(lowerBodyA.warmup?.length, 6);
assert.equal(
  lowerBodyA.warmup?.reduce((n, e) => n + e.workSeconds, 0),
  180,
);
assert.ok(
  lowerBodyA.warmup?.every((e) => e.restSeconds === 0 && e.kind === "warmup"),
);
const finisher = lowerBodyA.exercises.at(-1)!;
assert.equal(finisher.kind, "hold");
assert.equal(finisher.targetReps, 0);
assert.equal(finisher.workSeconds, 45);
assert.equal(finisher.optional, true);
const sequence = workoutSequence(lowerBodyA);
assert.equal(sequence.length, 19);
assert.deepEqual(followingSet(sequence, 0, 1), {
  exerciseIndex: 1,
  setNumber: 1,
});
assert.deepEqual(followingSet(sequence, 5, 1), {
  exerciseIndex: 6,
  setNumber: 1,
});
assert.deepEqual(followingSet(sequence, 12, 1), {
  exerciseIndex: 13,
  setNumber: 1,
});
assert.equal(followingSet(sequence, 18, 1), null);
let results: SetResult[] = [];
sequence.forEach((e, i) => {
  for (let n = 1; n <= e.sets; n++)
    results = recordSet(results, {
      exerciseIndex: i,
      setNumber: n,
      outcome: e.optional ? "skipped" : "completed",
    });
});
assert.deepEqual(completionStats(sequence, results), {
  completedSets: 18,
  completedExercises: 6,
  allSets: 19,
  allExercises: 7,
});
results = recordSet(results, {
  exerciseIndex: 12,
  setNumber: 1,
  outcome: "completed",
});
assert.equal(completionStats(sequence, results).completedSets, 19);
results = recordSet(results, {
  exerciseIndex: 12,
  setNumber: 1,
  outcome: "completed",
});
assert.equal(
  completionStats(sequence, results).completedSets,
  19,
  "Repeating a set does not double-count it",
);
assert.equal(
  completionStats(sequence, []).completedSets,
  0,
  "Ending early must not invent completed sets",
);
const floor = withVariant(lowerBodyA, "hip-thrust", "floor");
assert.equal(floor.exercises[3].animationId, "glute-bridge");
assert.equal(lowerBodyA.exercises[3].variantId, "bench");
for (const e of sequence)
  assert.ok(
    LOWER_ANIMATION_IDS.has(e.animationId) || e.animationId.startsWith("prep-"),
    e.animationId,
  );
for (const e of base)
  assert.ok(EXERCISE_CATALOG[e.id].variants[e.variantId].dbSteps?.length);
const state = initialCoach("2026-09-06");
state.sessions[0].workout = lowerBodyA;
assert.ok(validateCoach(JSON.parse(JSON.stringify(state))));
const broken = structuredClone(state);
broken.sessions[0].workout!.warmup![0].workSeconds = -1;
assert.equal(validateCoach(broken), false);
const lower = lowerPose("goblet-squat", 0.45),
  top = lowerPose("goblet-squat", 0);
assert.deepEqual(lower.ankles, top.ankles);
assert.equal(lower.shoulder[0], top.shoulder[0]);
assert.ok(lower.hip[1] > top.hip[1]);
const hinge = lowerPose("romanian-deadlift", 0.45);
assert.ok(hinge.hip[0] > lowerPose("romanian-deadlift", 0).hip[0]);
assert.deepEqual(lowerPose("wall-sit", 0), lowerPose("wall-sit", 0.6));
assert.equal(upperBodyA.exercises.length, 6);
assert.ok(estimateMinutes(lowerBodyA) === 37);
console.log(
  `LOWER_BODY_OK: exact programming, warm-up, left/right, hold, completion accounting, variants, persistence, animations; ${estimateMinutes(lowerBodyA)} programmed minutes`,
);
