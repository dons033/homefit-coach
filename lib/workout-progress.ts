import { isPreparation, type Exercise, type Workout } from "./workout";
export function workoutSequence(workout: Workout): Exercise[] {
  return [
    ...(workout.warmup ?? []),
    ...workout.exercises,
    ...(workout.cooldown ?? []),
  ];
}
export function followingSet(
  sequence: Exercise[],
  exerciseIndex: number,
  setNumber: number,
) {
  const current = sequence[exerciseIndex];
  if (setNumber < current.sets)
    return { exerciseIndex, setNumber: setNumber + 1 };
  return exerciseIndex + 1 < sequence.length
    ? { exerciseIndex: exerciseIndex + 1, setNumber: 1 }
    : null;
}
export type SetResult = {
  exerciseIndex: number;
  setNumber: number;
  outcome: "completed" | "skipped";
};
export function recordSet(
  results: SetResult[],
  result: SetResult,
): SetResult[] {
  return [
    ...results.filter(
      (r) =>
        r.exerciseIndex !== result.exerciseIndex ||
        r.setNumber !== result.setNumber,
    ),
    result,
  ];
}
export function completionStats(sequence: Exercise[], results: SetResult[]) {
  const working = sequence
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => !isPreparation(e));
  const completed = results.filter(
    (r) =>
      sequence[r.exerciseIndex] &&
      !isPreparation(sequence[r.exerciseIndex]) &&
      r.outcome === "completed",
  );
  return {
    completedSets: completed.length,
    completedExercises: working.filter(
      ({ e, i }) =>
        completed.filter((r) => r.exerciseIndex === i).length === e.sets,
    ).length,
    allSets: working.reduce((n, { e }) => n + e.sets, 0),
    allExercises: working.length,
  };
}
