"use client";

import { useMemo, useState, Suspense } from "react";
import { PreparationPreview } from "@/components/PreparationPreview";
import { WorkoutSession } from "@/components/WorkoutSession";
import { lowerBodyA } from "@/lib/workout";
import { useRouter, useSearchParams } from "next/navigation";
import {
  upperBodyA,
  withVariant,
  estimateMinutes,
  FOCUS_PRESETS,
} from "@/lib/workout";
import { EXERCISE_CATALOG } from "@/lib/exercise-catalog";
import {
  DEFAULT_PACING,
  PACE_LIMITS,
  loadPacing,
  savePacing,
  type PaceSettings,
} from "@/lib/pacing";
import { useWorkoutController } from "@/hooks/useWorkoutController";
import { WorkoutPlayer } from "@/components/WorkoutPlayer";
import { ExerciseAnimation } from "@/components/ExerciseAnimation";

function Stepper({
  label,
  value,
  unit,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-800/60 px-4 py-3">
      <div className="text-xl font-bold">{label}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex min-h-[56px] min-w-[56px] items-center justify-center rounded-xl bg-slate-700 text-3xl font-bold hover:bg-slate-600 disabled:opacity-30"
        >
          −
        </button>
        <div className="w-24 text-center text-2xl font-extrabold tabular-nums">
          {value}
          <span className="text-base font-bold text-slate-400">{unit}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex min-h-[56px] min-w-[56px] items-center justify-center rounded-xl bg-slate-700 text-3xl font-bold hover:bg-slate-600 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

function HomeInner() {
  const params = useSearchParams();
  const router = useRouter();
  if (params.get("id") === "lower-body-a")
    return (
      <WorkoutSession
        workout={lowerBodyA}
        onClose={() => router.push("/")}
        fast={params.get("fast") === "1"}
      />
    );
  return <UpperBodySetup />;
}
function UpperBodySetup() {
  const params = useSearchParams();
  const fast = params.get("fast") === "1";
  const [pacing, setPacing] = useState<PaceSettings>(loadPacing);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // User-chosen variants applied over the programmed workout.
  const workout = useMemo(() => {
    let w = upperBodyA;
    for (const [id, ep] of Object.entries(pacing.exercises)) {
      if (ep.variantId) w = withVariant(w, id, ep.variantId);
    }
    return w;
  }, [pacing.exercises]);
  const ctl = useWorkoutController(workout, { fast, pacing });

  const updatePacing = (patch: Partial<PaceSettings>) => {
    setPacing((p) => {
      const next = { ...p, ...patch };
      savePacing(next);
      return next;
    });
  };

  const updateExercisePacing = (
    id: string,
    patch: { workSeconds?: number; restSeconds?: number; variantId?: string },
  ) => {
    setPacing((p) => {
      const next = {
        ...p,
        exercises: { ...p.exercises, [id]: { ...p.exercises[id], ...patch } },
      };
      savePacing(next);
      return next;
    });
  };

  const clearExercisePacing = (id: string) => {
    setPacing((p) => {
      const exercises = { ...p.exercises };
      delete exercises[id];
      const next = { ...p, exercises };
      savePacing(next);
      return next;
    });
  };

  const setExerciseVariant = (id: string, variantId: string) => {
    updateExercisePacing(id, { variantId });
    setExpandedId(null);
  };

  /** Effective work/rest for an exercise: per-exercise → global custom → programmed. */
  const effective = (e: {
    id: string;
    workSeconds: number;
    restSeconds: number;
  }) => ({
    work:
      pacing.exercises[e.id]?.workSeconds ??
      (pacing.customEnabled && !fast ? pacing.workSeconds : e.workSeconds),
    rest:
      pacing.exercises[e.id]?.restSeconds ??
      (pacing.customEnabled && !fast ? pacing.restSeconds : e.restSeconds),
  });

  if (ctl.phase === "idle") {
    const minutes = fast
      ? estimateMinutes(workout)
      : estimateMinutes(workout, {
          readySeconds: pacing.customEnabled ? pacing.readySeconds : undefined,
          workSeconds: pacing.customEnabled ? pacing.workSeconds : undefined,
          restSeconds: pacing.customEnabled ? pacing.restSeconds : undefined,
          perExercise: pacing.exercises,
        });
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-8 py-10">
        <div className="text-3xl font-extrabold">HomeFit Coach</div>
        <div className="mt-8 grid grid-cols-2 gap-10 max-lg:grid-cols-1">
          <div>
            <h1 className="text-6xl font-extrabold leading-tight">
              {workout.name}
            </h1>
            <p className="mt-2 text-2xl text-slate-400">
              6 exercises • ~{minutes} minutes • Dumbbells + bench
            </p>
            <p className="mt-2">
              <span className="mr-2 inline-block rounded-lg bg-green-500/15 px-3 py-1 text-lg font-bold text-green-300">
                {FOCUS_PRESETS[workout.focus].label}
              </span>
              <span className="text-lg text-slate-400">
                {FOCUS_PRESETS[workout.focus].blurb}
              </span>
            </p>
            {fast && (
              <p className="mt-2 inline-block rounded-lg bg-amber-400/15 px-3 py-1 text-lg font-bold text-amber-300">
                Demo mode: short timers (?fast=1)
              </p>
            )}
            <PreparationPreview workout={workout} />
            <button
              onClick={ctl.start}
              className="mt-8 min-h-[72px] rounded-2xl bg-green-500 px-12 text-3xl font-extrabold text-slate-950 hover:bg-green-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
            >
              ▶ Start Workout
            </button>
            <p className="mt-4 text-lg text-slate-400">
              Follow-along player. Big timers, loud beeps, no touching the
              screen mid-set. Space = pause • F = finish • N = skip • V = voice.
            </p>

            {/* Muscle-preservation coaching */}
            <div className="mt-6 rounded-3xl border border-green-900/60 bg-green-950/30 p-5">
              <div className="mb-2 text-xl font-bold uppercase tracking-wider text-green-300">
                Built to keep muscle
              </div>
              <ul className="list-disc space-y-1 pl-5 text-lg text-slate-200">
                <li>
                  Stop each set <strong>1–2 reps before failure</strong> — leave
                  a rep in the tank.
                </li>
                <li>
                  Aim for <strong>1.2–1.6 g protein per kg</strong> body weight
                  daily, spread across meals.
                </li>
                <li>
                  Train <strong>2–3× per week</strong>, covering all major
                  muscle groups.
                </li>
              </ul>
              <p className="mt-2 text-sm text-slate-500">
                General fitness information, not medical advice. If you take
                GLP-1 medication or have a health condition, check with your
                clinician before training.
              </p>
            </div>

            {/* Pacing */}
            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xl font-bold uppercase tracking-wider text-slate-300">
                  Pacing
                </div>
                <button
                  onClick={() =>
                    updatePacing({ customEnabled: !pacing.customEnabled })
                  }
                  aria-pressed={pacing.customEnabled}
                  className={`min-h-[56px] rounded-xl px-5 text-xl font-bold ${pacing.customEnabled ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-white"}`}
                >
                  {pacing.customEnabled ? "Custom: On" : "Custom: Off"}
                </button>
              </div>
              {pacing.customEnabled ? (
                <div className="space-y-2">
                  <Stepper
                    label="Get ready"
                    value={pacing.readySeconds}
                    unit="s"
                    min={PACE_LIMITS.ready.min}
                    max={PACE_LIMITS.ready.max}
                    step={PACE_LIMITS.ready.step}
                    onChange={(v) => updatePacing({ readySeconds: v })}
                  />
                  <Stepper
                    label="Work"
                    value={pacing.workSeconds}
                    unit="s"
                    min={PACE_LIMITS.work.min}
                    max={PACE_LIMITS.work.max}
                    step={PACE_LIMITS.work.step}
                    onChange={(v) => updatePacing({ workSeconds: v })}
                  />
                  <Stepper
                    label="Rest"
                    value={pacing.restSeconds}
                    unit="s"
                    min={PACE_LIMITS.rest.min}
                    max={PACE_LIMITS.rest.max}
                    step={PACE_LIMITS.rest.step}
                    onChange={(v) => updatePacing({ restSeconds: v })}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-base text-slate-400">
                      Applies to every set. Saved on this device.
                    </p>
                    <button
                      onClick={() =>
                        updatePacing({ ...DEFAULT_PACING, customEnabled: true })
                      }
                      className="min-h-[48px] rounded-xl px-4 text-lg font-bold text-slate-300 hover:bg-slate-800"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-slate-400">
                  Programmed pace: 40s work • 90s rest on compounds, 60s on
                  isolations • 5s get-ready. Turn Custom on to scale the day up
                  or down, or tap a move to tune it alone.
                </p>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="mb-2 text-xl font-bold uppercase tracking-wider text-slate-400">
              Today&apos;s lineup — tap a move to tune its pace
            </div>
            <ul className="space-y-2">
              {workout.exercises.map((e, i) => {
                const eff = effective(e);
                const tuned = pacing.exercises[e.id] !== undefined;
                const open = expandedId === e.id;
                return (
                  <li
                    key={e.id}
                    className={`rounded-2xl p-3 ${tuned ? "bg-sky-900/40" : "bg-slate-800/60"}`}
                  >
                    <button
                      onClick={() => setExpandedId(open ? null : e.id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xl font-bold">
                        {i + 1}
                      </span>
                      <ExerciseAnimation
                        exerciseId={e.animationId}
                        variant="mini"
                      />
                      <div className="flex-1">
                        <div className="text-2xl font-bold leading-tight">
                          {e.name}
                          {tuned && (
                            <span className="ml-2 rounded-lg bg-sky-500/25 px-2 py-0.5 align-middle text-sm font-bold text-sky-300">
                              TUNED
                            </span>
                          )}
                        </div>
                        <div className="text-lg text-slate-400">
                          {e.id === "one-arm-row"
                            ? "6 sets (3/side)"
                            : `${e.sets} sets`}{" "}
                          × {e.targetReps} reps • {eff.work}s work • {eff.rest}s
                          rest
                        </div>
                      </div>
                      <span className="text-2xl text-slate-500">
                        {open ? "▾" : "▸"}
                      </span>
                    </button>
                    {open && (
                      <div className="mt-2 space-y-2 pl-14">
                        {Object.keys(EXERCISE_CATALOG[e.id]?.variants ?? {})
                          .length > 1 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.values(EXERCISE_CATALOG[e.id].variants).map(
                              (v) => (
                                <button
                                  key={v.id}
                                  onClick={() => setExerciseVariant(e.id, v.id)}
                                  aria-pressed={e.variantId === v.id}
                                  title={v.notes ?? v.label}
                                  className={`min-h-[48px] rounded-xl px-4 text-lg font-bold ${e.variantId === v.id ? "bg-sky-500 text-slate-950" : "bg-slate-700 text-white"}`}
                                >
                                  {v.label}
                                </button>
                              ),
                            )}
                          </div>
                        )}
                        {EXERCISE_CATALOG[e.id]?.variants[e.variantId]
                          ?.notes && (
                          <p className="text-base text-sky-300/90">
                            {EXERCISE_CATALOG[e.id].variants[e.variantId].notes}
                          </p>
                        )}
                        <Stepper
                          label="Work"
                          value={eff.work}
                          unit="s"
                          min={PACE_LIMITS.work.min}
                          max={PACE_LIMITS.work.max}
                          step={PACE_LIMITS.work.step}
                          onChange={(v) =>
                            updateExercisePacing(e.id, { workSeconds: v })
                          }
                        />
                        <Stepper
                          label="Rest"
                          value={eff.rest}
                          unit="s"
                          min={PACE_LIMITS.rest.min}
                          max={PACE_LIMITS.rest.max}
                          step={PACE_LIMITS.rest.step}
                          onChange={(v) =>
                            updateExercisePacing(e.id, { restSeconds: v })
                          }
                        />
                        {tuned && (
                          <button
                            onClick={() => clearExercisePacing(e.id)}
                            className="min-h-[48px] rounded-xl px-4 text-lg font-bold text-slate-300 hover:bg-slate-800"
                          >
                            Reset to programmed pace
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <WorkoutPlayer workout={workout} ctl={ctl} />;
}

export default function Page() {
  const fallback = useMemo(
    () => <div className="p-10 text-2xl">Loading…</div>,
    [],
  );
  return (
    <Suspense fallback={fallback}>
      <HomeInner />
    </Suspense>
  );
}
