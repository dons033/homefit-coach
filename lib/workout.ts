import { EXERCISE_CATALOG, getExerciseInfo } from "./exercise-catalog";

export type Exercise = {
  id: string;
  name: string;
  shortName: string;
  sets: number;
  targetReps: number;
  workSeconds: number;
  restSeconds: number;
  /** For unilateral work: alternate labels per set, e.g. Left/Right */
  sides?: string[];
  cues: string[];
};

export type Workout = {
  id: string;
  name: string;
  tagline: string;
  /** Reserved for later: optional seconds of easy marching before set 1. Unused in v1. */
  warmupSeconds?: number;
  exercises: Exercise[];
};

/** One line per movement. Programming (sets/reps/timers) lives here;
 *  names + cues come from the catalog, so reusing a move is one line. */
type WorkoutEntry = {
  exerciseId: string;
  sets: number;
  targetReps: number;
  workSeconds: number;
  restSeconds: number;
  sides?: string[];
};

function buildExercise(e: WorkoutEntry): Exercise {
  const info = getExerciseInfo(e.exerciseId);
  return {
    id: info.id,
    name: info.name,
    shortName: info.shortName,
    cues: info.cues,
    sets: e.sets,
    targetReps: e.targetReps,
    workSeconds: e.workSeconds,
    restSeconds: e.restSeconds,
    sides: e.sides,
  };
}

function buildWorkout(
  id: string,
  name: string,
  tagline: string,
  entries: WorkoutEntry[],
  warmupSeconds = 0
): Workout {
  // Warn in dev if an id has no catalog entry (still renders via fallback).
  if (typeof console !== "undefined") {
    entries.forEach((e) => {
      if (!EXERCISE_CATALOG[e.exerciseId]) {
        console.warn(`[HomeFit] "${e.exerciseId}" not in EXERCISE_CATALOG — using placeholder.`);
      }
    });
  }
  return { id, name, tagline, warmupSeconds, exercises: entries.map(buildExercise) };
}

export const upperBodyA: Workout = buildWorkout(
  "upper-body-a",
  "Upper Body A",
  "Strength • 6 Exercises • ~40 Minutes",
  [
    // Muscle-preservation programming (GLP-1 friendly):
    // moderate 8–12 rep range, stop 1–2 reps before failure,
    // long rests on compounds (strength needs recovery),
    // shorter rests on isolations to keep the session moving.
    { exerciseId: "bench-press", sets: 3, targetReps: 10, workSeconds: 40, restSeconds: 90 },
    {
      exerciseId: "one-arm-row",
      sets: 6, // 3 per side, alternating L/R/L/R/L/R
      targetReps: 10,
      workSeconds: 40,
      restSeconds: 90,
      sides: ["Left", "Right", "Left", "Right", "Left", "Right"],
    },
    { exerciseId: "shoulder-press", sets: 3, targetReps: 10, workSeconds: 40, restSeconds: 90 },
    { exerciseId: "lateral-raise", sets: 3, targetReps: 12, workSeconds: 40, restSeconds: 60 },
    { exerciseId: "biceps-curl", sets: 3, targetReps: 12, workSeconds: 40, restSeconds: 60 },
    { exerciseId: "triceps-extension", sets: 3, targetReps: 12, workSeconds: 40, restSeconds: 60 },
    // To add a move: add it to EXERCISE_CATALOG, then one line here, e.g.
    // { exerciseId: "goblet-squat", sets: 3, targetReps: 12, workSeconds: 40, restSeconds: 60 },
  ]
  // To enable a warmup later: pass seconds as 5th arg, e.g. buildWorkout(..., 60)
);

export const workouts: Record<string, Workout> = { "upper-body-a": upperBodyA };

export function estimateMinutes(
  w: Workout,
  overrides?: {
    readySeconds?: number;
    workSeconds?: number;
    restSeconds?: number;
    perExercise?: Record<string, { workSeconds?: number; restSeconds?: number }>;
  }
): number {
  const READY = overrides?.readySeconds ?? 5;
  let total = w.warmupSeconds ?? 0;
  w.exercises.forEach((e, i) => {
    const per = overrides?.perExercise?.[e.id];
    const work = per?.workSeconds ?? overrides?.workSeconds ?? e.workSeconds;
    const rest = per?.restSeconds ?? overrides?.restSeconds ?? e.restSeconds;
    total += e.sets * (READY + work);
    // rest after every set except the very last set of the workout
    const restsInExercise = i < w.exercises.length - 1 ? e.sets : e.sets - 1;
    total += restsInExercise * rest;
  });
  return Math.round(total / 60);
}

export function setLabel(ex: Exercise, setNumber: number): string {
  if (ex.sides && ex.sides[setNumber - 1]) return ex.sides[setNumber - 1];
  return "";
}
