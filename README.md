# Coach scaffold

The home route is a local-first weekly coach. The original configurable Upper Body A player remains at `/workout`; `/lab` is unchanged.

## Working flows

- Browse calendar weeks; add multiple sessions per date; move, copy, remove, or mark sessions complete.
- Compose guided workouts from the shared exercise catalog, selecting variants and independent sets, reps, work, and rest. Launch those workouts in the existing follow-along player. Save completion and elapsed minutes back to the plan.
- Record or schedule external activities such as P90X, a Pilates class, or dog walking, with duration and notes.
- Choose Mass, Lean, GLP-1 maintenance, Endurance, Athleticism, or Power / strength as the purpose of new sessions. This is intent metadata, not automatic or medical programming. GLP-1 intent stays distinct on the session; the legacy player uses its lean presentation.
- Use the local planning assistant to propose moving the selected day's first unfinished session to tomorrow. Apply or dismiss the proposal.

## Data and reuse

`lib/exercise-catalog.ts` owns movement definitions, cues, variants, and equipment. Add new exercises there once. The library and builder discover them automatically. Optional form images and animations can be added later.

`lib/workout.ts` exports `WorkoutEntry` and `buildWorkout`. Entries reference catalog IDs; programming belongs to each workout, so changing one workout does not change another. Saved guided sessions retain a resolved workout snapshot so later catalog edits do not silently rewrite scheduled sessions. Deliberate catalog-version migration can be added when needed.

`lib/coach.ts` owns the versioned plan, local calendar helpers, assistant contract, and future device contracts. Browser storage key: `homefit.coach.v1`. Malformed data is rejected; storage failures are visible. There is no server persistence, authentication, cloud sync, or cross-tab conflict resolution yet.

## Agent extension

Reviewed `Digby/digby-app/app/components/digby-chat.tsx` and Team You's `src/lib/llm/chat.ts` and `src/lib/runtime/agentComposer.ts`. The scaffold follows their separation between interface, provider, and capabilities; it does not copy their app-specific runtime or credentials.

Replace `localCoach` through the `CoachProvider` interface with a server-backed adapter to the selected runtime. Pass only the necessary plan context. Keep model credentials server-side, validate tool arguments and session IDs, and return typed proposals. The current UI explicitly labels its deterministic local mode. Open-ended conversation, streaming, model selection, and real AI-generated plans are not wired up.

## Device extension

`FitnessDeviceAdapter` defines connect/disconnect/pull; `DeviceMeasurement` defines normalized weight, blood-pressure, heart-rate, and step records with source IDs and timestamps. Add vendor authorization, token storage, deduplication, ingestion persistence, and device-specific Bluetooth support when implementing an adapter. The Connections view lists future categories and never claims a device is connected.

## Verification

- `npm test`: existing workout/pacing/catalog checks plus calendar boundary, schema, proposal non-mutation, and exercise reuse checks.
- `npx tsc --noEmit` and `npm run build`.
- Browser checked: activity creation and reload persistence, assistant proposal/apply, custom floor-press composition and playback, completion recording, desktop and 390px mobile rendering. No browser errors reported.

## Lower Body A

Use the Lower Body A card on My week or Exercise library to add the workout to the selected date. Preview at `/workout?id=lower-body-a`; `&fast=1` enables shortened demonstration timers.

The workout includes the prescribed six exercises (18 working sets), a continuous six-part 3-minute warm-up, an optional 45-second wall sit, and a 3-minute cool-down. Programmed time including warm-up and cool-down is approximately 37 minutes with the finisher and 36 without. There are no additional main exercises.

The start screen offers bench hip thrust/floor bridge selection and finisher inclusion. During work, DONE immediately begins rest; the timer is a maximum rather than a continuous-repetition instruction. Split squats display LEFT LEG / RIGHT LEG with per-leg set numbering. Reverse lunges show 8 per side (16 total). Holds and warm-ups have no rep target.

`lib/lower-body-catalog.ts` contains the reusable lower-body movement definitions, form instructions, and avoid lists. `components/LowerBodyAnimation.tsx` supplies the requested front/side animated views, including warm-up movements and a static wall sit. `lib/workout-progress.ts` separates progression and actual completed/skipped results. Skipped sets and unfinished workouts are not reported as completed. Completing a scheduled session stores elapsed minutes, actual exercise/set counts, and the chosen workout setup.

Regression checks in `lib/__tests__/lower-body.ts` cover the exact programming, left/right order, warm-up duration, optional hold, variant reuse, saved-plan validation, movement poses, and completion accounting. Browser verification confirmed continuous warm-up transitions, the four alternating split-squat sets, DONE/rest behavior, and a skipped finisher ending with six exercises and 18 completed sets.

## Warm-up and cool-down

Both built-in workouts include six 30-second warm-up segments and six 30-second cool-down segments. Lower Body A retains its original warm-up; Upper Body A uses marching, shoulder rolls, forward/backward arm circles, shoulder-blade squeezes, and wall push-ups. Cool-downs use an easy march and gentle stretches appropriate to the workout. These are separate timed phases with visual guidance, no rep targets, and no rests between segments.

The cool-down follows the final exercise or optional finisher. Skipping the finisher still starts the cool-down. Each preparation phase can be paused, advanced one segment, or skipped entirely. Working-set/exercise completion counts exclude both phases. Total elapsed time and duration estimates include them: approximately 37 minutes for Lower Body A with the finisher, and 48 minutes for Upper Body A.

Older unfinished built-in plans receive missing warm-up/cool-down phases when loaded. Their exercise programming and variants remain intact; completed history is not rewritten. Custom-built workouts are unchanged. Routine definitions live in `lib/preparation.ts`; `PreparationPreview` and `PreparationAnimation` provide the shared presentation.

Browser checks for the preparation update confirmed: skipping the optional wall sit enters cool-down segment 1; the timed cool-down advances without rests and ends at the completion summary with six exercises and 18 sets; the upper-body route starts with its new guided warm-up. Mobile cool-down visuals and pause controls were checked, and the production build and logic tests pass.
