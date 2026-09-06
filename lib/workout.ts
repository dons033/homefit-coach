import { EXERCISE_CATALOG, getExerciseInfo } from "./exercise-catalog";

export type Exercise = {
  id: string;
  /** Display name — includes variant label when non-default ("… — Floor"). */
  name: string;
  shortName: string;
  /** Figure key for ExerciseAnimation (resolved from the variant). */
  animationId: string;
  /** Chosen variant id (for pickers/debugging). */
  variantId: string;
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
  focus: ProgramFocus;
  /** Reserved for later: optional seconds of easy marching before set 1. Unused in v1. */
  warmupSeconds?: number;
  exercises: Exercise[];
};

/* Program focuses — one set of basics, programmed many ways.
 * A mass day and an endurance day can both contain bench press;
 * the focus decides reps, rest, and intent. */
export type ProgramFocus = "mass" | "lean" | "strength" | "endurance" | "athleticism";

export const FOCUS_PRESETS: Record<
  ProgramFocus,
  { label: string; blurb: string; reps: string; rest: string }
> = {
  mass: {
    label: "Mass",
    blurb: "Moderate-heavy basics, full recovery. Eat big, sleep big.",
    reps: "6–12",
    rest: "90–180s",
  },
  lean: {
    label: "Lean",
    blurb: "Hold muscle in a deficit. Stop 1–2 reps before failure.",
    reps: "8–12",
    rest: "60–90s",
  },
  strength: {
    label: "Strength",
    blurb: "Heavy compounds, long rests. Few reps, full intent.",
    reps: "3–6",
    rest: "2–4 min",
  },
  endurance: {
    label: "Endurance",
    blurb: "Lighter loads, short rests, high reps. Keep moving.",
    reps: "15+",
    rest: "30–45s",
  },
  athleticism: {
    label: "Athleticism",
    blurb: "Power + balance + control. Single-arm/leg and stance work.",
    reps: "5–10",
    rest: "90–120s",
  },
};

/** One line per movement. Programming (sets/reps/timers) lives here;
 *  names + cues + figures come from the catalog, so reusing a move —
 *  in any focus, any variant — is one line. */
type WorkoutEntry = {
  exerciseId: string;
  variantId?: string;
  sets: number;
  targetReps: number;
  workSeconds: number;
  restSeconds: number;
  sides?: string[];
};

function resolveVariant(info: ReturnType<typeof getExerciseInfo>, variantId?: string) {
  return (
    (variantId && info.variants[variantId]) ||
    info.variants[info.defaultVariant] ||
    Object.values(info.variants)[0]
  );
}

function buildExercise(e: WorkoutEntry): Exercise {
  const info = getExerciseInfo(e.exerciseId);
  const variant = resolveVariant(info, e.variantId);
  const isDefault = variant.id === info.defaultVariant;
  return {
    id: info.id,
    name: isDefault ? info.name : `${info.name} — ${variant.label}`,
    shortName: info.shortName,
    animationId: variant.animationId,
    variantId: variant.id,
    cues: variant.cues,
    sets: e.sets,
    targetReps: e.targetReps,
    workSeconds: e.workSeconds,
    restSeconds: e.restSeconds,
    sides: e.sides,
  };
}

/** Rebuild one exercise of a workout with a different variant,
 *  keeping its programming. Powers the home-screen variant picker. */
export function withVariant(workout: Workout, exerciseId: string, variantId: string): Workout {
  return {
    ...workout,
    exercises: workout.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return buildExercise({
        exerciseId: ex.id,
        variantId,
        sets: ex.sets,
        targetReps: ex.targetReps,
        workSeconds: ex.workSeconds,
        restSeconds: ex.restSeconds,
        sides: ex.sides,
      });
    }),
  };
}

function buildWorkout(
  id: string,
  name: string,
  tagline: string,
  focus: ProgramFocus,
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
  return { id, name, tagline, focus, warmupSeconds, exercises: entries.map(buildExercise) };
}

export const upperBodyA: Workout = buildWorkout(
  "upper-body-a",
  "Upper Body A",
  "Strength • 6 Exercises • ~40 Minutes",
  "lean",
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
  // To enable a warmup later: pass seconds as 6th arg, e.g. buildWorkout(..., 60)
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
