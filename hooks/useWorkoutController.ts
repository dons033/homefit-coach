"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sounds, unlockAudio, setMuted as setAudioMuted } from "@/lib/audio";
import {
  cancelVoice,
  initVoice,
  isVoiceOn,
  loadVoiceOn,
  saveVoiceOn,
  speak,
} from "@/lib/voice";
import { perExerciseOverrideCount, type PaceSettings } from "@/lib/pacing";
import type { Exercise, Workout } from "@/lib/workout";

export type Phase = "idle" | "ready" | "working" | "resting" | "complete";
export const READY_SECONDS = 5;

export type NextStep = {
  exercise: Exercise;
  exerciseIndex: number;
  setNumber: number;
} | null;

type ControllerOptions = {
  /** Override durations for fast testing (?fast=1). */
  fast?: boolean;
  /** User-adjustable pacing from the home screen. */
  pacing?: PaceSettings;
};

/**
 * Single owner of workout progression + timing.
 * Uses timestamps (phaseEndsAt) so remaining time is computed from Date.now(),
 * not from decrementing a counter — resilient to render stalls.
 */
export function useWorkoutController(workout: Workout, opts: ControllerOptions = {}) {
  const fast = !!opts.fast;
  const [phase, setPhase] = useState<Phase>("idle");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1); // 1-indexed within exercise
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(loadVoiceOn);
  const [workoutStart, setWorkoutStart] = useState<number | null>(null);
  const [workoutEnd, setWorkoutEnd] = useState<number | null>(null);

  useEffect(() => {
    initVoice(loadVoiceOn());
  }, []);

  const endsAtRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const pausedRemainingRef = useRef<number>(0);
  const wakeLockRef = useRef<{ release: () => void } | null>(null);
  const stateRef = useRef({ phase, exerciseIndex, setNumber, paused });
  stateRef.current = { phase, exerciseIndex, setNumber, paused };
  const firedRef = useRef<Set<number>>(new Set());

  // ---- screen wake lock: keep the iPad awake mid-workout ----
  const releaseWakeLock = useCallback(() => {
    try {
      wakeLockRef.current?.release();
    } catch {
      /* already released */
    }
    wakeLockRef.current = null;
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: string) => Promise<{ release: () => void }> };
      };
      if (nav.wakeLock) {
        wakeLockRef.current = await nav.wakeLock.request("screen");
      }
    } catch {
      /* unsupported browser — screen may sleep, timer still runs */
    }
  }, []);

  // Re-acquire if the OS releases it while the workout is running.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        const s = stateRef.current;
        if (s.phase !== "idle" && s.phase !== "complete" && !wakeLockRef.current) {
          void requestWakeLock();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [requestWakeLock]);

  const durations = useMemo(() => {
    if (fast) return { ready: 3, work: 8, rest: 6 };
    if (opts.pacing?.customEnabled) {
      return {
        ready: opts.pacing.readySeconds,
        work: opts.pacing.workSeconds,
        rest: opts.pacing.restSeconds,
      };
    }
    return null;
  }, [fast, opts.pacing]);
  const customPacing =
    (!!opts.pacing?.customEnabled ||
      perExerciseOverrideCount(opts.pacing ?? { exercises: {} } as PaceSettings) > 0) &&
    !fast;

  const pacingFor = useCallback(
    (ex: Exercise) => opts.pacing?.exercises?.[ex.id],
    [opts.pacing]
  );

  const readySecs = durations?.ready ?? READY_SECONDS;
  const workSecsFor = useCallback(
    (ex: Exercise) =>
      durations?.work ?? pacingFor(ex)?.workSeconds ?? ex.workSeconds,
    [durations, pacingFor]
  );
  const restSecsFor = useCallback(
    (ex: Exercise) =>
      durations?.rest ?? pacingFor(ex)?.restSeconds ?? ex.restSeconds,
    [durations, pacingFor]
  );

  /** Effective work/rest for any exercise, honoring all pacing layers. */
  const effSecs = useCallback(
    (ex: Exercise) => ({ work: workSecsFor(ex), rest: restSecsFor(ex) }),
    [workSecsFor, restSecsFor]
  );

  const exercise: Exercise = workout.exercises[exerciseIndex];

  /** Where do we go after the current set finishes? */
  const nextStep: NextStep = useMemo(() => {
    const ex = workout.exercises[exerciseIndex];
    if (!ex) return null;
    if (setNumber < ex.sets) {
      return { exercise: ex, exerciseIndex, setNumber: setNumber + 1 };
    }
    if (exerciseIndex + 1 < workout.exercises.length) {
      const nx = workout.exercises[exerciseIndex + 1];
      return { exercise: nx, exerciseIndex: exerciseIndex + 1, setNumber: 1 };
    }
    return null;
  }, [workout, exerciseIndex, setNumber]);

  const beginPhase = useCallback((p: Exclude<Phase, "idle" | "complete">, ei: number, sn: number) => {
    const ex = workout.exercises[ei];
    const d =
      p === "ready"
        ? durations?.ready ?? READY_SECONDS
        : p === "working"
          ? durations?.work ?? pacingFor(ex)?.workSeconds ?? ex.workSeconds
          : durations?.rest ?? pacingFor(ex)?.restSeconds ?? ex.restSeconds;
    durationRef.current = d;
    endsAtRef.current = Date.now() + d * 1000;
    firedRef.current = new Set();
    setPhase(p);
    setExerciseIndex(ei);
    setSetNumber(sn);
    setPaused(false);
    setSecondsRemaining(d);
    if (p === "ready") {
      const side = ex.sides?.[sn - 1] ? `, ${ex.sides[sn - 1]} side` : "";
      speak(`${ex.name}, set ${sn} of ${ex.sets}${side}. ${ex.targetReps} reps.`);
    } else if (p === "resting") {
      speak("Rest.");
    }
  }, [workout, durations, pacingFor]);

  const start = useCallback(() => {
    unlockAudio();
    void requestWakeLock();
    setWorkoutStart(Date.now());
    setWorkoutEnd(null);
    beginPhase("ready", 0, 1);
  }, [beginPhase, requestWakeLock]);

  const advanceFromWork = useCallback(() => {
    const s = stateRef.current;
    const ex = workout.exercises[s.exerciseIndex];
    sounds.setComplete();
    const isLastSet = s.setNumber >= ex.sets;
    const isLastExercise = s.exerciseIndex >= workout.exercises.length - 1;
    if (isLastSet && isLastExercise) {
      setPhase("complete");
      setWorkoutEnd(Date.now());
      sounds.complete();
      speak("Workout complete. Well done.");
      releaseWakeLock();
    } else {
      beginPhase("resting", s.exerciseIndex, s.setNumber);
    }
  }, [workout, beginPhase, releaseWakeLock]);

  const advanceFromRest = useCallback(() => {
    const s = stateRef.current;
    const ex = workout.exercises[s.exerciseIndex];
    sounds.start();
    if (s.setNumber < ex.sets) {
      beginPhase("ready", s.exerciseIndex, s.setNumber + 1);
    } else {
      beginPhase("ready", s.exerciseIndex + 1, 1);
    }
  }, [workout, beginPhase]);

  // ---- ticker: recompute remaining from timestamp every 100ms ----
  useEffect(() => {
    if (phase === "idle" || phase === "complete" || paused) return;
    const id = window.setInterval(() => {
      const s = stateRef.current;
      if (s.paused) return;
      const remainMs = endsAtRef.current - Date.now();
      const remainSec = Math.max(0, Math.ceil(remainMs / 1000));
      setSecondsRemaining(remainSec);

      const p = s.phase;
      const ex = workout.exercises[s.exerciseIndex];
      const fired = firedRef.current;

      const fireOnce = (key: number, fn: () => void) => {
        if (!fired.has(key)) {
          fired.add(key);
          fn();
        }
      };

      if (p === "ready") {
        if (remainSec === 3 || remainSec === 2 || remainSec === 1) fireOnce(remainSec, () => sounds.beep());
        if (remainMs <= 0) {
          sounds.start();
          const d = durations?.work ?? pacingFor(ex)?.workSeconds ?? ex.workSeconds;
          durationRef.current = d;
          endsAtRef.current = Date.now() + d * 1000;
          firedRef.current = new Set();
          setPhase("working");
          setSecondsRemaining(d);
        }
      } else if (p === "working") {
        const total = durations?.work ?? pacingFor(ex)?.workSeconds ?? ex.workSeconds;
        // halfway marker — distinct double-tone, only for sets long enough
        if (total >= 12) {
          const half = Math.ceil(total / 2);
          if (remainSec === half) fireOnce(300, () => sounds.halfway());
        }
        // final 3 seconds countdown
        if (remainSec <= 3 && remainSec >= 1 && total > 4) fireOnce(100 + remainSec, () => sounds.beep());
        if (remainMs <= 0) {
          // use functional advance to avoid stale closure; call via timeout to stay out of interval
          window.setTimeout(() => advanceFromWork(), 0);
        }
      } else if (p === "resting") {
        const total = durations?.rest ?? pacingFor(ex)?.restSeconds ?? ex.restSeconds;
        if (remainSec === 10 && total > 12) fireOnce(10, () => sounds.warn());
        if (remainSec <= 3 && remainSec >= 1) fireOnce(200 + remainSec, () => sounds.beep());
        if (remainMs <= 0) {
          window.setTimeout(() => advanceFromRest(), 0);
        }
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, paused, workout, durations, pacingFor, advanceFromWork, advanceFromRest]);

  // ---- controls ----
  const pause = useCallback(() => {
    if (stateRef.current.paused) return;
    pausedRemainingRef.current = Math.max(0, endsAtRef.current - Date.now());
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    unlockAudio();
    void requestWakeLock();
    endsAtRef.current = Date.now() + pausedRemainingRef.current;
    setPaused(false);
  }, [requestWakeLock]);

  const togglePause = useCallback(() => {
    if (stateRef.current.paused) resume();
    else pause();
  }, [pause, resume]);

  /** Finish current work set early -> go to rest (or complete). */
  const finishSetEarly = useCallback(() => {
    if (stateRef.current.phase !== "working" || stateRef.current.paused) return;
    advanceFromWork();
  }, [advanceFromWork]);

  /** Skip forward: work->rest, ready->work, rest->next ready. */
  const skip = useCallback(() => {
    const s = stateRef.current;
    if (s.paused) return;
    cancelVoice();
    if (s.phase === "working") advanceFromWork();
    else if (s.phase === "ready") {
      sounds.start();
      const ex = workout.exercises[s.exerciseIndex];
      const d = durations?.work ?? pacingFor(ex)?.workSeconds ?? ex.workSeconds;
      durationRef.current = d;
      endsAtRef.current = Date.now() + d * 1000;
      firedRef.current = new Set();
      setPhase("working");
      setSecondsRemaining(d);
    } else if (s.phase === "resting") advanceFromRest();
  }, [workout, durations, pacingFor, advanceFromWork, advanceFromRest]);

  /** Add time to the current rest (e.g. "+15s" when you need longer). */
  const extendRest = useCallback((extraSeconds: number) => {
    if (stateRef.current.phase !== "resting" || stateRef.current.paused) return;
    endsAtRef.current += extraSeconds * 1000;
    durationRef.current += extraSeconds;
    setSecondsRemaining(Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000)));
  }, []);

  /** Go back one set (or to last set of previous exercise). */
  const previous = useCallback(() => {
    const s = stateRef.current;
    if (s.paused) return;
    if (s.phase === "idle" || s.phase === "complete") return;
    cancelVoice();
    if (s.setNumber > 1) {
      beginPhase("ready", s.exerciseIndex, s.setNumber - 1);
    } else if (s.exerciseIndex > 0) {
      const prev = workout.exercises[s.exerciseIndex - 1];
      beginPhase("ready", s.exerciseIndex - 1, prev.sets);
    } else {
      beginPhase("ready", 0, 1);
    }
  }, [workout, beginPhase]);

  const endWorkout = useCallback(() => {
    cancelVoice();
    setPhase("complete");
    setWorkoutEnd(Date.now());
    releaseWakeLock();
  }, [releaseWakeLock]);

  const reset = useCallback(() => {
    cancelVoice();
    releaseWakeLock();
    setPhase("idle");
    setExerciseIndex(0);
    setSetNumber(1);
    setPaused(false);
    setWorkoutStart(null);
    setWorkoutEnd(null);
    setSecondsRemaining(0);
  }, [releaseWakeLock]);

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      setAudioMuted(!m);
      if (!m) cancelVoice();
      return !m;
    });
  }, []);

  const toggleVoice = useCallback(() => {
    const next = !isVoiceOn();
    saveVoiceOn(next);
    setVoiceEnabled(next);
  }, []);

  // keyboard shortcuts (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        const s = stateRef.current;
        if (s.phase !== "idle" && s.phase !== "complete") togglePause();
      } else if (e.key === "n" || e.key === "N") skip();
      else if (e.key === "f" || e.key === "F") finishSetEarly();
      else if (e.key === "p" || e.key === "P") previous();
      else if (e.key === "m" || e.key === "M") toggleMute();
      else if (e.key === "v" || e.key === "V") toggleVoice();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause, skip, finishSetEarly, previous, toggleMute, toggleVoice]);

  const totalDuration = durationRef.current || 1;
  const elapsed = totalDuration - secondsRemaining;
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration));

  const completedSetsTotal = useMemo(() => {
    let n = 0;
    for (let i = 0; i < exerciseIndex; i++) n += workout.exercises[i].sets;
    if (phase === "complete") {
      n += workout.exercises[exerciseIndex]?.sets ?? 0;
    } else if (phase !== "idle") {
      n += setNumber - 1;
      if (phase === "resting") n += 1; // just finished this set
    }
    return n;
  }, [workout, exerciseIndex, setNumber, phase]);

  const allSetsTotal = useMemo(
    () => workout.exercises.reduce((a, e) => a + e.sets, 0),
    [workout]
  );

  return {
    phase,
    paused,
    exercise,
    exerciseIndex,
    setNumber,
    secondsRemaining,
    totalDuration,
    progress,
    nextStep,
    muted,
    voiceEnabled,
    workoutStart,
    workoutEnd,
    completedSetsTotal,
    allSetsTotal,
    readySecs,
    customPacing,
    effSecs,
    start,
    pause,
    resume,
    togglePause,
    finishSetEarly,
    extendRest,
    skip,
    previous,
    endWorkout,
    reset,
    toggleMute,
    toggleVoice,
  };
}

export type WorkoutController = ReturnType<typeof useWorkoutController>;
