import assert from "node:assert/strict";
import {
  upperBodyA,
  lowerBodyA,
  withPreparation,
  withVariant,
  estimateMinutes,
  isPreparation,
} from "../workout";
import { completionStats, workoutSequence } from "../workout-progress";
import { initialCoach, upgradePreparation, validateCoach } from "../coach";
for (const workout of [upperBodyA, lowerBodyA]) {
  for (const kind of ["warmup", "cooldown"] as const) {
    const stages = workout[kind]!;
    assert.equal(stages.length, 6);
    assert.equal(
      stages.reduce((n, e) => n + e.workSeconds, 0),
      180,
    );
    assert.ok(
      stages.every(
        (e) => e.kind === kind && e.targetReps === 0 && e.restSeconds === 0,
      ),
    );
  }
  const sequence = workoutSequence(workout);
  const prepOnly = sequence.flatMap((e, i) =>
    isPreparation(e)
      ? [{ exerciseIndex: i, setNumber: 1, outcome: "completed" as const }]
      : [],
  );
  assert.equal(completionStats(sequence, prepOnly).completedSets, 0);
  assert.equal(completionStats(sequence, prepOnly).completedExercises, 0);
  const bare = { ...workout, warmup: [], cooldown: [], warmupSeconds: 0 };
  assert.equal(estimateMinutes(workout) - estimateMinutes(bare), 6);
  assert.equal(sequence.at(-1)?.kind, "cooldown");
}
const old = withVariant(structuredClone(lowerBodyA), "hip-thrust", "floor");
delete old.cooldown;
old.exercises[0].sets = 2;
const updated = withPreparation(old);
assert.equal(updated.exercises[0].sets, 2);
assert.equal(updated.exercises[3].variantId, "floor");
assert.equal(updated.cooldown?.length, 6);
assert.equal(
  old.cooldown,
  undefined,
  "Upgrade must not mutate stored snapshots",
);
const state = initialCoach("2026-09-07");
state.sessions[0].workout = old;
assert.ok(validateCoach(upgradePreparation(state)));
state.sessions[0].completed = true;
assert.equal(
  upgradePreparation(state).sessions[0].workout?.cooldown,
  undefined,
  "Completed history is preserved",
);
const invalid = structuredClone(initialCoach("2026-09-07"));
invalid.sessions[0].workout!.cooldown![0].kind = "reps";
assert.equal(validateCoach(invalid), false);
console.log(
  "PREPARATION_OK: phase lengths, timing, working-set isolation, upgrade preservation, and schema validation",
);
