"use client";

import { useState } from "react";
import { ExerciseAnimation } from "./ExerciseAnimation";
import { LowerBodyAnimation, LOWER_ANIMATION_IDS } from "./LowerBodyAnimation";
import { FormModal } from "./FormModal";
import type { WorkoutController } from "@/hooks/useWorkoutController";
import {
  isPreparation,
  setLabel,
  setDescription,
  repTarget,
  type Workout,
} from "@/lib/workout";

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, "0")}s`;
}

function BigButton({
  children,
  onClick,
  color = "slate",
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: "slate" | "blue" | "green" | "red" | "amber";
  ariaLabel?: string;
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-700 hover:bg-slate-600 text-white",
    blue: "bg-blue-600 hover:bg-blue-500 text-white",
    green: "bg-green-500 hover:bg-green-400 text-slate-950",
    red: "bg-red-500 hover:bg-red-400 text-white",
    amber: "bg-amber-400 hover:bg-amber-300 text-slate-950",
  };
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`min-h-[56px] min-w-[88px] rounded-2xl px-6 py-3 text-xl font-bold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 ${colors[color]}`}
    >
      {children}
    </button>
  );
}

export function WorkoutPlayer({
  workout,
  ctl,
}: {
  workout: Workout;
  ctl: WorkoutController;
}) {
  const {
    phase,
    paused,
    exercise,
    exerciseIndex,
    setNumber,
    secondsRemaining,
    nextStep,
  } = ctl;
  const [showForm, setShowForm] = useState(false);
  const center = phase === "resting" && nextStep ? nextStep.exercise : exercise;
  const centerSet =
    phase === "resting" && nextStep ? nextStep.setNumber : setNumber;
  const warmup = center.kind === "warmup";
  const cooldown = center.kind === "cooldown";
  const preparation = isPreparation(center);
  const timed = center.kind === "hold";
  const side = setLabel(center, centerSet);
  const urgent = phase === "working" && !preparation && secondsRemaining <= 10;
  const statsFor = (index: number) =>
    ctl.results.filter(
      (r) => r.exerciseIndex === index && r.outcome === "completed",
    ).length;
  const totalMs = ctl.workoutStart
    ? (ctl.workoutEnd ?? Date.now()) - ctl.workoutStart
    : 0;
  if (phase === "complete")
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-7 px-5 py-10 text-center">
        <h1 className="text-3xl font-extrabold text-green-300 sm:text-5xl">
          {workout.name.toUpperCase()}{" "}
          {ctl.requiredComplete ? "COMPLETE" : "ENDED"}
        </h1>
        <p className="text-xl text-slate-300">
          {ctl.requiredComplete
            ? "Nice work."
            : "Only completed working sets are included below."}
        </p>
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-800 p-5">
          <div>
            <strong className="text-2xl">{formatDuration(totalMs)}</strong>
            <p>Elapsed time</p>
          </div>
          <div>
            <strong className="text-2xl">{ctl.completedExercisesTotal}</strong>
            <p>Exercises completed</p>
          </div>
          <div>
            <strong className="text-2xl">{ctl.completedSetsTotal}</strong>
            <p>Sets completed</p>
          </div>
        </div>
        <p className="text-slate-400">
          Working sets only; warm-up and cool-down are separate.
        </p>
        <ul className="space-y-2 text-left">
          {ctl.sequence.map((e, i) =>
            isPreparation(e) ? null : (
              <li
                key={i}
                className="flex justify-between gap-4 rounded-xl bg-slate-800/60 p-4"
              >
                <span>
                  {e.name}
                  {e.optional ? " (optional)" : ""}
                </span>
                <span>
                  {statsFor(i)} / {e.sets} sets
                  {e.optional && !statsFor(i) ? " · skipped" : ""}
                </span>
              </li>
            ),
          )}
        </ul>
        <div className="flex flex-wrap justify-center gap-3">
          <BigButton color="green" onClick={ctl.reset}>
            Restart
          </BigButton>
          <BigButton onClick={ctl.toggleMute}>
            {ctl.muted ? "Unmute" : "Mute"}
          </BigButton>
        </div>
      </main>
    );
  const label = paused
    ? "PAUSED"
    : phase === "resting"
      ? "REST"
      : phase === "ready"
        ? "GET READY"
        : cooldown
          ? "COOL-DOWN"
          : warmup
            ? "WARM-UP"
            : timed
              ? "HOLD"
              : "TIME LIMIT";
  const repSeconds =
    center.targetReps > 0 ? ctl.effSecs(center).work / center.targetReps : 4;
  return (
    <div className="min-h-screen bg-[#0a1120]">
      <header className="hf-safe-top hf-safe-x flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 py-4">
        <div>
          <div className="text-2xl font-bold">HomeFit Coach</div>
          <div className="text-slate-400">
            {workout.name}
            {ctl.customPacing ? " · Custom pace" : ""}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <BigButton onClick={ctl.toggleMute} ariaLabel="Mute toggle">
            {ctl.muted ? "Unmute" : "Mute"}
          </BigButton>
          <BigButton onClick={ctl.toggleVoice} ariaLabel="Voice cues toggle">
            Voice {ctl.voiceEnabled ? "on" : "off"}
          </BigButton>
          <BigButton color="red" onClick={ctl.endWorkout}>
            End Workout
          </BigButton>
        </div>
      </header>
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <aside className="hidden border-r border-slate-800 p-5 lg:block">
          <h2 className="text-lg font-bold">Workout progress</h2>
          <p className="my-3 text-slate-400">
            {ctl.completedSetsTotal} / {ctl.allSetsTotal} working sets
          </p>
          <progress
            className="mb-4 h-3 w-full accent-green-400"
            max={ctl.allSetsTotal}
            value={ctl.completedSetsTotal}
          />
          {workout.warmup?.length ? (
            <p className="mb-3 text-sm text-sky-300">
              3-minute guided warm-up
              {workout.cooldown?.length ? " · 3-minute cool-down" : ""}
            </p>
          ) : null}
          <ol className="space-y-2">
            {ctl.sequence.map((e, i) =>
              isPreparation(e) ? null : (
                <li
                  key={i}
                  className={`rounded-xl p-3 ${i === exerciseIndex ? "bg-blue-900" : "bg-slate-800/50"}`}
                >
                  <p className="font-bold">{e.name}</p>
                  <p className="text-sm text-slate-400">
                    {e.optional ? "Optional · " : ""}
                    {repTarget(e)}
                  </p>
                  <p className="text-sm">
                    {statsFor(i)} / {e.sets} sets done
                  </p>
                </li>
              ),
            )}
          </ol>
        </aside>
        <main className="flex min-w-0 flex-col items-center px-4 py-5 text-center sm:px-6">
          <p className="text-sm uppercase tracking-widest text-sky-300">
            {phase === "resting"
              ? "Coming up"
              : cooldown
                ? `Cool-down ${exerciseIndex - (workout.warmup?.length ?? 0) - workout.exercises.length + 1} of ${workout.cooldown?.length}`
                : warmup
                  ? `Warm-up ${exerciseIndex + 1} of ${workout.warmup?.length}`
                  : center.optional
                    ? "Optional finisher"
                    : "Strength · controlled repetitions"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">
            {center.name}
          </h1>
          {side && (
            <div
              aria-live="polite"
              className="my-3 w-full rounded-xl bg-sky-400 px-4 py-3 text-4xl font-extrabold text-slate-950"
            >
              {side}
            </div>
          )}
          <p className="mt-3 text-xl text-slate-300">
            {preparation
              ? `${center.workSeconds} seconds · easy pace · no rest between movements`
              : timed
                ? `${center.workSeconds}-second static hold · no rep target`
                : `${setDescription(center, centerSet)} · Target: ${repTarget(center)}`}
          </p>
          {!preparation && !timed && (
            <p className="mt-4 max-w-xl text-lg text-green-200">
              Complete {repTarget(center)} with control, then press DONE. The
              timer is a maximum, not a requirement to keep moving.
            </p>
          )}
          <button
            onClick={ctl.togglePause}
            aria-label={paused ? "Resume workout" : "Pause workout"}
            className={`mt-4 w-full rounded-3xl border-2 p-5 ${urgent ? "border-amber-300 bg-amber-400/15" : "border-slate-700 bg-slate-900"}`}
          >
            <span className="text-xl font-bold tracking-widest">{label}</span>
            <span
              role="timer"
              aria-label={`${label}: ${secondsRemaining} seconds`}
              className={`block text-7xl font-extrabold tabular-nums sm:text-8xl ${urgent ? "text-amber-300" : phase === "resting" ? "text-amber-200" : "text-green-300"}`}
            >
              {formatClock(secondsRemaining)}
            </span>
            {urgent && (
              <span className="block text-lg font-bold text-amber-200">
                FINAL 10 SECONDS
              </span>
            )}
            <span className="mt-2 block text-sm text-slate-400">
              Tap timer to {paused ? "resume" : "pause"}
            </span>
          </button>
          <div className="my-4 flex flex-wrap justify-center gap-3">
            <BigButton
              color={paused ? "green" : "amber"}
              onClick={ctl.togglePause}
            >
              {paused ? "Resume" : "Pause"}
            </BigButton>
            {phase === "working" && !preparation && !timed && !paused && (
              <BigButton color="green" onClick={ctl.finishSetEarly}>
                DONE ✓
              </BigButton>
            )}
            {phase === "resting" && (
              <BigButton color="amber" onClick={() => ctl.extendRest(15)}>
                +15s rest
              </BigButton>
            )}
            {preparation && (
              <BigButton color="slate" onClick={ctl.skipPreparation}>
                Skip {cooldown ? "cool-down" : "warm-up"}
              </BigButton>
            )}
            {center.optional ? (
              <BigButton color="blue" onClick={ctl.skipFinisher}>
                SKIP FINISHER
              </BigButton>
            ) : (
              <BigButton color="blue" onClick={ctl.skip}>
                {phase === "ready"
                  ? "Begin set"
                  : phase === "resting"
                    ? "Skip rest"
                    : cooldown
                      ? "Skip cool-down move"
                      : warmup
                        ? "Skip warm-up move"
                        : "Skip set"}
              </BigButton>
            )}
            <BigButton onClick={ctl.previous}>Previous set</BigButton>
          </div>
          <div className="mt-4 w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            {LOWER_ANIMATION_IDS.has(center.animationId) ? (
              <LowerBodyAnimation
                key={center.animationId + side}
                exerciseId={center.animationId}
                repSeconds={repSeconds}
                paused={paused}
                sideLabel={side}
              />
            ) : (
              <ExerciseAnimation
                exerciseId={center.animationId}
                repSeconds={repSeconds}
                paused={paused}
              />
            )}
            <button
              onClick={() => {
                ctl.pause();
                setShowForm(true);
              }}
              className="min-h-[48px] rounded-xl px-6 py-2 text-lg font-bold text-sky-300 hover:bg-slate-800"
            >
              Form guide
            </button>
          </div>
          {showForm && (
            <FormModal exercise={center} onClose={() => setShowForm(false)} />
          )}
          <ul className="mb-6 w-full space-y-2 text-left text-lg">
            {center.cues.map((c) => (
              <li key={c} className="rounded-lg bg-slate-800/50 px-4 py-2">
                {c}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500">
            Space: pause · F: done · N: skip · P: previous · M: mute · V: voice
          </p>
        </main>
        <aside className="border-l border-slate-800 p-5">
          <h2 className="text-xl font-bold">Next up</h2>
          {nextStep ? (
            <div className="mt-3 rounded-xl bg-slate-800/50 p-4">
              <ExerciseAnimation
                exerciseId={nextStep.exercise.animationId}
                variant="mini"
              />
              <p className="mt-3 text-xl font-bold">{nextStep.exercise.name}</p>
              {!isPreparation(nextStep.exercise) && (
                <p className="mt-2 text-sky-300">
                  {setDescription(nextStep.exercise, nextStep.setNumber)}
                </p>
              )}
              <p className="mt-2 text-slate-300">
                {repTarget(nextStep.exercise)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-slate-300">
              Last set. Finish with control.
            </p>
          )}
          <p className="mt-6 text-slate-400">
            {workout.purpose ??
              "Keep your core engaged and control the weight."}
          </p>
        </aside>
      </div>
    </div>
  );
}
