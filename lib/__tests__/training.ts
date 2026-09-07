import assert from "node:assert/strict";
import { rollingCoverage, validActivity } from "../training";
import { initialCoach, validateCoach, type Session } from "../coach";

const activity = (date: string, extra: Partial<Session> = {}): Session => ({ id: date, date, title: "P90X", kind: "external", purpose: "lean", minutes: 30, notes: "", completed: true, ...extra });
const result = rollingCoverage([
  activity("2026-09-01", { activity: { program: "Walk", focus: ["cardio", "cardio"] } }),
  activity("2026-08-31"), activity("2026-09-08"),
  activity("2026-09-07", { completed: false }),
  activity("2026-09-06"),
], "2026-09-07");
assert.equal(result.from, "2026-09-01");
assert.equal(result.recent.length, 2);
assert.equal(result.evidence.cardio.length, 1);
assert.deepEqual(result.unknown, ["P90X"]);
assert.equal(result.evidence.push.length, 0, "Brand names must not invent exposure");
const state = initialCoach("2026-09-07");
assert(validateCoach(state), "Old storage remains compatible");
state.sessions[0].completed = true;
assert.equal(rollingCoverage(state.sessions, "2026-09-07").evidence.push.length, 1);
state.sessions[0].completedSets = 1;
assert.equal(rollingCoverage(state.sessions, "2026-09-07").evidence.push.length, 0, "Partial aggregate sets cannot allocate exercises");
state.sessions[0].completed = false;
assert.equal(rollingCoverage(state.sessions, "2026-09-07").unknown.length, 1, "Saved partial runs remain visible as unknown");
assert.equal(rollingCoverage([], "2026-03-10").from, "2026-03-04");
assert(validActivity({program: "Yoga", focus: ["mobility"], effort: 4, miles: 0}));
assert(!validActivity({program: "Yoga", focus: ["magic"]}));
assert(!validActivity({program: "Yoga", focus: [], effort: 11}));
assert(!validActivity({program: "Walk", focus: [], steps: -1}));
console.log("Training coverage tests passed");
