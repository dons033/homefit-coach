/* Exercise catalog — the ONE place to add a new movement or variant.
 *
 * MODEL (long-run: hundreds of moves, mix-and-match days, infinite programs):
 *   Exercise  = the movement family ("bench-press").
 *               Owns muscles + equipment (powers future Swap + day-builder
 *               queries) and a map of variants.
 *   Variant   = one concrete way to do it ("floor" vs "bench").
 *               Owns the FULL cue list (no merge magic), the figure to render,
 *               and variant equipment (floor needs no bench).
 *   Workout   = named list of { exerciseId, variantId, sets/reps/timers }.
 *               Programming lives on the entry, so the same bench press can
 *               appear in a mass day (heavy, long rest) and an endurance day
 *               (light, short rest) without duplicating the movement.
 *   Focus     = program flavor (mass/lean/strength/endurance/athleticism),
 *               defined in lib/workout.ts as programming presets.
 *
 * FUTURE VARIANT DIMENSIONS (don't add until a real variant needs them):
 *   stance (bilateral / unilateral / balance), tempo, ROM stops.
 *
 * HOW TO ADD AN EXERCISE:
 *   1. Add one entry below with muscles + at least a "standard" variant.
 *   2. Reference it from a workout in lib/workout.ts (one line).
 *   3. Optional: custom figure in ExerciseAnimation.tsx under animationId,
 *      form photos in public/form/<id>/. Both fall back gracefully.
 */

export type Variant = {
  id: string;
  label: string;
  /** Complete cue list for THIS variant. */
  cues: string[];
  /** Figure key in ExerciseAnimation.tsx (may be shared across variants). */
  animationId: string;
  /** Equipment needed for this variant (overrides exercise default). */
  equipment?: string[];
  /** Why/when to choose it. Shown in the variant picker. */
  notes?: string;
};

export type ExerciseInfo = {
  id: string;
  name: string;
  shortName: string;
  /** Primary movers first. Powers future swap + day-builder queries. */
  muscles: string[];
  equipment: string[];
  variants: Record<string, Variant>;
  defaultVariant: string;
};

const standard = (
  cues: string[],
  animationId: string,
  extra?: Partial<Variant>
): Record<string, Variant> => ({
  standard: { id: "standard", label: "Standard", cues, animationId, ...extra },
});

export const EXERCISE_CATALOG: Record<string, ExerciseInfo> = {
  "bench-press": {
    id: "bench-press",
    name: "Dumbbell Bench Press",
    shortName: "Bench Press",
    muscles: ["chest", "shoulders", "triceps"],
    equipment: ["dumbbells", "bench"],
    defaultVariant: "bench",
    variants: {
      bench: {
        id: "bench",
        label: "Bench",
        animationId: "bench-press",
        cues: [
          "Lie on a bench with a dumbbell in each hand.",
          "Start with dumbbells at chest level, palms forward.",
          "Press up until arms are nearly straight (don't lock elbows).",
          "Lower with control, elbows about 45° from your body.",
        ],
      },
      floor: {
        id: "floor",
        label: "Floor",
        animationId: "bench-press",
        equipment: ["dumbbells"],
        notes: "No bench needed. The floor stops your range at torso level.",
        cues: [
          "Lie on the floor, knees bent, feet flat.",
          "Start with dumbbells at chest level, upper arms resting on the floor.",
          "Press up until arms are nearly straight (don't lock elbows).",
          "Lower until your upper arms touch the floor — that's your depth stop.",
        ],
      },
    },
  },
  "one-arm-row": {
    id: "one-arm-row",
    name: "One-Arm Dumbbell Row",
    shortName: "One-Arm Row",
    muscles: ["back", "biceps"],
    equipment: ["dumbbells", "bench"],
    defaultVariant: "standard",
    variants: standard(
      [
        "One knee + hand on bench, back flat like a table.",
        "Let the dumbbell hang, then row to your hip.",
        "Keep elbow close to your body, squeeze at the top.",
        "Lower slowly. No twisting or jerking.",
      ],
      "one-arm-row"
    ),
  },
  "shoulder-press": {
    id: "shoulder-press",
    name: "Dumbbell Shoulder Press",
    shortName: "Shoulder Press",
    muscles: ["shoulders", "triceps"],
    equipment: ["dumbbells"],
    defaultVariant: "standard",
    variants: standard(
      [
        "Stand or sit tall, dumbbells at shoulder height.",
        "Palms face forward, ribs down, core braced.",
        "Press overhead until arms are nearly straight.",
        "Lower to shoulders with control.",
      ],
      "shoulder-press"
    ),
  },
  "lateral-raise": {
    id: "lateral-raise",
    name: "Dumbbell Lateral Raise",
    shortName: "Lat Raise",
    muscles: ["shoulders"],
    equipment: ["dumbbells"],
    defaultVariant: "standard",
    variants: standard(
      [
        "Stand tall, light dumbbells at your sides.",
        "Raise arms out to shoulder height, slight elbow bend.",
        "Lead with elbows, don't shrug your shoulders.",
        "Lower slowly. No swinging.",
      ],
      "lateral-raise"
    ),
  },
  "biceps-curl": {
    id: "biceps-curl",
    name: "Dumbbell Biceps Curl",
    shortName: "Biceps Curl",
    muscles: ["biceps", "forearms"],
    equipment: ["dumbbells"],
    defaultVariant: "standard",
    variants: standard(
      [
        "Stand tall, elbows pinned at your sides.",
        "Curl both dumbbells to shoulder height.",
        "Keep wrists straight, don't swing your back.",
        "Lower all the way down with control.",
      ],
      "biceps-curl"
    ),
  },
  "triceps-extension": {
    id: "triceps-extension",
    name: "Dumbbell Triceps Extension",
    shortName: "Triceps Extension",
    muscles: ["triceps"],
    equipment: ["dumbbells"],
    defaultVariant: "standard",
    variants: standard(
      [
        "Stand tall, one or two dumbbells overhead.",
        "Keep elbows close to your head, pointing up.",
        "Lower behind your head, then press straight up.",
        "Don't let elbows flare wide.",
      ],
      "triceps-extension"
    ),
  },
};

export function getExerciseInfo(id: string): ExerciseInfo {
  const found = EXERCISE_CATALOG[id];
  if (found) return found;
  // Graceful fallback so a workout entry never crashes the player,
  // even before its catalog entry is written.
  const name = id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    id,
    name,
    shortName: id,
    muscles: [],
    equipment: [],
    defaultVariant: "standard",
    variants: {
      standard: {
        id: "standard",
        label: "Standard",
        animationId: id,
        cues: ["Move slowly through full range.", "Keep core braced, breathe steadily."],
      },
    },
  };
}

/** Same primary mover + overlapping equipment → swappable (future Swap button). */
export function findAlternatives(id: string): ExerciseInfo[] {
  const info = getExerciseInfo(id);
  const primary = info.muscles[0];
  if (!primary) return [];
  return Object.values(EXERCISE_CATALOG).filter(
    (e) =>
      e.id !== id &&
      e.muscles[0] === primary &&
      e.equipment.some((eq) => info.equipment.includes(eq))
  );
}
