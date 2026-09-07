"use client";
import { useEffect, useRef, useState } from "react";

type Point = [number, number];
type Pose = {
  head: Point;
  shoulder: Point;
  hip: Point;
  knees: [Point, Point];
  ankles: [Point, Point];
  toes: [Point, Point];
  hands: [Point, Point];
};
const mix = (a: Point, b: Point, t: number): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const front: Pose = {
  head: [110, 28],
  shoulder: [110, 49],
  hip: [110, 110],
  knees: [
    [88, 145],
    [132, 145],
  ],
  ankles: [
    [82, 180],
    [138, 180],
  ],
  toes: [
    [69, 181],
    [151, 181],
  ],
  hands: [
    [96, 76],
    [124, 76],
  ],
};
const side: Pose = {
  head: [100, 28],
  shoulder: [100, 49],
  hip: [100, 110],
  knees: [
    [96, 144],
    [108, 144],
  ],
  ankles: [
    [94, 180],
    [109, 180],
  ],
  toes: [
    [77, 181],
    [92, 181],
  ],
  hands: [
    [85, 107],
    [94, 109],
  ],
};
export const LOWER_ANIMATION_IDS = new Set([
  "goblet-squat",
  "romanian-deadlift",
  "bulgarian-split-squat",
  "hip-thrust",
  "glute-bridge",
  "reverse-lunge",
  "calf-raise",
  "wall-sit",
  "march-in-place",
  "bodyweight-good-morning",
  "bodyweight-squat",
  "bodyweight-reverse-lunge",
  "hip-hinge",
]);

// Front projection for squat alignment; side projection for hinge and hip extension.
// All points in a pose share the same clock, including the dumbbells.
export function lowerPose(id: string, phase: number): Pose {
  const p = phase % 1;
  const t =
    p < 0.4
      ? (1 - Math.cos((Math.PI * p) / 0.4)) / 2
      : p < 0.5
        ? 1
        : p < 0.9
          ? (1 + Math.cos((Math.PI * (p - 0.5)) / 0.4)) / 2
          : 0;
  let a = side,
    b: Pose = side;
  if (id.includes("squat") && !id.includes("split")) {
    a = front;
    b = {
      ...front,
      head: [110, 63],
      shoulder: [110, 84],
      hip: [110, 144],
      knees: [
        [69, 146],
        [151, 146],
      ],
      hands: [
        [96, 111],
        [124, 111],
      ],
    };
  } else if (
    ["romanian-deadlift", "bodyweight-good-morning", "hip-hinge"].includes(id)
  ) {
    b = {
      ...side,
      head: [59, 87],
      shoulder: [75, 101],
      hip: [133, 120],
      knees: [
        [101, 147],
        [113, 147],
      ],
      hands: [
        [82, 153],
        [91, 155],
      ],
    };
  } else if (id === "bulgarian-split-squat") {
    a = {
      ...side,
      head: [89, 26],
      shoulder: [91, 48],
      hip: [98, 108],
      knees: [
        [67, 139],
        [148, 137],
      ],
      ankles: [
        [64, 180],
        [185, 112],
      ],
      toes: [
        [46, 181],
        [199, 112],
      ],
      hands: [
        [75, 107],
        [104, 110],
      ],
    };
    b = {
      ...a,
      head: [88, 60],
      shoulder: [90, 82],
      hip: [99, 142],
      knees: [
        [63, 147],
        [137, 171],
      ],
      hands: [
        [74, 141],
        [103, 144],
      ],
    };
  } else if (id === "hip-thrust" || id === "glute-bridge") {
    const floor = id === "glute-bridge";
    a = {
      head: floor ? [23, 161] : [31, 94],
      shoulder: floor ? [40, 164] : [47, 112],
      hip: [100, 164],
      knees: [
        [150, 123],
        [156, 129],
      ],
      ankles: [
        [166, 180],
        [178, 180],
      ],
      toes: [
        [180, 181],
        [190, 181],
      ],
      hands: [
        [89, 159],
        [111, 159],
      ],
    };
    b = {
      ...a,
      head: floor ? [23, 161] : [26, 108],
      hip: floor ? [99, 143] : [100, 112],
      knees: floor
        ? a.knees
        : [
            [150, 112],
            [156, 118],
          ],
      hands: floor
        ? [
            [88, 138],
            [110, 138],
          ]
        : [
            [89, 107],
            [111, 107],
          ],
    };
  } else if (id.includes("reverse-lunge")) {
    a = {
      ...side,
      head: [79, 28],
      shoulder: [79, 49],
      hip: [82, 110],
      knees: [
        [65, 145],
        [84, 145],
      ],
      ankles: [
        [63, 180],
        [82, 180],
      ],
      toes: [
        [45, 181],
        [66, 181],
      ],
      hands: [
        [60, 107],
        [90, 109],
      ],
    };
    b = {
      ...a,
      head: [91, 62],
      shoulder: [91, 83],
      hip: [106, 143],
      knees: [
        [63, 145],
        [140, 171],
      ],
      ankles: [
        [63, 180],
        [181, 174],
      ],
      toes: [
        [45, 181],
        [193, 181],
      ],
      hands: [
        [73, 140],
        [105, 142],
      ],
    };
  } else if (id === "calf-raise") {
    const up = (v: Point): Point => [v[0], v[1] - 12];
    b = {
      head: up(a.head),
      shoulder: up(a.shoulder),
      hip: up(a.hip),
      knees: [up(a.knees[0]), up(a.knees[1])],
      ankles: [up(a.ankles[0]), up(a.ankles[1])],
      toes: a.toes,
      hands: [up(a.hands[0]), up(a.hands[1])],
    };
  } else if (id === "wall-sit") {
    return {
      head: [47, 51],
      shoulder: [47, 73],
      hip: [47, 133],
      knees: [
        [109, 133],
        [121, 139],
      ],
      ankles: [
        [109, 180],
        [121, 180],
      ],
      toes: [
        [127, 181],
        [139, 181],
      ],
      hands: [
        [86, 126],
        [105, 133],
      ],
    };
  } else if (id === "march-in-place") {
    a = {
      ...front,
      hands: [
        [75, 90],
        [145, 90],
      ],
    };
    const leg = phase % 2 < 1 ? 0 : 1;
    b = { ...a, knees: [...a.knees], ankles: [...a.ankles], toes: [...a.toes] };
    b.knees[leg] = [leg === 0 ? 78 : 142, 119];
    b.ankles[leg] = [leg === 0 ? 80 : 140, 151];
    b.toes[leg] = [leg === 0 ? 68 : 152, 151];
  }
  const pose: Pose = {
    head: mix(a.head, b.head, t),
    shoulder: mix(a.shoulder, b.shoulder, t),
    hip: mix(a.hip, b.hip, t),
    knees: [mix(a.knees[0], b.knees[0], t), mix(a.knees[1], b.knees[1], t)],
    ankles: [
      mix(a.ankles[0], b.ankles[0], t),
      mix(a.ankles[1], b.ankles[1], t),
    ],
    toes: [mix(a.toes[0], b.toes[0], t), mix(a.toes[1], b.toes[1], t)],
    hands: [mix(a.hands[0], b.hands[0], t), mix(a.hands[1], b.hands[1], t)],
  };
  if (id.includes("reverse-lunge") && Math.floor(phase) % 2 === 1) {
    pose.knees.reverse();
    pose.ankles.reverse();
    pose.toes.reverse();
  }
  return pose;
}

export function LowerBodyAnimation({
  exerciseId,
  repSeconds = 4,
  paused = false,
  phase = null,
  mini = false,
  sideLabel = "",
}: {
  exerciseId: string;
  repSeconds?: number;
  paused?: boolean;
  phase?: number | null;
  mini?: boolean;
  sideLabel?: string;
}) {
  const [clock, setClock] = useState(0);
  const [reduced, setReduced] = useState(false);
  const elapsed = useRef(0);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const change = () => setReduced(mq.matches);
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (paused || reduced || phase !== null || exerciseId === "wall-sit")
      return;
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      elapsed.current += (now - last) / 1000;
      last = now;
      setClock(elapsed.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduced, phase, exerciseId]);
  const cycle = phase ?? clock / Math.max(2.5, repSeconds);
  const pose = lowerPose(exerciseId, reduced ? 0 : cycle);
  const frontView = [
    "goblet-squat",
    "bodyweight-squat",
    "march-in-place",
  ].includes(exerciseId);
  const weighted = [
    "goblet-squat",
    "romanian-deadlift",
    "bulgarian-split-squat",
    "hip-thrust",
    "glute-bridge",
    "reverse-lunge",
    "calf-raise",
  ].includes(exerciseId);
  const goblet = exerciseId === "goblet-squat";
  const bridge = ["hip-thrust", "glute-bridge"].includes(exerciseId);
  const bench =
    exerciseId === "bulgarian-split-squat" || exerciseId === "hip-thrust";
  const alternate = exerciseId.includes("reverse-lunge");
  const activeSide = alternate
    ? Math.floor(cycle) % 2 === 0
      ? "LEFT"
      : "RIGHT"
    : sideLabel;
  const path = (pts: Point[]) => pts.map((p) => p.join(",")).join(" ");
  return (
    <div
      className={mini ? "h-16 w-20 shrink-0" : "mx-auto w-full max-w-[430px]"}
    >
      <svg
        viewBox="0 0 230 205"
        role="img"
        aria-label={`${exerciseId.replaceAll("-", " ")} — ${frontView ? "front" : "side"} view${activeSide ? `, ${activeSide} working leg` : ""}`}
        className="h-full w-full"
      >
        <line
          x1="14"
          y1="184"
          x2="215"
          y2="184"
          stroke="#475569"
          strokeWidth="2"
        />
        {exerciseId === "wall-sit" && (
          <path d="M35 35 V183" stroke="#64748b" strokeWidth="6" />
        )}
        {bench && (
          <path
            d={
              exerciseId === "bulgarian-split-squat"
                ? "M177 115 H215 M183 116 V184 M210 116 V184"
                : "M15 118 H62 M20 118 V184 M57 118 V184"
            }
            stroke="#64748b"
            strokeWidth="6"
            fill="none"
          />
        )}
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        >
          <circle cx={pose.head[0]} cy={pose.head[1]} r="10" stroke="#e2e8f0" />
          <polyline
            points={path([pose.head, pose.shoulder, pose.hip])}
            stroke="#e2e8f0"
          />
          {[1, 0].map((i) => (
            <g
              key={i}
              opacity={
                !frontView &&
                (alternate ? i !== Math.floor(cycle) % 2 : i === 1)
                  ? 0.55
                  : 1
              }
            >
              <polyline
                points={path([
                  pose.hip,
                  pose.knees[i],
                  pose.ankles[i],
                  pose.toes[i],
                ])}
                stroke={
                  alternate && Math.floor(cycle) % 2 === i
                    ? "#c8efb4"
                    : "#38bdf8"
                }
              />
              <circle
                cx={pose.knees[i][0]}
                cy={pose.knees[i][1]}
                r="3"
                fill="#c8efb4"
                stroke="none"
              />
              <polyline
                points={path([
                  pose.shoulder,
                  goblet
                    ? [
                        pose.hands[i][0] + (i === 0 ? -12 : 12),
                        pose.hands[i][1] + 8,
                      ]
                    : mix(pose.shoulder, pose.hands[i], 0.55),
                  pose.hands[i],
                ])}
                stroke="#e2e8f0"
                strokeWidth="4"
              />
            </g>
          ))}
        </g>
        {weighted &&
          (goblet ? (
            <g
              transform={`translate(${pose.shoulder[0]},${pose.shoulder[1] + 20})`}
              fill="#c8efb4"
            >
              <rect x="-3" y="-10" width="6" height="24" />
              <rect x="-9" y="-13" width="18" height="7" rx="2" />
              <rect x="-9" y="10" width="18" height="7" rx="2" />
            </g>
          ) : (
            (bridge ? [[pose.hip[0], pose.hip[1] - 5]] : pose.hands).map(
              (p, i) => (
                <g
                  key={i}
                  transform={`translate(${p[0]},${p[1]})`}
                  stroke="#c8efb4"
                  strokeWidth="5"
                >
                  <path d="M-10 0 H10 M-10 -6 V6 M10 -6 V6" />
                </g>
              ),
            )
          ))}
        {!mini && (
          <text
            x="115"
            y="201"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="9"
            letterSpacing="1.3"
          >
            {frontView ? "FRONT VIEW" : "SIDE VIEW"}
            {activeSide ? ` · ${activeSide}` : ""}
          </text>
        )}
      </svg>
      {!mini && (
        <p className="mt-2 text-center text-sm text-sky-300">
          {exerciseId === "wall-sit"
            ? "Static hold · breathe normally"
            : alternate
              ? "Step back · return to standing · alternate legs"
              : [
                    "romanian-deadlift",
                    "hip-hinge",
                    "bodyweight-good-morning",
                  ].includes(exerciseId)
                ? "Hips back · soft knees · stand tall"
                : "Controlled movement · no bouncing"}
        </p>
      )}
    </div>
  );
}
