import assert from "node:assert/strict";
import {
  initialCoach,
  validateCoach,
  weekDates,
  shiftDate,
  localCoach,
} from "../coach";
import { buildWorkout } from "../workout";
async function main() {
  assert.deepEqual(weekDates("2026-09-06"), [
    "2026-08-31",
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
    "2026-09-05",
    "2026-09-06",
  ]);
  assert.equal(shiftDate("2026-12-31", 1), "2027-01-01");
  assert.equal(shiftDate("2026-03-08", 1), "2026-03-09");
  const state = initialCoach("2026-09-06");
  assert.ok(validateCoach(JSON.parse(JSON.stringify(state))));
  assert.equal(validateCoach({ ...state, sessions: [null] }), false);
  assert.equal(
    validateCoach({
      ...state,
      sessions: [{ ...state.sessions[0], workout: { exercises: [{}] } }],
    }),
    false,
  );
  const before = JSON.stringify(state);
  const response = await localCoach.propose("Move my workout to tomorrow", {
    date: "2026-09-06",
    sessions: state.sessions,
  });
  assert.equal(response.proposal?.patch.date, "2026-09-07");
  assert.equal(
    JSON.stringify(state),
    before,
    "Proposals cannot mutate the plan",
  );
  assert.equal(
    (
      await localCoach.propose("move", {
        date: "2026-09-08",
        sessions: state.sessions,
      })
    ).proposal,
    undefined,
  );
  const work = buildWorkout("reuse", "Reusable bench", "", "mass", [
    {
      exerciseId: "bench-press",
      variantId: "floor",
      sets: 2,
      targetReps: 8,
      workSeconds: 32,
      restSeconds: 90,
    },
  ]);
  assert.equal(work.exercises[0].variantId, "floor");
  assert.equal(
    state.sessions[0].workout?.exercises[0].variantId,
    "bench",
    "Composing a new workout leaves other workouts unchanged",
  );
  console.log(
    "COACH_OK: dates, persistence validation, proposals, and exercise reuse",
  );
}
void main();
