import { upperWarmup, upperCooldown, lowerCooldown } from "./preparation";
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
  kind?: "reps" | "hold" | "warmup" | "cooldown";
  optional?: boolean;
  repsPerSide?: number;
};

export type Workout = {
  id: string;
  name: string;
  tagline: string;
  focus: ProgramFocus;
  warmup?: Exercise[];
  cooldown?: Exercise[];
  repBased?: boolean;
  purpose?: string;
  equipment?: string[];
  /** Guided warm-up duration (kept for older consumers). */
  warmupSeconds?: number;
  exercises: Exercise[];
};

/* Program focuses — one set of basics, programmed many ways.
 * A mass day and an endurance day can both contain bench press;
 * the focus decides reps, rest, and intent. */
export type ProgramFocus =
  | "mass"
  | "lean"
  | "strength"
  | "endurance"
  | "athleticism";

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
export type WorkoutEntry = {
  kind?: "reps" | "hold";
  optional?: boolean;
  repsPerSide?: number;
  exerciseId: string;
  variantId?: string;
  sets: number;
  targetReps: number;
  workSeconds: number;
  restSeconds: number;
  sides?: string[];
};

function resolveVariant(
  info: ReturnType<typeof getExerciseInfo>,
  variantId?: string,
) {
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
    kind: e.kind ?? (info.timed ? "hold" : "reps"),
    optional: e.optional,
    repsPerSide: e.repsPerSide,
  };
}

/** Rebuild one exercise of a workout with a different variant,
 *  keeping its programming. Powers the home-screen variant picker. */
export function withVariant(
  workout: Workout,
  exerciseId: string,
  variantId: string,
): Workout {
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
        kind: isPreparation(ex)
          ? undefined
          : (ex.kind as "reps" | "hold" | undefined),
        optional: ex.optional,
        repsPerSide: ex.repsPerSide,
      });
    }),
  };
}

export function buildWorkout(
  id: string,
  name: string,
  tagline: string,
  focus: ProgramFocus,
  entries: WorkoutEntry[],
  warmupSeconds = 0,
): Workout {
  // Warn in dev if an id has no catalog entry (still renders via fallback).
  if (typeof console !== "undefined") {
    entries.forEach((e) => {
      if (!EXERCISE_CATALOG[e.exerciseId]) {
        console.warn(
          `[HomeFit] "${e.exerciseId}" not in EXERCISE_CATALOG — using placeholder.`,
        );
      }
    });
  }
  return {
    id,
    name,
    tagline,
    focus,
    warmupSeconds,
    exercises: entries.map(buildExercise),
  };
}

export const upperBodyA: Workout = {
  ...buildWorkout(
    "upper-body-a",
    "Upper Body A",
    "Strength • 6 Exercises • ~48 Minutes",
    "lean",
    [
      // Muscle-preservation programming (GLP-1 friendly):
      // moderate 8–12 rep range, stop 1–2 reps before failure,
      // long rests on compounds (strength needs recovery),
      // shorter rests on isolations to keep the session moving.
      {
        exerciseId: "bench-press",
        sets: 3,
        targetReps: 10,
        workSeconds: 40,
        restSeconds: 90,
      },
      {
        exerciseId: "one-arm-row",
        sets: 6, // 3 per side, alternating L/R/L/R/L/R
        targetReps: 10,
        workSeconds: 40,
        restSeconds: 90,
        sides: ["Left", "Right", "Left", "Right", "Left", "Right"],
      },
      {
        exerciseId: "shoulder-press",
        sets: 3,
        targetReps: 10,
        workSeconds: 40,
        restSeconds: 90,
      },
      {
        exerciseId: "lateral-raise",
        sets: 3,
        targetReps: 12,
        workSeconds: 40,
        restSeconds: 60,
      },
      {
        exerciseId: "biceps-curl",
        sets: 3,
        targetReps: 12,
        workSeconds: 40,
        restSeconds: 60,
      },
      {
        exerciseId: "triceps-extension",
        sets: 3,
        targetReps: 12,
        workSeconds: 40,
        restSeconds: 60,
      },
      // To add a move: add it to EXERCISE_CATALOG, then one line here, e.g.
      // { exerciseId: "goblet-squat", sets: 3, targetReps: 12, workSeconds: 40, restSeconds: 60 },
    ],
  ),
  warmup: upperWarmup,
  cooldown: upperCooldown,
  warmupSeconds: 180,
};

const lowerWarmup = [
  [
    "march-in-place",
    "March in place",
    "March gently, lifting one knee at a time.",
  ],
  [
    "bodyweight-good-morning",
    "Bodyweight good mornings",
    "Soft knees. Push hips back and keep your spine neutral.",
  ],
  [
    "bodyweight-squat",
    "Bodyweight squats",
    "Keep feet planted and knees tracking over toes.",
  ],
  [
    "bodyweight-reverse-lunge",
    "Alternating reverse lunges",
    "Step back under control. Alternate legs.",
  ],
  [
    "hip-hinge",
    "Hip hinges",
    "Send hips back, then stand tall. Keep a modest knee bend.",
  ],
  [
    "bodyweight-squat",
    "Bodyweight squats",
    "Move smoothly through a comfortable range.",
  ],
].map(
  ([animationId, name, cue], i): Exercise => ({
    id: `lower-warmup-${i}`,
    name,
    shortName: name,
    animationId,
    variantId: "standard",
    sets: 1,
    targetReps: 0,
    workSeconds: 30,
    restSeconds: 0,
    kind: "warmup",
    cues: [cue, "Breathe normally and move at an easy pace."],
  }),
);

export const lowerBodyA: Workout = {
  ...buildWorkout(
    "lower-body-a",
    "LOWER BODY A",
    "Foundational strength · 18 working sets · about 37 minutes",
    "strength",
    [
      {
        exerciseId: "goblet-squat",
        sets: 3,
        targetReps: 10,
        workSeconds: 45,
        restSeconds: 60,
      },
      {
        exerciseId: "romanian-deadlift",
        sets: 3,
        targetReps: 10,
        workSeconds: 45,
        restSeconds: 60,
      },
      {
        exerciseId: "bulgarian-split-squat",
        sets: 4,
        targetReps: 8,
        workSeconds: 45,
        restSeconds: 45,
        sides: ["LEFT LEG", "RIGHT LEG", "LEFT LEG", "RIGHT LEG"],
      },
      {
        exerciseId: "hip-thrust",
        variantId: "bench",
        sets: 3,
        targetReps: 12,
        workSeconds: 45,
        restSeconds: 45,
      },
      {
        exerciseId: "reverse-lunge",
        sets: 2,
        targetReps: 16,
        repsPerSide: 8,
        workSeconds: 50,
        restSeconds: 60,
      },
      {
        exerciseId: "calf-raise",
        sets: 3,
        targetReps: 15,
        workSeconds: 40,
        restSeconds: 30,
      },
      {
        exerciseId: "wall-sit",
        sets: 1,
        targetReps: 0,
        workSeconds: 45,
        restSeconds: 0,
        kind: "hold",
        optional: true,
      },
    ],
    180,
  ),
  warmup: lowerWarmup,
  cooldown: lowerCooldown,
  repBased: true,
  purpose:
    "Foundational lower-body strength: quads, glutes, hamstrings, hip stability, and calves.",
  equipment: ["Dumbbells", "Bench or sturdy chair", "Exercise mat"],
};

export const workouts: Record<string, Workout> = {
  "upper-body-a": upperBodyA,
  "lower-body-a": lowerBodyA,
};

export function repTarget(ex: Exercise): string {
  if (ex.kind === "hold") return `${ex.workSeconds}s hold`;
  if (isPreparation(ex)) return "Easy, controlled movement";
  return ex.repsPerSide
    ? `${ex.repsPerSide} per side (${ex.targetReps} total)`
    : `${ex.targetReps} reps`;
}
export function setDescription(ex: Exercise, setNumber: number): string {
  if (!ex.sides) return `Set ${setNumber} of ${ex.sets}`;
  const side = ex.sides[setNumber - 1];
  const total = ex.sides.filter((s) => s === side).length;
  const current = ex.sides.slice(0, setNumber).filter((s) => s === side).length;
  return `Set ${current} of ${total} · ${side}`;
}

export function estimateMinutes(
  w: Workout,
  overrides?: {
    readySeconds?: number;
    workSeconds?: number;
    restSeconds?: number;
    perExercise?: Record<
      string,
      { workSeconds?: number; restSeconds?: number }
    >;
  },
): number {
  const READY = overrides?.readySeconds ?? 5;
  let total =
    w.warmup?.reduce((n, e) => n + e.workSeconds, 0) ?? w.warmupSeconds ?? 0;
  total += w.cooldown?.reduce((n, e) => n + e.workSeconds, 0) ?? 0;
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

export function isPreparation(ex: Exercise): boolean {
  return ex.kind === "warmup" || ex.kind === "cooldown";
}
/** Fill missing preparation on older built-in snapshots without replacing custom programming. */
export function withPreparation(workout: Workout): Workout {
  const preset = workouts[workout.id];
  if (
    !preset ||
    (workout.warmup !== undefined && workout.cooldown !== undefined)
  )
    return workout;
  return {
    ...workout,
    warmup: workout.warmup ?? structuredClone(preset.warmup),
    cooldown: workout.cooldown ?? structuredClone(preset.cooldown),
  };
}
