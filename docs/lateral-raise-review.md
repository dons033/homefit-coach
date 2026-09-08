# Lateral raise: review candidate

This example is ready for visual review, not claimed to be professionally approved.
Review URL: `/lab/lateral-raise`. The same component is used by the player and lab.

## Movement specification

- Standing dumbbell lateral raise; feet planted, torso steady, neutral wrists.
- Two independent shoulder pivots. Upper arm and forearm retain lengths 26 and 24 drawing units; elbow bend stays 12 degrees.
- Both arms share a movement plane 20 degrees forward of the frontal plane. Front and 40-degree camera views project that same geometry; the second view is explicitly three-quarter, not side.
- Preserve the existing 85-degree sweep (15 to 100 degrees) and 0/38/52/88/100 rep windows. These angles are drawing choices matching the supplied raised photo, not a universal range prescription.
- Show a controlled wide lift to around shoulder height, then a return. Do not add the catalog's “pouring water” cue to the example; it needs separate expert review against current technique guidance.
- No independent path morphing: a rigid arm with a fixed elbow bend rotates around each shoulder. Bells ride that CSS rotation and counter-rotate to remain upright. Both views use the same duration, delay, easing, and timeline.
- Static body white, moving arms/bells blue, dark-ring shoulder pivots, subdued endpoint ghosts and the actual projected hand trajectory.

## Evidence and review

- Local photos: `public/form/lateral-raise/0.jpg` and `1.jpg`.
- ACE technique reference: https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/ (reviewed 2026-09-08): slight elbow bend, controlled outward raise, upright trunk, neutral wrist, approximately shoulder-level endpoint. The source's exact scapular and rotation cues are not imposed on everyone by this schematic.
- Pending expert review: comfortable range, arm plane, wrist/grip depiction, and whether the schematic shoulder behavior is a useful simplification.
- Pending gym-user test: without prompting, identify support points, movement direction, and endpoints on the actual device at workout distance; then demonstrate unloaded with a qualified observer.

## Technical acceptance

Check front and three-quarter at start, mid-lift, raised, and lowering; fixed segment lengths; no bell/head overlap; all CSS phases agree; pause/resume and scrub; reduced motion; narrow screen; typecheck, existing tests, production build. Do not equate these checks with professional form approval.

Verified locally on 2026-09-08: both views synchronized at seven sampled rep phases; no bell/head bounding-box overlap at those phases; pause freezes and resume moves; endpoint buttons seek correctly; reduced-motion disables animation; 390px viewport has no horizontal overflow. Production lab integration also freezes both views. TypeScript, the existing test suite (`SMOKE_OK` and all other suites), and the production build pass. Safari on an actual Apple device, coach sign-off, and the workout-distance user test remain pending.
