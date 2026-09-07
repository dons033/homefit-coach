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
import {
  isPreparation,
  repTarget,
  setDescription,
  type Exercise,
  type Workout,
} from "@/lib/workout";
import {
  workoutSequence,
  followingSet,
  recordSet,
  completionStats,
  type SetResult,
} from "@/lib/workout-progress";

export type Phase = "idle" | "ready" | "working" | "resting" | "complete";
export const READY_SECONDS = 5;
export type NextStep = {
  exercise: Exercise;
  exerciseIndex: number;
  setNumber: number;
} | null;
type ControllerOptions = { fast?: boolean; pacing?: PaceSettings };

export function useWorkoutController(
  workout: Workout,
  opts: ControllerOptions = {},
) {
  const sequence = useMemo(() => workoutSequence(workout), [workout]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(loadVoiceOn);
  const [workoutStart, setWorkoutStart] = useState<number | null>(null);
  const [workoutEnd, setWorkoutEnd] = useState<number | null>(null);
  const [results, setResults] = useState<SetResult[]>([]);
  const resultsRef = useRef<SetResult[]>([]);
  const stateRef = useRef({ phase, exerciseIndex, setNumber, paused });
  stateRef.current = { phase, exerciseIndex, setNumber, paused };
  const endsAtRef = useRef(0),
    durationRef = useRef(0),
    pausedRemainingRef = useRef(0);
  const firedRef = useRef(new Set<number>());
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const mounted = useRef(true);
  const releaseWakeLock = useCallback(() => {
    void wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);
  const requestWakeLock = useCallback(async () => {
    try {
      const lock = await navigator.wakeLock?.request("screen");
      if (!lock) return;
      if (
        !mounted.current ||
        ["idle", "complete"].includes(stateRef.current.phase)
      ) {
        await lock.release();
        return;
      }
      wakeLockRef.current = lock;
      lock.addEventListener("release", () => {
        if (wakeLockRef.current === lock) wakeLockRef.current = null;
      });
    } catch {
      /* Browser may not support or grant a screen wake lock. */
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    initVoice(loadVoiceOn());
    return () => {
      mounted.current = false;
      cancelVoice();
      releaseWakeLock();
    };
  }, [releaseWakeLock]);
  useEffect(() => {
    const visible = () => {
      if (
        document.visibilityState === "visible" &&
        !["idle", "complete"].includes(stateRef.current.phase) &&
        !wakeLockRef.current
      )
        void requestWakeLock();
    };
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [requestWakeLock]);
  const readySecs = opts.fast
    ? 3
    : opts.pacing?.customEnabled
      ? opts.pacing.readySeconds
      : READY_SECONDS;
  const effSecs = useCallback(
    (ex: Exercise) => {
      if (isPreparation(ex))
        return { work: opts.fast ? 2 : ex.workSeconds, rest: 0 };
      if (ex.kind === "hold")
        return { work: opts.fast ? 8 : ex.workSeconds, rest: ex.restSeconds };
      const per = opts.pacing?.exercises[ex.id];
      return {
        work: opts.fast
          ? 8
          : (per?.workSeconds ??
            (opts.pacing?.customEnabled
              ? opts.pacing.workSeconds
              : ex.workSeconds)),
        rest: opts.fast
          ? 6
          : (per?.restSeconds ??
            (opts.pacing?.customEnabled
              ? opts.pacing.restSeconds
              : ex.restSeconds)),
      };
    },
    [opts.fast, opts.pacing],
  );
  const customPacing =
    !opts.fast &&
    (!!opts.pacing?.customEnabled ||
      perExerciseOverrideCount(
        opts.pacing ?? ({ exercises: {} } as PaceSettings),
      ) > 0);
  const beginPhase = useCallback(
    (p: "ready" | "working" | "resting", ei: number, sn: number) => {
      const ex = sequence[ei];
      const d =
        p === "ready"
          ? readySecs
          : p === "working"
            ? effSecs(ex).work
            : effSecs(ex).rest;
      stateRef.current = {
        phase: p,
        exerciseIndex: ei,
        setNumber: sn,
        paused: false,
      };
      durationRef.current = d;
      endsAtRef.current = Date.now() + d * 1000;
      firedRef.current = new Set();
      setPhase(p);
      setExerciseIndex(ei);
      setSetNumber(sn);
      setPaused(false);
      setSecondsRemaining(d);
      if (p === "ready")
        speak(`${ex.name}. ${setDescription(ex, sn)}. ${repTarget(ex)}.`);
      if (p === "working" && isPreparation(ex))
        speak(`${ex.name}. ${ex.cues[0]}`);
      if (p === "resting") speak("Rest.");
    },
    [sequence, readySecs, effSecs],
  );
  const complete = useCallback(() => {
    stateRef.current.phase = "complete";
    setPhase("complete");
    setWorkoutEnd(Date.now());
    setPaused(false);
    releaseWakeLock();
  }, [releaseWakeLock]);
  const goNext = useCallback(() => {
    const s = stateRef.current;
    const next = followingSet(sequence, s.exerciseIndex, s.setNumber);
    if (!next) {
      complete();
      sounds.complete();
      speak("Workout finished. Well done.");
      return;
    }
    const ex = sequence[next.exerciseIndex];
    beginPhase(
      isPreparation(ex) ? "working" : "ready",
      next.exerciseIndex,
      next.setNumber,
    );
  }, [sequence, beginPhase, complete]);
  const advanceFromWork = useCallback(
    (outcome: "completed" | "skipped" = "completed") => {
      const s = stateRef.current;
      if (s.phase !== "working" || s.paused) return;
      const ex = sequence[s.exerciseIndex];
      resultsRef.current = recordSet(resultsRef.current, {
        exerciseIndex: s.exerciseIndex,
        setNumber: s.setNumber,
        outcome,
      });
      setResults(resultsRef.current);
      sounds.setComplete();
      if (
        isPreparation(ex) ||
        !followingSet(sequence, s.exerciseIndex, s.setNumber) ||
        (sequence[s.exerciseIndex + 1]?.kind === "cooldown" &&
          s.setNumber === ex.sets) ||
        effSecs(ex).rest === 0
      )
        goNext();
      else beginPhase("resting", s.exerciseIndex, s.setNumber);
    },
    [sequence, effSecs, goNext, beginPhase],
  );
  const start = useCallback(() => {
    unlockAudio();
    resultsRef.current = [];
    setResults([]);
    setWorkoutStart(Date.now());
    setWorkoutEnd(null);
    beginPhase(isPreparation(sequence[0]) ? "working" : "ready", 0, 1);
    void requestWakeLock();
  }, [sequence, beginPhase, requestWakeLock]);
  useEffect(() => {
    if (phase === "idle" || phase === "complete" || paused) return;
    const id = window.setInterval(() => {
      const s = stateRef.current;
      if (s.paused || s.phase === "complete" || s.phase === "idle") return;
      const remainMs = endsAtRef.current - Date.now();
      const sec = Math.max(0, Math.ceil(remainMs / 1000));
      setSecondsRemaining(sec);
      const fire = (key: number, fn: () => void) => {
        if (!firedRef.current.has(key)) {
          firedRef.current.add(key);
          fn();
        }
      };
      if (sec >= 1 && sec <= 3) fire(sec, sounds.beep);
      if (s.phase === "resting" && sec === 10 && durationRef.current > 12)
        fire(10, sounds.warn);
      if (
        s.phase === "working" &&
        sec === Math.ceil(durationRef.current / 2) &&
        durationRef.current >= 12
      )
        fire(100, sounds.halfway);
      if (remainMs <= 0) {
        if (s.phase === "ready") {
          sounds.start();
          beginPhase("working", s.exerciseIndex, s.setNumber);
        } else if (s.phase === "working") advanceFromWork();
        else goNext();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, paused, beginPhase, advanceFromWork, goNext]);
  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.paused || ["idle", "complete"].includes(s.phase)) return;
    pausedRemainingRef.current = Math.max(0, endsAtRef.current - Date.now());
    s.paused = true;
    setPaused(true);
    cancelVoice();
  }, []);
  const resume = useCallback(() => {
    if (!stateRef.current.paused) return;
    unlockAudio();
    endsAtRef.current = Date.now() + pausedRemainingRef.current;
    stateRef.current.paused = false;
    setPaused(false);
    void requestWakeLock();
  }, [requestWakeLock]);
  const togglePause = useCallback(() => {
    if (stateRef.current.paused) resume();
    else pause();
  }, [pause, resume]);
  const finishSetEarly = useCallback(
    () => advanceFromWork("completed"),
    [advanceFromWork],
  );
  const skip = useCallback(() => {
    const s = stateRef.current;
    if (s.paused) return;
    cancelVoice();
    if (s.phase === "working") advanceFromWork("skipped");
    else if (s.phase === "ready") {
      sounds.start();
      beginPhase("working", s.exerciseIndex, s.setNumber);
    } else if (s.phase === "resting") goNext();
  }, [advanceFromWork, beginPhase, goNext]);
  const skipFinisher = useCallback(() => {
    const s = stateRef.current;
    const next = followingSet(sequence, s.exerciseIndex, s.setNumber);
    const index = sequence[s.exerciseIndex].optional
      ? s.exerciseIndex
      : s.phase === "resting" && next && sequence[next.exerciseIndex].optional
        ? next.exerciseIndex
        : -1;
    if (index < 0) return;
    cancelVoice();
    resultsRef.current = recordSet(resultsRef.current, {
      exerciseIndex: index,
      setNumber: 1,
      outcome: "skipped",
    });
    setResults(resultsRef.current);
    const after = sequence[index + 1];
    if (after)
      beginPhase(isPreparation(after) ? "working" : "ready", index + 1, 1);
    else complete();
  }, [sequence, beginPhase, complete]);
  const skipPreparation = useCallback(() => {
    const s = stateRef.current;
    const kind = sequence[s.exerciseIndex].kind;
    if (kind !== "warmup" && kind !== "cooldown") return;
    cancelVoice();
    let index = s.exerciseIndex;
    while (index < sequence.length && sequence[index].kind === kind) {
      resultsRef.current = recordSet(resultsRef.current, {
        exerciseIndex: index,
        setNumber: 1,
        outcome: "skipped",
      });
      index++;
    }
    setResults(resultsRef.current);
    if (index < sequence.length)
      beginPhase(
        isPreparation(sequence[index]) ? "working" : "ready",
        index,
        1,
      );
    else complete();
  }, [sequence, beginPhase, complete]);
  const extendRest = useCallback((seconds: number) => {
    if (stateRef.current.phase !== "resting" || stateRef.current.paused) return;
    endsAtRef.current += seconds * 1000;
    durationRef.current += seconds;
    setSecondsRemaining(
      Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000)),
    );
  }, []);
  const previous = useCallback(() => {
    const s = stateRef.current;
    if (s.paused || ["idle", "complete"].includes(s.phase)) return;
    const ei =
      s.setNumber > 1 ? s.exerciseIndex : Math.max(0, s.exerciseIndex - 1);
    const sn =
      s.setNumber > 1
        ? s.setNumber - 1
        : s.exerciseIndex > 0
          ? sequence[ei].sets
          : 1;
    resultsRef.current = resultsRef.current.filter(
      (r) =>
        r.exerciseIndex < ei || (r.exerciseIndex === ei && r.setNumber < sn),
    );
    setResults(resultsRef.current);
    cancelVoice();
    beginPhase(isPreparation(sequence[ei]) ? "working" : "ready", ei, sn);
  }, [sequence, beginPhase]);
  const endWorkout = useCallback(() => {
    cancelVoice();
    complete();
  }, [complete]);
  const reset = useCallback(() => {
    cancelVoice();
    releaseWakeLock();
    stateRef.current = {
      phase: "idle",
      exerciseIndex: 0,
      setNumber: 1,
      paused: false,
    };
    setPhase("idle");
    setExerciseIndex(0);
    setSetNumber(1);
    setPaused(false);
    setWorkoutStart(null);
    setWorkoutEnd(null);
    setSecondsRemaining(0);
    resultsRef.current = [];
    setResults([]);
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.closest(
          'input,textarea,select,[role="dialog"]',
        )
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePause();
      } else if (e.key.toLowerCase() === "n") skip();
      else if (e.key.toLowerCase() === "f") finishSetEarly();
      else if (e.key.toLowerCase() === "p") previous();
      else if (e.key.toLowerCase() === "m") toggleMute();
      else if (e.key.toLowerCase() === "v") toggleVoice();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause, skip, finishSetEarly, previous, toggleMute, toggleVoice]);
  const next = followingSet(sequence, exerciseIndex, setNumber);
  const nextStep: NextStep = next
    ? { ...next, exercise: sequence[next.exerciseIndex] }
    : null;
  const stats = completionStats(sequence, results);
  const requiredComplete = sequence.every(
    (ex, i) =>
      isPreparation(ex) ||
      ex.optional ||
      results.filter((r) => r.exerciseIndex === i && r.outcome === "completed")
        .length === ex.sets,
  );
  const totalDuration = durationRef.current || 1;
  return {
    phase,
    paused,
    exercise: sequence[exerciseIndex],
    exerciseIndex,
    setNumber,
    secondsRemaining,
    totalDuration,
    progress: Math.min(
      1,
      Math.max(0, (totalDuration - secondsRemaining) / totalDuration),
    ),
    nextStep,
    muted,
    voiceEnabled,
    workoutStart,
    workoutEnd,
    completedSetsTotal: stats.completedSets,
    completedExercisesTotal: stats.completedExercises,
    allSetsTotal: stats.allSets,
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
    skipFinisher,
    skipPreparation,
    previous,
    endWorkout,
    reset,
    toggleMute,
    toggleVoice,
    sequence,
    results,
    requiredComplete,
  };
}
export type WorkoutController = ReturnType<typeof useWorkoutController>;
