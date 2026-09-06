"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

/* Data-driven cartoon rig: ART (body + limb drawings) is separate from
 * POSE (joint pivots + angles, see lib/poses.tsx) and MOTION (shared
 * rep-tempo windows below). Adding a variation like hammer curl = new
 * pose data, not new drawing code.
 *
 * Cartoon upgrade over bare sticks, in one place so every rigged figure
 * improves together: capsule limbs, joint dots, mitt hands, filled
 * shorts + shoes, faces with direction.
 */

export const INK = "#e2e8f0";
export const DIM = "#64748b";

export type RigJoint = {
  id: string;
  pivot: [number, number];
  /** degrees at rest (as drawn) */
  from: number;
  /** degrees at full contraction */
  to: number;
  /** limb artwork drawn at REST geometry; the wrapping <g> animates it */
  draw: ReactNode;
};

/* ---- cartoon parts ---- */

export function Limb({ x1, y1, x2, y2, w = 9 }: { x1: number; y1: number; x2: number; y2: number; w?: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={w} strokeLinecap="round" />
  );
}

export function Dot({ x, y, r = 3.5 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={INK} />;
}

export function Mitt({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={6.5} fill={INK} />;
}

export function HeadFront({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={x - 3.5} cy={y - 1} r={1.6} fill={INK} />
      <circle cx={x + 3.5} cy={y - 1} r={1.6} fill={INK} />
    </>
  );
}

export function HeadProfile({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={x - 9} y1={y - 2} x2={x - 14} y2={y - 4} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </>
  );
}

export function TorsoFront({ x = 100, top = 40, bottom = 102 }: { x?: number; top?: number; bottom?: number }) {
  return (
    <rect
      x={x - 12}
      y={top}
      width={24}
      height={bottom - top}
      rx={12}
      fill="none"
      stroke={INK}
      strokeWidth={4.5}
    />
  );
}

export function Shorts({ x = 100, y = 96 }: { x?: number; y?: number }) {
  return <rect x={x - 14} y={y} width={28} height={16} rx={6} fill={INK} opacity={0.9} />;
}

export function Shoe({ x, y, dir = 1 }: { x: number; y: number; dir?: 1 | -1 }) {
  return (
    <ellipse cx={x + dir * 5} cy={y} rx={9} ry={5} fill={INK} />
  );
}

export function Traj({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="#475569"
      strokeWidth={2}
      strokeDasharray="2 7"
      strokeLinecap="round"
      opacity={0.9}
    />
  );
}

/* ---- rig renderer ---- */

function keyframesFor(uid: string, j: RigJoint): string {
  const f = j.from;
  const t = j.to;
  return (
    `@keyframes rg${uid}${j.id}` +
    `{0%{transform:rotate(${f}deg)}38%{transform:rotate(${t}deg)}` +
    `52%{transform:rotate(${t}deg)}88%{transform:rotate(${f}deg)}100%{transform:rotate(${f}deg)}}` +
    `.rg${uid}${j.id}{animation:rg${uid}${j.id} var(--rep-dur,4s) ease-in-out infinite;}`
  );
}

export function RigFigure({
  joints,
  body,
  repSeconds = 4,
  paused = false,
  /** Freeze at rep fraction 0..1 (lab scrub). Null = play. */
  phase = null,
  className = "",
}: {
  joints: RigJoint[];
  body: ReactNode;
  repSeconds?: number;
  paused?: boolean;
  phase?: number | null;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const dur = Math.min(6, Math.max(1.5, repSeconds));
  const frozen = paused || phase !== null;
  const css = joints.map((j) => keyframesFor(uid, j)).join("\n");

  return (
    <div className={`${frozen ? "hf-paused" : ""} ${className}`}>
      <style>{css}</style>
      <svg
        viewBox="0 0 200 170"
        className="h-auto w-full"
        role="img"
        aria-label="Exercise figure"
        style={{ "--rep-dur": `${dur}s` } as CSSProperties}
      >
        {body}
        {joints.map((j) => (
          <g
            key={j.id}
            className={`rg${uid}${j.id}`}
            style={{
              transformBox: "view-box",
              transformOrigin: `${j.pivot[0]}px ${j.pivot[1]}px`,
              ...(phase !== null
                ? { animationPlayState: "paused", animationDelay: `${-phase * dur}s` }
                : null),
            } as CSSProperties}
          >
            {j.draw}
          </g>
        ))}
      </svg>
    </div>
  );
}
