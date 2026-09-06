/* Adjustable pacing: lets the user scale the workout to their day
 * without touching code. Persisted in localStorage.
 *
 * When customEnabled is off, each exercise uses its own programmed
 * work/rest seconds. When on, every set uses the custom values.
 */

export type ExercisePacing = {
  workSeconds?: number;
  restSeconds?: number;
  /** Chosen variant id for this exercise (persisted variant picker). */
  variantId?: string;
};

export type PaceSettings = {
  customEnabled: boolean;
  readySeconds: number;
  workSeconds: number;
  restSeconds: number;
  /** Per-exercise overrides, keyed by exercise id. Beat the global values. */
  exercises: Record<string, ExercisePacing>;
};

export const DEFAULT_PACING: PaceSettings = {
  customEnabled: false,
  readySeconds: 5,
  workSeconds: 40,
  restSeconds: 50,
  exercises: {},
};

export const PACE_LIMITS = {
  ready: { min: 3, max: 15, step: 1 },
  work: { min: 15, max: 120, step: 5 },
  rest: { min: 10, max: 180, step: 5 },
} as const;

const KEY = "homefit-pacing-v2";
const LEGACY_KEY = "homefit-pacing-v1";

function cleanExerciseMap(raw: unknown): Record<string, ExercisePacing> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, ExercisePacing> = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const e = v as Record<string, unknown>;
    const entry: ExercisePacing = {};
    if (typeof e.workSeconds === "number") {
      entry.workSeconds = clamp(Math.round(e.workSeconds), PACE_LIMITS.work.min, PACE_LIMITS.work.max);
    }
    if (typeof e.restSeconds === "number") {
      entry.restSeconds = clamp(Math.round(e.restSeconds), PACE_LIMITS.rest.min, PACE_LIMITS.rest.max);
    }
    if (typeof e.variantId === "string" && e.variantId) {
      entry.variantId = e.variantId;
    }
    if (entry.workSeconds !== undefined || entry.restSeconds !== undefined || entry.variantId !== undefined) out[id] = entry;
  }
  return out;
}

export function loadPacing(): PaceSettings {
  try {
    if (typeof window === "undefined" || !window.localStorage) return DEFAULT_PACING;
    // Migrate v1 (no per-exercise map) forward.
    if (!window.localStorage.getItem(KEY)) {
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      if (legacy) window.localStorage.setItem(KEY, legacy);
    }
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PACING;
    const parsed = JSON.parse(raw) as Partial<PaceSettings>;
    return {
      customEnabled: !!parsed.customEnabled,
      readySeconds: clamp(Math.round(parsed.readySeconds ?? DEFAULT_PACING.readySeconds), PACE_LIMITS.ready.min, PACE_LIMITS.ready.max),
      workSeconds: clamp(Math.round(parsed.workSeconds ?? DEFAULT_PACING.workSeconds), PACE_LIMITS.work.min, PACE_LIMITS.work.max),
      restSeconds: clamp(Math.round(parsed.restSeconds ?? DEFAULT_PACING.restSeconds), PACE_LIMITS.rest.min, PACE_LIMITS.rest.max),
      exercises: cleanExerciseMap(parsed.exercises),
    };
  } catch {
    return DEFAULT_PACING;
  }
}

export function savePacing(p: PaceSettings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — pacing just won't persist */
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function perExerciseOverrideCount(p: PaceSettings): number {
  return Object.keys(p.exercises ?? {}).length;
}
