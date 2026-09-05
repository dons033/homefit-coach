/* Exercise catalog — the ONE place to add a new movement.
 *
 * HOW TO ADD AN EXERCISE (via opencode desktop or by hand):
 *   1. Add one entry below: id, name, shortName, cues.
 *   2. Add the id to a workout in lib/workout.ts (sets / reps / timers live
 *      on the workout entry, so the same move can be reused with different
 *      programming, e.g. heavy day vs light day).
 *   3. Optional: add a custom animation in components/ExerciseAnimation.tsx
 *      under the same id. If you skip this, a generic placeholder figure
 *      renders automatically — nothing breaks.
 *
 * Keep ids lowercase-kebab, e.g. "goblet-squat".
 */

export type ExerciseInfo = {
  id: string;
  name: string;
  shortName: string;
  cues: string[];
};

export const EXERCISE_CATALOG: Record<string, ExerciseInfo> = {
  "bench-press": {
    id: "bench-press",
    name: "Dumbbell Bench Press",
    shortName: "Bench Press",
    cues: [
      "Lie on a bench (or floor) with a dumbbell in each hand.",
      "Start with dumbbells at chest level, palms forward.",
      "Press up until arms are nearly straight (don't lock elbows).",
      "Lower with control, elbows about 45° from your body.",
    ],
  },
  "one-arm-row": {
    id: "one-arm-row",
    name: "One-Arm Dumbbell Row",
    shortName: "One-Arm Row",
    cues: [
      "One knee + hand on bench, back flat like a table.",
      "Let the dumbbell hang, then row to your hip.",
      "Keep elbow close to your body, squeeze at the top.",
      "Lower slowly. No twisting or jerking.",
    ],
  },
  "shoulder-press": {
    id: "shoulder-press",
    name: "Dumbbell Shoulder Press",
    shortName: "Shoulder Press",
    cues: [
      "Stand or sit tall, dumbbells at shoulder height.",
      "Palms face forward, ribs down, core braced.",
      "Press overhead until arms are nearly straight.",
      "Lower to shoulders with control.",
    ],
  },
  "lateral-raise": {
    id: "lateral-raise",
    name: "Dumbbell Lateral Raise",
    shortName: "Lat Raise",
    cues: [
      "Stand tall, light dumbbells at your sides.",
      "Raise arms out to shoulder height, slight elbow bend.",
      "Lead with elbows, don't shrug your shoulders.",
      "Lower slowly. No swinging.",
    ],
  },
  "biceps-curl": {
    id: "biceps-curl",
    name: "Dumbbell Biceps Curl",
    shortName: "Biceps Curl",
    cues: [
      "Stand tall, elbows pinned at your sides.",
      "Curl both dumbbells to shoulder height.",
      "Keep wrists straight, don't swing your back.",
      "Lower all the way down with control.",
    ],
  },
  "triceps-extension": {
    id: "triceps-extension",
    name: "Dumbbell Triceps Extension",
    shortName: "Triceps Extension",
    cues: [
      "Stand tall, one or two dumbbells overhead.",
      "Keep elbows close to your head, pointing up.",
      "Lower behind your head, then press straight up.",
      "Don't let elbows flare wide.",
    ],
  },
};

export function getExerciseInfo(id: string): ExerciseInfo {
  const found = EXERCISE_CATALOG[id];
  if (found) return found;
  // Graceful fallback so a workout entry never crashes the player,
  // even before its animation/cues are written.
  return {
    id,
    name: id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    shortName: id,
    cues: ["Cues not written yet — move slowly through full range.", "Keep core braced, breathe steadily."],
  };
}
