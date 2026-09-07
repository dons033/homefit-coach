import {
  upperBodyA,
  estimateMinutes,
  withPreparation,
  type Workout,
  type Exercise,
} from "./workout";

export const PURPOSES = {
  mass: "Mass",
  lean: "Lean",
  "glp-1": "GLP-1 maintenance",
  endurance: "Endurance",
  athleticism: "Athleticism",
  strength: "Power / strength",
} as const;
export type Purpose = keyof typeof PURPOSES;
export type Session = {
  id: string;
  date: string;
  title: string;
  kind: "guided" | "external";
  purpose: Purpose;
  minutes: number;
  notes: string;
  completed: boolean;
  workout?: Workout;
  completedSets?: number;
  completedExercises?: number;
};
export type CoachState = { version: 1; purpose: Purpose; sessions: Session[] };
export const STORAGE_KEY = "homefit.coach.v1";
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}
export function weekDates(date: string): string[] {
  const d = new Date(`${date}T12:00:00`);
  const monday = shiftDate(date, -((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));
}
export function initialCoach(today: string): CoachState {
  return {
    version: 1,
    purpose: "lean",
    sessions: [
      {
        id: "starter-upper",
        date: today,
        title: upperBodyA.name,
        kind: "guided",
        purpose: "lean",
        minutes: estimateMinutes(upperBodyA),
        notes: "Your existing follow-along workout. Move it to any day.",
        completed: false,
        workout: structuredClone(upperBodyA),
      },
    ],
  };
}
export function validateCoach(value: unknown): value is CoachState {
  if (!value || typeof value !== "object") return false;
  const s = value as CoachState;
  if (
    s.version !== 1 ||
    !Object.hasOwn(PURPOSES, s.purpose) ||
    !Array.isArray(s.sessions)
  )
    return false;
  return s.sessions.every((x) => {
    if (
      !x ||
      typeof x.id !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(x.date) ||
      typeof x.title !== "string" ||
      typeof x.notes !== "string" ||
      typeof x.completed !== "boolean" ||
      !Object.hasOwn(PURPOSES, x.purpose) ||
      !Number.isFinite(x.minutes) ||
      x.minutes <= 0
    )
      return false;
    if (x.kind === "external") return true;
    const w = x.workout;
    if (
      x.kind !== "guided" ||
      !w ||
      typeof w.name !== "string" ||
      !Array.isArray(w.exercises) ||
      !w.exercises.length
    )
      return false;
    const validExercise = (e: Exercise) =>
      !!e &&
      typeof e.id === "string" &&
      typeof e.name === "string" &&
      typeof e.animationId === "string" &&
      typeof e.variantId === "string" &&
      (e.kind === undefined ||
        ["reps", "hold", "warmup", "cooldown"].includes(e.kind)) &&
      (e.optional === undefined || typeof e.optional === "boolean") &&
      (e.sides === undefined ||
        (Array.isArray(e.sides) &&
          e.sides.length === e.sets &&
          e.sides.every((s) => typeof s === "string"))) &&
      Array.isArray(e.cues) &&
      e.cues.every((c) => typeof c === "string") &&
      Number.isInteger(e.sets) &&
      e.sets > 0 &&
      Number.isFinite(e.workSeconds) &&
      e.workSeconds > 0 &&
      Number.isFinite(e.restSeconds) &&
      e.restSeconds >= 0 &&
      Number.isInteger(e.targetReps) &&
      (e.kind === "hold" || e.kind === "warmup" || e.kind === "cooldown"
        ? e.targetReps >= 0
        : e.targetReps > 0);
    return (
      w.exercises.every(validExercise) &&
      (w.warmup === undefined ||
        (Array.isArray(w.warmup) &&
          w.warmup.every((e) => validExercise(e) && e.kind === "warmup"))) &&
      (w.cooldown === undefined ||
        (Array.isArray(w.cooldown) &&
          w.cooldown.every((e) => validExercise(e) && e.kind === "cooldown")))
    );
  });
}
export type CoachProposal = {
  summary: string;
  sessionId: string;
  patch: Pick<Session, "date">;
};
export interface CoachProvider {
  propose(
    message: string,
    context: { date: string; sessions: Session[] },
  ): Promise<{ message: string; proposal?: CoachProposal }>;
}
// Same boundary as Team You's provider router: UI consumes a provider-neutral result.
// A future server adapter can replace this deterministic implementation.
export const localCoach: CoachProvider = {
  async propose(message, context) {
    const session = context.sessions.find(
      (s) => s.date === context.date && !s.completed,
    );
    if (/tomorrow|move|reschedule/i.test(message)) {
      if (!session)
        return {
          message:
            "Select a day with a planned session first, then ask me to move it to tomorrow.",
        };
      return {
        message: "Here is a change you can review.",
        proposal: {
          summary: `Move ${session.title} to ${shiftDate(context.date, 1)}.`,
          sessionId: session.id,
          patch: { date: shiftDate(context.date, 1) },
        },
      };
    }
    return {
      message:
        "I can move the selected day's first planned session to tomorrow. Try ‘Move my workout to tomorrow’. Use the library to build a workout, or Record activity for a class, P90X, or a walk. This local assistant does not yet provide open-ended AI coaching.",
    };
  },
};
// Future ingestion boundary. Adapters must normalize units, deduplicate source IDs,
// and obtain connection consent before importing measurements.
export type DeviceMeasurement = {
  id: string;
  source: string;
  sourceRecordId: string;
  measuredAt: string;
} & (
  | { kind: "weight"; value: number; unit: "kg" }
  | {
      kind: "blood-pressure";
      systolic: number;
      diastolic: number;
      unit: "mmHg";
    }
  | { kind: "heart-rate"; value: number; unit: "bpm" }
  | { kind: "steps"; value: number; unit: "count" }
);
export interface FitnessDeviceAdapter {
  id: string;
  label: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  pull(since: string): Promise<DeviceMeasurement[]>;
}

export function upgradePreparation(state: CoachState): CoachState {
  return {
    ...state,
    sessions: state.sessions.map((session) => {
      if (session.completed || !session.workout) return session;
      const workout = withPreparation(session.workout);
      return workout === session.workout
        ? session
        : { ...session, workout, minutes: estimateMinutes(workout) };
    }),
  };
}
