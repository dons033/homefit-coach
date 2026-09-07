import type { Exercise } from "./workout";

type Stage = [animationId: string, name: string, cue: string];
function routine(
  prefix: string,
  kind: "warmup" | "cooldown",
  stages: Stage[],
): Exercise[] {
  return stages.map(([animationId, name, cue], i) => ({
    id: `${prefix}-${i}`,
    name,
    shortName: name,
    animationId,
    variantId: "standard",
    sets: 1,
    targetReps: 0,
    workSeconds: 30,
    restSeconds: 0,
    kind,
    cues: [
      cue,
      kind === "warmup"
        ? "Move gently through a comfortable range. No weights needed."
        : "Breathe slowly. Keep any stretch gentle; do not bounce or force the position.",
    ],
  }));
}
export const upperWarmup = routine("upper-warmup", "warmup", [
  [
    "march-in-place",
    "March in place",
    "Start easy and let your arms swing naturally.",
  ],
  [
    "prep-shoulder-roll",
    "Shoulder rolls",
    "Slowly roll shoulders up, back, and down. Keep your neck relaxed.",
  ],
  [
    "prep-arm-circles-forward",
    "Small arm circles — forward",
    "Hold arms out comfortably and make small forward circles.",
  ],
  [
    "prep-arm-circles-backward",
    "Small arm circles — backward",
    "Reverse the circles. Keep shoulders away from your ears.",
  ],
  [
    "prep-scapular-squeeze",
    "Shoulder-blade squeezes",
    "With elbows bent at your sides, gently draw shoulder blades together, then release.",
  ],
  [
    "prep-wall-pushup",
    "Easy wall push-ups",
    "Hands at chest height on a wall. Bend elbows slowly, then press away.",
  ],
]);
export const upperCooldown = routine("upper-cooldown", "cooldown", [
  [
    "march-in-place",
    "Easy march",
    "Slow your steps and allow breathing to settle.",
  ],
  [
    "prep-chest-open",
    "Gentle chest opener",
    "Stand tall, hands resting behind your hips. Gently open your chest without arching your back.",
  ],
  [
    "prep-shoulder-left",
    "Shoulder stretch — left",
    "Bring your left arm across your chest. Support the upper arm gently with your right hand.",
  ],
  [
    "prep-shoulder-right",
    "Shoulder stretch — right",
    "Bring your right arm across your chest. Support the upper arm gently with your left hand.",
  ],
  [
    "prep-triceps-left",
    "Triceps stretch — left",
    "Raise your left arm and bend the elbow. Rest the hand behind your head; support gently with the other hand.",
  ],
  [
    "prep-triceps-right",
    "Triceps stretch — right",
    "Raise your right arm and bend the elbow. Rest the hand behind your head; support gently with the other hand.",
  ],
]);
export const lowerCooldown = routine("lower-cooldown", "cooldown", [
  [
    "march-in-place",
    "Easy march",
    "Gradually slow your steps and let your breathing settle.",
  ],
  [
    "prep-calf-left",
    "Supported calf stretch — left",
    "Place hands on a wall and step the left foot back. Keep the back heel down and toes forward.",
  ],
  [
    "prep-calf-right",
    "Supported calf stretch — right",
    "Switch feet. Keep the right heel down and lean gently toward the wall.",
  ],
  [
    "prep-hamstring-left",
    "Hamstring stretch — left",
    "Place your left heel slightly forward with a soft knee. Hinge gently at your hips, keeping your back neutral.",
  ],
  [
    "prep-hamstring-right",
    "Hamstring stretch — right",
    "Switch heels. Hinge gently until you feel a light stretch in the back of the right thigh.",
  ],
  [
    "prep-breathing",
    "Relaxed breathing",
    "Stand comfortably, relax your shoulders, and take slow, easy breaths.",
  ],
]);
