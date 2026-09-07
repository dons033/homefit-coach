// Runnable logic tests: npx tsx lib/__tests__/smoke.ts
// Covers workout math, variant resolution, pacing persistence, catalog queries.

import assert from "node:assert";

// --- minimal browser stubs (pacing/voice guard window access) ---
const store = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
};

import { upperBodyA, withVariant, estimateMinutes, setLabel } from "../workout";
import {
  DEFAULT_PACING,
  loadPacing,
  savePacing,
  perExerciseOverrideCount,
} from "../pacing";
import {
  getExerciseInfo,
  findAlternatives,
  EXERCISE_CATALOG,
} from "../exercise-catalog";

// 1. Catalog integrity: every exercise has a resolvable default variant.
for (const info of Object.values(EXERCISE_CATALOG)) {
  assert.ok(
    info.variants[info.defaultVariant],
    `${info.id} default variant resolves`,
  );
  for (const v of Object.values(info.variants)) {
    assert.ok(v.cues.length >= 2, `${info.id}.${v.id} has cues`);
    assert.ok(v.animationId, `${info.id}.${v.id} has animationId`);
  }
}
// Unknown id falls back without crashing.
assert.equal(getExerciseInfo("nope-not-real").name, "Nope Not Real");

// 2. Workout shape: 6 exercises, 21 sets total.
assert.equal(upperBodyA.exercises.length, 6);
const totalSets = upperBodyA.exercises.reduce((a, e) => a + e.sets, 0);
assert.equal(totalSets, 21);
assert.equal(upperBodyA.focus, "lean");

// 3. Estimate includes six minutes of warm-up and cool-down.
const prog = estimateMinutes(upperBodyA);
assert.equal(prog, 48);
const custom = estimateMinutes(upperBodyA, {
  workSeconds: 20,
  restSeconds: 20,
  readySeconds: 3,
});
assert.ok(custom < prog, `custom ${custom} < programmed ${prog}`);
// Per-exercise override beats global.
const per = estimateMinutes(upperBodyA, {
  workSeconds: 40,
  perExercise: { "bench-press": { workSeconds: 15 } },
});
assert.ok(per < prog && per > custom, `per-exercise ${per} between`);

// 4. withVariant: floor press renames, keeps programming, resolves figure.
const floored = withVariant(upperBodyA, "bench-press", "floor");
const bench = floored.exercises[0];
assert.equal(bench.name, "Dumbbell Bench Press — Floor");
assert.equal(bench.variantId, "floor");
assert.equal(bench.sets, 3);
assert.equal(bench.targetReps, 10);
assert.equal(bench.restSeconds, 90);
assert.equal(bench.animationId, "bench-press");
// Unknown variant id falls back to default (never crashes player).
const bogus = withVariant(upperBodyA, "bench-press", "moon");
assert.equal(bogus.exercises[0].variantId, "bench");

// 5. One-arm row sides: 6 alternating sets.
const row = upperBodyA.exercises[1];
assert.deepEqual(
  [1, 2, 3, 4, 5, 6].map((n) => setLabel(row, n)),
  ["Left", "Right", "Left", "Right", "Left", "Right"],
);
assert.equal(setLabel(upperBodyA.exercises[0], 1), "");

// 6. Pacing persistence round-trip (v2 key) + legacy v1 migration.
savePacing({ ...DEFAULT_PACING, customEnabled: true, workSeconds: 30 });
assert.equal(loadPacing().workSeconds, 30);
assert.equal(loadPacing().customEnabled, true);
savePacing({
  ...DEFAULT_PACING,
  exercises: { "bench-press": { restSeconds: 45, variantId: "floor" } },
});
const loaded = loadPacing();
assert.equal(loaded.exercises["bench-press"]?.restSeconds, 45);
assert.equal(loaded.exercises["bench-press"]?.variantId, "floor");
assert.equal(perExerciseOverrideCount(loaded), 1);
assert.equal(perExerciseOverrideCount(DEFAULT_PACING), 0);
// Clamping: out-of-range values get pulled into limits.
savePacing({ ...DEFAULT_PACING, workSeconds: 9999, restSeconds: -5 });
assert.equal(loadPacing().workSeconds, 120);
assert.equal(loadPacing().restSeconds, 10);
// Corrupt storage never crashes.
store.set("homefit-pacing-v2", "{not json");
assert.deepEqual(loadPacing().customEnabled, DEFAULT_PACING.customEnabled);

// 7. Alternatives query never crashes (empty until catalog grows).
assert.ok(Array.isArray(findAlternatives("bench-press")));

console.log("SMOKE_OK: all logic tests passed");
