import type { Session } from "./coach";

export const FOCUS = {
  push: "Upper-body push", pull: "Upper-body pull", knee: "Squat / lunge",
  hinge: "Hip hinge / glutes", trunk: "Core / trunk", cardio: "Cardio", mobility: "Mobility / flexibility",
} as const;
export type TrainingFocus = keyof typeof FOCUS;
export type ActivityDetails = {
  program: string;
  focus: TrainingFocus[];
  effort?: number;
  steps?: number;
  miles?: number;
  calories?: number;
};
export function validActivity(value: unknown): value is ActivityDetails {
  if (!value || typeof value !== "object") return false;
  const x = value as ActivityDetails;
  return typeof x.program === "string" && Array.isArray(x.focus) &&
    x.focus.every(k => Object.hasOwn(FOCUS, k)) &&
    (x.effort === undefined || (Number.isInteger(x.effort) && x.effort >= 1 && x.effort <= 10)) &&
    [x.steps, x.miles, x.calories].every(n => n === undefined || (Number.isFinite(n) && n >= 0));
}
const MOVEMENTS: Record<string, TrainingFocus> = {
  "bench-press": "push", "shoulder-press": "push",
  "one-arm-row": "pull",
  "goblet-squat": "knee", "bulgarian-split-squat": "knee", "reverse-lunge": "knee", "wall-sit": "knee",
  "romanian-deadlift": "hinge", "hip-thrust": "hinge",
};
export function rollingCoverage(sessions: Session[], through: string) {
  const start = new Date(`${through}T12:00:00`);
  start.setDate(start.getDate() - 6);
  const from = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,"0")}-${String(start.getDate()).padStart(2,"0")}`;
  const recent = sessions.filter(s => s.date >= from && s.date <= through && (s.completed || (s.kind === "guided" && (s.completedSets ?? 0) > 0)));
  const evidence = Object.fromEntries(Object.keys(FOCUS).map(k => [k, [] as string[]])) as Record<TrainingFocus, string[]>;
  const unknown: string[] = [];
  for (const s of recent) {
    // A saved partial run has aggregate counts only; do not attribute its planned exercises.
    const partial = !s.completed || s.workout && s.completedSets !== undefined && s.completedSets < s.workout.exercises.reduce((n,e) => n + (e.optional ? 0 : e.sets), 0);
    const focus = s.kind === "external" ? s.activity?.focus ?? [] : partial ? [] :
      s.workout?.exercises.filter(e => !e.optional).flatMap(e => MOVEMENTS[e.id] ? [MOVEMENTS[e.id]] : []) ?? [];
    if (!focus.length) unknown.push(s.title);
    for (const k of new Set(focus)) evidence[k].push(s.title);
  }
  return { from, through, recent, evidence, unknown };
}
