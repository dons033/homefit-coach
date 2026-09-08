"use client";

import type { CSSProperties } from "react";
import styles from "./LateralRaiseAnimation.module.css";

const INK = "#e2e8f0";
const ACTIVE = "#38bdf8";
const BG = "#0a1120";
const rad = Math.PI / 180;
const coordinate = (value: number) => Number(value.toFixed(4));
// The forearm keeps a 12-degree bend throughout the rep. These are physical
// arm-plane coordinates, before rotation and camera projection.
const hand = { x: coordinate(-24 * Math.sin(12 * rad)), y: coordinate(26 + 24 * Math.cos(12 * rad)) };
const armPath = `M0 0 L0 26 L${hand.x} ${hand.y}`;

function Bell({ angled = false }: { angled?: boolean }) {
  return angled ? (
    <g fill={ACTIVE}>
      <rect x={-9} y={-2} width={18} height={4} rx={2} />
      <ellipse cx={-8} cy={0} rx={4} ry={7} />
      <ellipse cx={8} cy={0} rx={4} ry={7} />
      <ellipse cx={8} cy={0} rx={1.5} ry={2.5} fill={BG} />
    </g>
  ) : (
    <g><circle r={7} fill={ACTIVE} /><circle r={2.5} fill={BG} /></g>
  );
}

function RaiseView({ yaw }: { yaw: number }) {
  const angled = yaw !== 0;
  const camera = yaw * rad;
  const project = (x: number, z = 0) => coordinate(100 + x * Math.cos(camera) + z * Math.sin(camera));
  const limb = (sign: number) => {
    // Arms move in the same plane, 20 degrees forward of the frontal plane.
    // This orthographic projection replaces the old, incorrect forward raise.
    const scale = coordinate(sign * Math.cos(20 * rad) * Math.cos(camera) + Math.sin(20 * rad) * Math.sin(camera));
    const shoulder = project(sign * 17);
    const endpoint = (angle: number) => {
      const a = angle * rad;
      return `${coordinate(hand.x * Math.cos(a) + hand.y * Math.sin(a))} ${coordinate(hand.y * Math.cos(a) - hand.x * Math.sin(a))}`;
    };
    const trajectory = Array.from({ length: 18 }, (_, i) => `${i ? "L" : "M"}${endpoint(15 + i * 5)}`).join(" ");
    return (
      <g key={sign} data-lateral-limb={sign} transform={`matrix(${scale} 0 0 1 ${shoulder} 58)`}>
        <path className="hf-traj" d={trajectory} style={{ strokeWidth: 1.5, opacity: 0.65 }} />
        {/* Both endpoints remain visible without depending on the other view. */}
        {[15, 100].map(angle => (
          <g key={angle} className="hf-ghost" transform={`rotate(${-angle})`} aria-hidden="true">
            <path d={armPath} fill="none" stroke={ACTIVE} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            <g transform={`translate(${hand.x} ${hand.y}) rotate(${angle})`}><Bell angled={angled} /></g>
          </g>
        ))}
        <g className={styles.arm} data-lateral-mover>
          <path d={armPath} fill="none" stroke={ACTIVE} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={0} cy={26} r={2} fill={BG} opacity={0.45} />
          <g transform={`translate(${hand.x} ${hand.y})`}><g className={styles.bell}><Bell angled={angled} /></g></g>
        </g>
      </g>
    );
  };
  return (
    <div className="min-w-0 text-center">
      <svg viewBox="0 0 200 170" role="img" aria-label={`Lateral raise — ${angled ? "three-quarter" : "front"} view`} className="mx-auto h-auto w-full max-w-[400px]">
        <title>Lateral raise: arms lift out to the sides with a small, fixed elbow bend</title>
        <path d="M28 157 H172" stroke="#475569" strokeWidth={1.5} strokeLinecap="round" />
        <path d={`M${project(-8)} 102 L${project(-17)} 152 L${project(-25)} 152 M${project(8)} 102 L${project(17)} 152 L${project(25)} 152`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={project(-13)} y={45} width={coordinate(26 * Math.cos(camera))} height={61} rx={11} fill={INK} />
        <path d={`M${project(-17)} 58 H${project(17)}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <circle cx={100} cy={31} r={10} fill={BG} stroke={INK} strokeWidth={3.5} />
        {angled ? <path d="M106 28 L112 31 L106 33" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" /> : <path d="M96 30 H96.1 M104 30 H104.1" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />}
        {limb(-1)}{limb(1)}
        {[-1, 1].map(sign => <circle key={sign} cx={project(sign * 17)} cy={58} r={4} fill={ACTIVE} stroke={BG} strokeWidth={1.5} />)}
      </svg>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">{angled ? "Three-quarter · see the bend" : "Front · see the wide arc"}</div>
    </div>
  );
}

export function LateralRaiseAnimation({ repSeconds = 4, paused = false, phase = null }: { repSeconds?: number; paused?: boolean; phase?: number | null }) {
  const dur = Math.min(5, Math.max(2.5, repSeconds));
  return (
    <div className={paused || phase !== null ? styles.paused : ""} data-lateral-example
      style={{ "--rep-dur": `${dur}s`, "--phase-delay": `${-(phase ?? 0) * dur}s` } as CSSProperties}>
      {/* Seeking starts a fresh paused CSS timeline, so delay is an absolute rep position. */}
      <div key={phase ?? "playing"} className="grid grid-cols-2 gap-4 max-sm:grid-cols-1"><RaiseView yaw={0} /><RaiseView yaw={40} /></div>
    </div>
  );
}
