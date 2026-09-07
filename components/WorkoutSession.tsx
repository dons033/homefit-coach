"use client";
import { useMemo, useState } from "react";
import { EXERCISE_CATALOG } from "@/lib/exercise-catalog";
import {
  estimateMinutes,
  repTarget,
  withVariant,
  withPreparation,
  type Workout,
} from "@/lib/workout";
import { useWorkoutController } from "@/hooks/useWorkoutController";
import { WorkoutPlayer } from "./WorkoutPlayer";
import { PreparationPreview } from "./PreparationPreview";
import { ExerciseAnimation } from "./ExerciseAnimation";
export type SessionResult = {
  minutes: number;
  completed: boolean;
  completedSets: number;
  completedExercises: number;
  workout: Workout;
};
export function WorkoutSession({
  workout: source,
  onClose,
  onSave,
  fast = false,
}: {
  workout: Workout;
  onClose: () => void;
  onSave?: (result: SessionResult) => void;
  fast?: boolean;
}) {
  const [finisher, setFinisher] = useState(true);
  const [variants, setVariants] = useState<Record<string, string>>({});
  const workout = useMemo(() => {
    let next = withPreparation(source);
    for (const [id, variant] of Object.entries(variants))
      next = withVariant(next, id, variant);
    return finisher
      ? next
      : { ...next, exercises: next.exercises.filter((e) => !e.optional) };
  }, [source, finisher, variants]);
  const ctl = useWorkoutController(workout, { fast });
  return (
    <>
      <div className="flex flex-wrap justify-between gap-3 border-b border-slate-700 bg-slate-900 p-4">
        <button
          className="min-h-[48px] rounded-xl bg-slate-700 px-5 font-bold"
          onClick={() => {
            ctl.reset();
            onClose();
          }}
        >
          ← Back to coach
        </button>
        {ctl.phase === "complete" && onSave && (
          <button
            className="min-h-[48px] rounded-xl bg-green-400 px-5 font-bold text-slate-950"
            onClick={() =>
              onSave({
                minutes: Math.max(
                  1,
                  Math.round(
                    ((ctl.workoutEnd ?? Date.now()) -
                      (ctl.workoutStart ?? Date.now())) /
                      60000,
                  ),
                ),
                completed: ctl.requiredComplete,
                completedSets: ctl.completedSetsTotal,
                completedExercises: ctl.completedExercisesTotal,
                workout,
              })
            }
          >
            Save session
          </button>
        )}
      </div>
      {ctl.phase !== "idle" ? (
        <WorkoutPlayer workout={workout} ctl={ctl} />
      ) : (
        <main className="mx-auto max-w-5xl px-5 py-8">
          <p className="text-sm font-bold uppercase tracking-widest text-green-300">
            Your workout
          </p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            {workout.name}
          </h1>
          <p className="mt-4 text-xl text-slate-300">
            {workout.purpose ?? workout.tagline}
          </p>
          <p className="mt-3 text-slate-400">
            ~{estimateMinutes(workout)} minutes of programmed time
            {workout.id === "lower-body-a"
              ? " · includes warm-up and cool-down"
              : ""}{" "}
            ·{" "}
            {workout.exercises
              .filter((e) => !e.optional)
              .reduce((n, e) => n + e.sets, 0)}{" "}
            working sets
            {workout.exercises.some((e) => e.optional)
              ? " + optional finisher"
              : ""}
          </p>
          <p className="mt-2 text-slate-400">
            {workout.equipment?.join(" · ")}
          </p>
          {workout.repBased && (
            <p className="mt-5 rounded-2xl border border-green-800 bg-green-950/50 p-5 text-lg text-green-200">
              Strength, not HIIT. Complete the target reps with control and
              press DONE to start your rest. The timer sets a maximum work
              period.
            </p>
          )}
          {source.exercises.some((e) => e.optional) && (
            <label className="my-5 flex min-h-[48px] items-center gap-3 text-lg">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={finisher}
                onChange={(e) => setFinisher(e.target.checked)}
              />{" "}
              Include optional 45-second wall sit. You can also skip it during
              the workout.
            </label>
          )}
          <PreparationPreview workout={workout} />
          <button
            onClick={ctl.start}
            className="my-5 min-h-[64px] rounded-2xl bg-green-400 px-8 text-2xl font-extrabold text-slate-950"
          >
            Start {workout.name}
          </button>
          {fast && (
            <p className="mb-4 text-amber-300">Demo mode: shortened timers.</p>
          )}
          <ol className="space-y-4">
            {workout.exercises.map((e) => (
              <li
                key={e.id}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-5"
              >
                <div className="flex items-center gap-4">
                  <ExerciseAnimation
                    exerciseId={e.animationId}
                    variant="mini"
                  />
                  <div>
                    <h2 className="text-xl font-bold">
                      {e.name}
                      {e.optional ? " · optional" : ""}
                    </h2>
                    <p className="mt-2 text-slate-300">
                      {e.id === "bulgarian-split-squat"
                        ? "2 sets per leg (4 total)"
                        : `${e.sets} set${e.sets === 1 ? "" : "s"}`}{" "}
                      · {repTarget(e)} · {e.workSeconds}s{" "}
                      {e.kind === "hold" ? "hold" : "limit"}
                      {e.restSeconds ? ` · ${e.restSeconds}s rest` : ""}
                    </p>
                  </div>
                </div>
                {Object.keys(EXERCISE_CATALOG[e.id]?.variants ?? {}).length >
                  1 && (
                  <label className="mt-4 block">
                    Choose setup
                    <select
                      className="ml-3 rounded-lg bg-slate-700 p-3"
                      value={e.variantId}
                      onChange={(event) =>
                        setVariants({ ...variants, [e.id]: event.target.value })
                      }
                    >
                      {Object.values(EXERCISE_CATALOG[e.id].variants).map(
                        (v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                )}
                <p className="mt-3 text-slate-400">{e.cues.join(" ")}</p>
              </li>
            ))}
          </ol>
        </main>
      )}
    </>
  );
}
