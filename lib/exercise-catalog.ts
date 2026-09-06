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
  /** Vendored public-domain reference photos (free-exercise-db). */
  formImages?: { start: string; end: string };
  /** Condensed reference steps for the Form modal. */
  dbSteps?: string[];
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
  extra: Partial<Variant> & { formImages: { start: string; end: string }; dbSteps: string[] }
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
        formImages: { start: "/form/bench-press/0.jpg", end: "/form/bench-press/1.jpg" },
        dbSteps: [
          "Dumbbells just outside the chest, forearms vertical, elbow angle ≈ 90°.",
          "Press up in a slight inward arc, squeeze 1s at the top.",
          "Lower in about twice the press time. No bouncing.",
        ],
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
        formImages: { start: "/form/bench-press-floor/0.jpg", end: "/form/bench-press-floor/1.jpg" },
        dbSteps: [
          "Knees bent, bells start extended overhead.",
          "Lower until upper arms touch the floor. Tuck elbows for triceps, flare slightly for chest.",
          "Pause, then press to full extension.",
        ],
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
      "one-arm-row",
      {
        formImages: { start: "/form/one-arm-row/0.jpg", end: "/form/one-arm-row/1.jpg" },
        dbSteps: [
          "Torso parallel to the floor, back flat, working arm hangs straight.",
          "Pull to the side of the chest, elbow past the ribs, squeeze.",
          "Lower straight down. Torso stays still.",
        ],
      }
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
      "shoulder-press",
      {
        formImages: { start: "/form/shoulder-press/0.jpg", end: "/form/shoulder-press/1.jpg" },
        dbSteps: [
          "Bells at shoulder height outside the shoulders, palms forward.",
          "Press until the bells nearly touch overhead.",
          "Pause briefly, lower with control.",
        ],
      }
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
      "lateral-raise",
      {
        formImages: { start: "/form/lateral-raise/0.jpg", end: "/form/lateral-raise/1.jpg" },
        dbSteps: [
          "Bells at your sides, slight fixed elbow bend.",
          "Raise in a wide arc to just above parallel, hands tilted like pouring water.",
          "Pause 1s, lower slowly. No shrug, no swing.",
        ],
      }
    ),
  },
  "biceps-curl": {
    id: "biceps-curl",
    name: "Dumbbell Biceps Curl",
    shortName: "Biceps Curl",
    muscles: ["biceps", "forearms"],
    equipment: ["dumbbells"],
    defaultVariant: "standard",
    variants: {
      standard: {
        id: "standard",
        label: "Standard",
        animationId: "biceps-curl",
        formImages: { start: "/form/biceps-curl/0.jpg", end: "/form/biceps-curl/1.jpg" },
        dbSteps: [
          "Arms hang, palms forward, elbows pinned at your sides.",
          "Curl to shoulder level, squeeze briefly at the top.",
          "Lower slowly to full extension.",
        ],
        cues: [
          "Stand tall, elbows pinned at your sides.",
          "Curl both dumbbells to shoulder height.",
          "Keep wrists straight, don't swing your back.",
          "Lower all the way down with control.",
        ],
      },
      hammer: {
        id: "hammer",
        label: "Hammer",
        animationId: "biceps-curl-hammer",
        notes: "Neutral grip biases brachialis + forearms. Same hinge, turned handle.",
        formImages: { start: "/form/biceps-curl-hammer/0.jpg", end: "/form/biceps-curl-hammer/1.jpg" },
        dbSteps: [
          "Neutral grip — palms face your thighs, plates face forward.",
          "Curl to chest height keeping elbows back.",
          "Squeeze, lower slowly to straight arms.",
        ],
        cues: [
          "Stand tall, palms facing your thighs (neutral grip).",
          "Curl with elbows pinned, bells travel close to your body.",
          "Finish at chest height, squeeze briefly.",
          "Lower slowly to full extension. No swinging.",
        ],
      },
    },
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
      "triceps-extension",
      {
        formImages: { start: "/form/triceps-extension/0.jpg", end: "/form/triceps-extension/1.jpg" },
        dbSteps: [
          "Bell overhead, both hands, arms fully extended.",
          "Lower behind the head until forearms near the biceps. Upper arms still.",
          "Press back overhead. No elbow flare.",
        ],
      }
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
