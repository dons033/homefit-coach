"use client";
import { useEffect, useRef, useState } from "react";
type Point = [number, number];
export function PreparationAnimation({
  id,
  paused = false,
  mini = false,
}: {
  id: string;
  paused?: boolean;
  mini?: boolean;
}) {
  const [time, setTime] = useState(0);
  const elapsed = useRef(0);
  const moving = /circle|roll|squeeze|pushup/.test(id);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      last = performance.now();
    const tick = (now: number) => {
      elapsed.current += (now - last) / 1000;
      last = now;
      setTime(elapsed.current);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (moving && !paused && !query.matches) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    sync();
    query.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", sync);
    };
  }, [paused, moving]);
  const wave = (1 - Math.cos((time * Math.PI) / 2)) / 2;
  let head: Point = [110, 29],
    shoulder: Point = [110, 51],
    hip: Point = [110, 112];
  let left: Point[] = [
      [110, 55],
      [78, 80],
      [72, 110],
    ],
    right: Point[] = [
      [110, 55],
      [142, 80],
      [148, 110],
    ];
  let legs: Point[][] = [
    [
      [110, 112],
      [90, 145],
      [88, 182],
      [75, 182],
    ],
    [
      [110, 112],
      [130, 145],
      [132, 182],
      [145, 182],
    ],
  ];
  let wall = false;
  if (id.includes("circles")) {
    const a = ((time * Math.PI) / 2) * (id.includes("backward") ? -1 : 1);
    left = [
      [110, 55],
      [76, 56],
      [42 + 5 * Math.cos(a), 56 + 8 * Math.sin(a)],
    ];
    right = [
      [110, 55],
      [144, 56],
      [178 - 5 * Math.cos(a), 56 + 8 * Math.sin(a)],
    ];
  }
  if (id.includes("roll")) {
    shoulder = [110, 51 - 4 * wave];
    left = [
      [110, 55 - 4 * wave],
      [82 + 4 * wave, 80],
      [80, 114],
    ];
    right = [
      [110, 55 - 4 * wave],
      [138 - 4 * wave, 80],
      [140, 114],
    ];
  }
  if (id.includes("squeeze")) {
    left = [
      [110, 55],
      [78 - 8 * wave, 84],
      [77 - 8 * wave, 60],
    ];
    right = [
      [110, 55],
      [142 + 8 * wave, 84],
      [143 + 8 * wave, 60],
    ];
  }
  if (id.includes("chest-open")) {
    left = [
      [110, 55],
      [90, 90],
      [104, 120],
    ];
    right = [
      [110, 55],
      [130, 90],
      [116, 120],
    ];
  }
  if (id.includes("shoulder-left") || id.includes("shoulder-right")) {
    left = [
      [110, 55],
      [137, 64],
      [165, 62],
    ];
    right = [
      [110, 55],
      [141, 90],
      [142, 61],
    ];
  }
  if (id.includes("triceps")) {
    left = [
      [110, 55],
      [86, 13],
      [105, 40],
    ];
    right = [
      [110, 55],
      [129, 31],
      [88, 15],
    ];
  }
  if (id.includes("wall-pushup")) {
    wall = true;
    head = [77 - 12 * wave, 33];
    shoulder = [80 - 12 * wave, 55];
    hip = [113 - 5 * wave, 116];
    left = [shoulder, [53 + 10 * wave, 67], [29, 55]];
    right = [shoulder, [56 + 10 * wave, 74], [29, 63]];
    legs = [
      [hip, [132, 147], [150, 182], [132, 182]],
      [hip, [142, 147], [160, 182], [142, 182]],
    ];
  }
  if (id.includes("calf")) {
    wall = true;
    head = [76, 30];
    shoulder = [80, 52];
    hip = [106, 112];
    left = [shoulder, [50, 58], [29, 60]];
    right = [shoulder, [52, 70], [29, 72]];
    legs = [
      [hip, [82, 145], [78, 182], [62, 182]],
      [hip, [145, 147], [170, 182], [153, 182]],
    ];
  }
  if (id.includes("hamstring")) {
    head = [137, 60];
    shoulder = [124, 81];
    hip = [90, 120];
    left = [shoulder, [132, 104], [123, 135]];
    right = [shoulder, [122, 104], [114, 133]];
    legs = [
      [hip, [70, 152], [73, 182], [60, 182]],
      [hip, [127, 151], [160, 182], [173, 171]],
    ];
  }
  const mirror = id.endsWith("right");
  const points = (p: Point[]) => p.map((v) => v.join(",")).join(" ");
  return (
    <div
      className={mini ? "h-16 w-20 shrink-0" : "mx-auto w-full max-w-[380px]"}
    >
      <svg
        viewBox="0 0 220 205"
        className="h-full w-full"
        role="img"
        aria-label={id.replace("prep-", "").replaceAll("-", " ")}
      >
        <line
          x1="15"
          y1="186"
          x2="205"
          y2="186"
          stroke="#64748b"
          strokeWidth="2"
        />
        <g
          transform={mirror ? "translate(220 0) scale(-1 1)" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeWidth="4"
        >
          {wall && <path d="M25 20 V186" stroke="#64748b" strokeWidth="6" />}
          <circle cx={head[0]} cy={head[1]} r="10" stroke="#e2e8f0" />
          <polyline points={points([head, shoulder, hip])} stroke="#e2e8f0" />
          {legs.map((leg, i) => (
            <polyline
              key={i}
              points={points(leg)}
              stroke={
                id.includes("calf") || id.includes("hamstring")
                  ? i === 1
                    ? "#c8efb4"
                    : "#94a3b8"
                  : "#e2e8f0"
              }
            />
          ))}
          <polyline points={points(left)} stroke="#38bdf8" />
          <polyline points={points(right)} stroke="#94a3b8" />
        </g>
        {!mini && (
          <text
            x="110"
            y="202"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
          >
            {moving ? "GENTLE MOVEMENT" : "RELAX · BREATHE · DO NOT FORCE"}
          </text>
        )}
      </svg>
    </div>
  );
}
