"use client";

/* Shared bell shapes: bar (handle across view), plate (end-on),
 * vertical two-handed hold. Imported by figures and rig poses. */

const BLUE = "#38bdf8";

export function Dumbbell({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-7} width={28} height={14} rx={7} fill={BLUE} />
      <rect x={-18} y={-10} width={6} height={20} rx={3} fill={BLUE} opacity={0.85} />
      <rect x={12} y={-10} width={6} height={20} rx={3} fill={BLUE} opacity={0.85} />
    </g>
  );
}

export function Plate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={11} fill={BLUE} />
      <circle r={4.5} fill="#0a1120" />
    </g>
  );
}

export function DumbbellV({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-7} y={-15} width={14} height={30} rx={7} fill={BLUE} />
      <rect x={-11} y={-21} width={22} height={7} rx={3.5} fill={BLUE} opacity={0.85} />
      <rect x={-11} y={14} width={22} height={7} rx={3.5} fill={BLUE} opacity={0.85} />
    </g>
  );
}
