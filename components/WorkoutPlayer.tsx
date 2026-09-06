"use client";

import { useState } from "react";
import { ExerciseAnimation } from "./ExerciseAnimation";
import { FormModal } from "./FormModal";
import type { WorkoutController } from "@/hooks/useWorkoutController";
import { setLabel, type Workout } from "@/lib/workout";

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

export function WorkoutPlayer({ workout, ctl }: { workout: Workout; ctl: WorkoutController }) {
  const {
    phase, paused, exercise, exerciseIndex, setNumber,
    secondsRemaining, progress, nextStep, muted, voiceEnabled,
    workoutStart, workoutEnd, completedSetsTotal, allSetsTotal,
    customPacing,
  } = ctl;

  const side = setLabel(exercise, setNumber);
  const totalExercises = workout.exercises.length;
  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    if (!paused) ctl.pause();
    setShowForm(true);
  };

  if (phase === "complete") {
    const totalMs = workoutStart ? (workoutEnd ?? Date.now()) - workoutStart : 0;
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 p-8 text-center">
        <div className="text-2xl font-semibold uppercase tracking-widest text-green-400">Workout Complete</div>
        <h1 className="text-6xl font-extrabold">Nice work.</h1>
        <div className="text-3xl text-slate-300">
          Total time: <span className="font-bold text-white">{formatDuration(totalMs)}</span>
        </div>
        <div className="max-w-2xl rounded-2xl border border-green-900/60 bg-green-950/30 px-6 py-4 text-xl text-slate-200">
          Protect the muscle you just trained — get <strong>25–40 g of protein</strong> in your next meal.
        </div>
        <div className="w-full rounded-3xl border border-slate-700 bg-slate-800/60 p-6 text-left">
          <div className="mb-4 text-xl font-bold uppercase tracking-wider text-slate-400">Completed</div>
          <ul className="space-y-2">
            {workout.exercises.map((e, i) => (
              <li key={e.id} className="flex items-center justify-between rounded-xl bg-slate-900/70 px-5 py-3 text-2xl">
                <span className="font-semibold">{i + 1}. {e.name}</span>
                <span className="text-slate-400">{e.sets} × {e.targetReps}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4">
          <BigButton color="green" onClick={ctl.reset}>Restart</BigButton>
          <BigButton color="slate" onClick={ctl.toggleMute}>{muted ? "Unmute" : "Mute"}</BigButton>
        </div>
      </div>
    );
  }

  const phaseLabel =
    phase === "ready" ? "GET READY" : phase === "working" ? (paused ? "PAUSED" : "WORK") : phase === "resting" ? (paused ? "PAUSED — REST" : "REST") : "";
  const timerColor =
    phase === "working" ? "text-green-400" : phase === "resting" ? "text-amber-300" : "text-sky-300";

  // During rest, center shows rest timer but preview next; otherwise show current.
  const centerExercise = phase === "resting" && nextStep ? nextStep.exercise : exercise;
  const centerSet = phase === "resting" && nextStep ? nextStep.setNumber : setNumber;
  const centerIndex = phase === "resting" && nextStep ? nextStep.exerciseIndex : exerciseIndex;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0a1120]">
      {/* Top bar */}
      <header className="hf-safe-top hf-safe-x flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 py-3">
        <div>
          <div className="flex items-center gap-3 text-2xl font-extrabold">
            HomeFit Coach
            {customPacing && (
              <span className="rounded-lg bg-sky-500/20 px-2 py-0.5 text-base font-bold text-sky-300">
                Custom pace
              </span>
            )}
          </div>
          <div className="text-lg text-slate-400">{workout.name} • Strength • {totalExercises} Exercises</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={ctl.togglePause}
            className="min-h-[56px] rounded-2xl bg-slate-700 px-6 text-xl font-bold hover:bg-slate-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
            aria-label={paused ? "Resume" : "Pause"}
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            onClick={ctl.toggleMute}
            className="min-h-[56px] min-w-[56px] rounded-2xl bg-slate-700 px-4 text-xl font-bold hover:bg-slate-600"
            aria-label="Mute toggle"
          >
            {muted ? "🔇" : "🔔"}
          </button>
          <button
            onClick={ctl.toggleVoice}
            className="min-h-[56px] min-w-[56px] rounded-2xl bg-slate-700 px-4 text-xl font-bold hover:bg-slate-600"
            aria-label="Voice cues toggle"
            title="Spoken exercise cues"
          >
            {voiceEnabled ? "🗣" : "🚫"}
          </button>
          <button
            onClick={ctl.endWorkout}
            className="min-h-[56px] rounded-2xl bg-red-500 px-6 text-xl font-bold hover:bg-red-400"
          >
            End Workout
          </button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_250px] xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* LEFT */}
        <aside className="min-w-0 border-r border-slate-800 p-4 max-lg:hidden">
          <div className="mb-2 text-lg font-bold text-slate-300">Workout Progress</div>
          <div className="mb-1 h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-green-400 transition-all"
              style={{ width: `${(completedSetsTotal / allSetsTotal) * 100}%` }}
            />
          </div>
          <div className="mb-4 text-base text-slate-400">
            {completedSetsTotal} / {allSetsTotal} sets • Ex {exerciseIndex + 1}/{totalExercises}
          </div>
          <ol className="space-y-1">
            {workout.exercises.map((e, i) => {
              const active = i === exerciseIndex;
              const done = i < exerciseIndex;
              return (
                <li
                  key={e.id}
                  className={`rounded-xl px-3 py-2.5 ${active ? "bg-blue-700" : done ? "bg-slate-800/80 opacity-70" : "bg-transparent"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ${active ? "bg-sky-400 text-slate-950" : "bg-slate-700"}`}>
                      {done ? "✓" : i + 1}
                    </span>
                    <div>
                      <div className="text-lg font-bold leading-tight">{e.name}</div>
                      <div className="text-sm text-slate-300">{e.sets} × {e.targetReps} • {ctl.effSecs(e).rest}s rest</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* CENTER */}
        <main className="flex min-w-0 flex-col items-center px-4 py-4 text-center sm:px-6">
          <div className="text-xl text-slate-400">Exercise {centerIndex + 1} of {totalExercises}</div>
          <h1 className="text-5xl font-extrabold leading-tight">
            {centerExercise.name}
            {phase !== "resting" && side ? <span className="ml-3 rounded-xl bg-sky-500/20 px-3 py-1 align-middle text-3xl text-sky-300">{side}</span> : null}
            {phase === "resting" && nextStep && setLabel(nextStep.exercise, nextStep.setNumber) ? (
              <span className="ml-3 rounded-xl bg-sky-500/20 px-3 py-1 align-middle text-3xl text-sky-300">{setLabel(nextStep.exercise, nextStep.setNumber)}</span>
            ) : null}
          </h1>
          <div className="mt-1 text-2xl text-slate-300">
            {centerExercise.sets} sets × {centerExercise.targetReps} reps &nbsp;|&nbsp; Rest: {ctl.effSecs(centerExercise).rest}s
          </div>

          <div className="mt-2 w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
            <ExerciseAnimation
              exerciseId={centerExercise.animationId}
              repSeconds={ctl.effSecs(centerExercise).work / centerExercise.targetReps}
              paused={paused}
            />
            <div className="mt-1 flex justify-center">
              <button
                onClick={openForm}
                className="min-h-[56px] rounded-xl px-6 text-xl font-bold text-sky-300 hover:bg-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              >
                📷 Form guide
              </button>
            </div>
          </div>
          {showForm && <FormModal exercise={centerExercise} onClose={() => setShowForm(false)} />}

          {/* cues */}
          <ol className="mt-2 w-full max-w-3xl space-y-1 text-left">
            {(phase === "resting" && nextStep ? nextStep.exercise.cues : exercise.cues).slice(0, 4).map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-xl text-slate-200">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-base font-bold">{i + 1}</span>
                <span>{c}</span>
              </li>
            ))}
          </ol>

          {/* Timer card — tap to pause/resume (big touch target) */}
          <button
            onClick={ctl.togglePause}
            aria-label={paused ? "Resume workout" : "Pause workout"}
            className="mt-3 w-full max-w-3xl cursor-pointer rounded-3xl border border-slate-700 bg-slate-800/70 p-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
          >
            <div className="text-2xl font-bold uppercase tracking-widest text-slate-300">
              {phaseLabel} — Set {phase === "resting" && nextStep ? nextStep.setNumber : setNumber} of {centerExercise.sets}
            </div>
            <div className={`font-extrabold tabular-nums leading-none ${timerColor} text-[clamp(5rem,16vw,11rem)]`} aria-live="assertive">
              {formatClock(secondsRemaining)}
            </div>
            <div className="mx-auto mt-2 h-4 max-w-xl overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="text-left">
                <div className="text-base uppercase tracking-wider text-slate-400">Target reps</div>
                <div className="text-6xl font-extrabold">{centerExercise.targetReps}</div>
              </div>
              {phase === "working" && (() => {
                const repSecs = ctl.effSecs(exercise).work / exercise.targetReps;
                const elapsed = ctl.totalDuration - secondsRemaining;
                const est = Math.min(exercise.targetReps, Math.floor(elapsed / repSecs) + 1);
                return (
                  <div className="text-left">
                    <div className="text-base uppercase tracking-wider text-slate-400">Pace — rep</div>
                    <div className="text-6xl font-extrabold tabular-nums text-sky-300">~{est}</div>
                  </div>
                );
              })()}
              {paused
                ? <div className="rounded-xl bg-amber-400/15 px-4 py-2 text-2xl font-bold text-amber-300">Paused — tap to resume</div>
                : <div className="rounded-xl bg-slate-700/60 px-4 py-2 text-xl font-bold text-slate-300">Tap timer to pause</div>}
            </div>
          </button>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 pb-2">
            <BigButton color={paused ? "green" : "amber"} onClick={ctl.togglePause} ariaLabel={paused ? "Resume" : "Pause"}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </BigButton>
            {phase === "working" && <BigButton color="green" onClick={ctl.finishSetEarly}>Finish Set ✓</BigButton>}
            {phase === "resting" && <BigButton color="amber" onClick={() => ctl.extendRest(15)}>+15s rest</BigButton>}
            <BigButton color="slate" onClick={ctl.previous} ariaLabel="Previous set">⏮ Prev</BigButton>
            <BigButton color="blue" onClick={ctl.skip}>Skip ⏭</BigButton>
          </div>
          <div className="pb-6 text-base text-slate-500">Keys: Space = pause • F = finish • N = skip • P = prev • M = mute • V = voice</div>
        </main>

        {/* RIGHT */}
        <aside className="min-w-0 border-l border-slate-800 p-4 max-lg:hidden">
          <div className="mb-2 text-xl font-bold">Next Up</div>
          {nextStep && phase !== "resting" ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3">
              <ExerciseAnimation exerciseId={nextStep.exercise.animationId} variant="mini" />
              <div className="mt-1 text-xl font-bold">{nextStep.exercise.name}{setLabel(nextStep.exercise, nextStep.setNumber) ? ` — ${setLabel(nextStep.exercise, nextStep.setNumber)}` : ""}</div>
              <div className="text-base text-slate-400">Set {nextStep.setNumber} of {nextStep.exercise.sets} • {nextStep.exercise.targetReps} reps • {ctl.effSecs(nextStep.exercise).rest}s rest</div>
            </div>
          ) : phase === "resting" ? (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-xl font-bold text-amber-200">
              Rest — get ready. Next starts when the timer hits zero.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3 text-xl text-slate-300">Last set — finish strong.</div>
          )}
          <div className="mb-2 mt-4 text-xl font-bold">After That</div>
          <div className="space-y-2">
            {workout.exercises.slice(exerciseIndex + (phase === "resting" && nextStep && nextStep.exerciseIndex > exerciseIndex ? 1 : 0) + 1, exerciseIndex + 4).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                <ExerciseAnimation exerciseId={e.animationId} variant="mini" />
                <div>
                  <div className="text-lg font-bold leading-tight">{e.shortName}</div>
                  <div className="text-sm text-slate-400">{e.sets} × {e.targetReps} • {ctl.effSecs(e).rest}s</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-left text-base text-slate-300">
            <div className="mb-1 font-bold text-slate-200">Tips</div>
            <ul className="list-disc space-y-0.5 pl-5">
              <li>Keep your core engaged.</li>
              <li>Control the weight.</li>
              <li>Full range of motion.</li>
              <li>Breathe: exhale up, inhale down.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Bottom strip */}
      <footer className="hf-safe-bottom hf-safe-x flex flex-wrap items-center justify-around gap-4 border-t border-slate-800 bg-slate-900/60 py-2">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm uppercase tracking-wider text-sky-300">Up next</div>
            <div className="text-2xl font-bold">{nextStep ? nextStep.exercise.name : "Done"}</div>
          </div>
          {nextStep && <ExerciseAnimation exerciseId={nextStep.exercise.animationId} variant="mini" />}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm uppercase tracking-wider text-sky-300">Get ready</span>
          <span className="text-xl text-slate-300">Next in</span>
          <span className="text-5xl font-extrabold tabular-nums text-amber-300">{formatClock(secondsRemaining)}</span>
        </div>
      </footer>
    </div>
  );
}
