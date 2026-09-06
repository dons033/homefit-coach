"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Dumbbell, Plate } from "./bells";

/* PROTOTYPE — bench press on a single GSAP timeline. Same geometry as the
 * SMIL version in ExerciseAnimation.tsx, but ONE timeline owns the arm
 * morphs AND the bells: tempo = timeScale, pause = tl.pause(), /lab scrub
 * = tl.progress(). No SMIL, no CSS keyframes, no --phase-delay dualism,
 * no browser-compat workarounds. Compare side-by-side with "Bench press"
 * in /lab. Nothing here replaces the existing figure. */

const INK = "#e2e8f0";
const DIM = "#64748b";
const BLUE = "#38bdf8";

/* Same rest/top path strings the SMIL version morphs between. */
const SIDE_REST = "M65 101 L90 110 L90 77";
const SIDE_TOP = "M65 101 L68 68 L66 36";
const FL_REST = "M84 106 L53 115 L53 81";
const FL_TOP = "M84 106 L81 75 L79 43";
const FR_REST = "M116 106 L147 115 L147 81";
const FR_TOP = "M116 106 L119 75 L121 43";

gsap.registerPlugin(CustomEase);
/* The exact cubic-bezier(0.42,0,0.58,1) the SMIL keySplines use, so the
 * A/B comparison is apples-to-apples. */
const hfEase = CustomEase.create("hf-ease", "M0,0 C0.42,0 0.58,1 1,1");

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <svg viewBox="0 0 200 170" className="h-auto w-full max-w-[360px]" role="img" aria-label={label}>
        {children}
      </svg>
      <div className="mt-1 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-0.5 text-sm font-bold uppercase tracking-[0.25em] text-sky-300">{label}</div>
    </div>
  );
}

function Views({ aLabel, bLabel, a, b }: { aLabel: string; bLabel: string; a: React.ReactNode; b: React.ReactNode }) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 items-end gap-6 max-sm:grid-cols-1">
      <Frame label={aLabel}>{a}</Frame>
      <Frame label={bLabel}>{b}</Frame>
    </div>
  );
}

/* Normalized rep: 0 → 0.38 lift, hold to 0.52, lower to 0.88, rest to 1.
 * Durations below are FRACTIONS of one rep; timeScale turns them into
 * real seconds. */
export function GsapBenchAnim({ repSeconds = 4, paused = false, phase = null }: { repSeconds?: number; paused?: boolean; phase?: number | null }) {
  const dur = Math.min(5, Math.max(2.5, repSeconds));
  const motion = !usePrefersReducedMotion();
  const sideArm = useRef<SVGPathElement>(null);
  const sideBell = useRef<SVGGElement>(null);
  const flArm = useRef<SVGPathElement>(null);
  const frArm = useRef<SVGPathElement>(null);
  const flBell = useRef<SVGGElement>(null);
  const frBell = useRef<SVGGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!motion) return;
    const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: hfEase } });
    tl.to(sideArm.current, { attr: { d: SIDE_TOP }, duration: 0.38 }, 0);
    tl.to(sideBell.current, { x: -24, y: -41, duration: 0.38 }, 0);
    tl.to(flArm.current, { attr: { d: FL_TOP }, duration: 0.38 }, 0);
    tl.to(flBell.current, { x: 26, y: -38, duration: 0.38 }, 0);
    tl.to(frArm.current, { attr: { d: FR_TOP }, duration: 0.38 }, 0);
    tl.to(frBell.current, { x: -26, y: -38, duration: 0.38 }, 0);
    tl.to(sideArm.current, { attr: { d: SIDE_REST }, duration: 0.36 }, 0.52);
    tl.to(sideBell.current, { x: 0, y: 0, duration: 0.36 }, 0.52);
    tl.to(flArm.current, { attr: { d: FL_REST }, duration: 0.36 }, 0.52);
    tl.to(flBell.current, { x: 0, y: 0, duration: 0.36 }, 0.52);
    tl.to(frArm.current, { attr: { d: FR_REST }, duration: 0.36 }, 0.52);
    tl.to(frBell.current, { x: 0, y: 0, duration: 0.36 }, 0.52);
    tl.to({}, { duration: 0.12 }, 0.88); // pad so the repeat covers the bottom hold
    tlRef.current = tl;
    return () => { tl.kill(); tlRef.current = null; };
  }, [motion]);

  useEffect(() => {
    const tl = tlRef.current;
    if (!motion || !tl) return; // reduced motion: figure rests at the drawn pose
    tl.timeScale(1 / dur);
    if (phase !== null) {
      tl.pause();
      tl.progress(phase);
    } else if (paused) {
      tl.pause();
    } else {
      tl.play();
    }
  }, [motion, dur, paused, phase]);

  const side = (
    <>
      <path d="M16 158 H184" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      <rect x={18} y={116} width={114} height={9} rx={3} fill={DIM} />
      <path d="M32 125 V154 M119 125 V154 M24 154 H42 M110 154 H130" fill="none" stroke={DIM} strokeWidth={6} strokeLinecap="round" />
      <path d="M115 105 L144 115 L142 153 L154 153" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
      <rect x={47} y={96} width={76} height={19} rx={9.5} fill={INK} />
      <path d="M42 107 H52 M117 105 L157 114 L156 154 L171 154" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={33} cy={104} r={10} fill="none" stroke={INK} strokeWidth={3.5} />
      <path d="M33 94 L36 89 L39 95" fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d={SIDE_TOP} />
        <circle cx={66} cy={36} r={9} />
      </g>
      <path className="hf-traj" d="M90 77 L66 36" />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path ref={sideArm} d={SIDE_REST} />
        <g ref={sideBell} stroke="none"><Plate x={90} y={77} s={0.82} /></g>
      </g>
      <circle cx={65} cy={101} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  const front = (
    <>
      <path d="M22 158 H178" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      <path d="M78 105 H122 L132 132 H68 Z" fill={DIM} />
      <rect x={68} y={132} width={64} height={7} rx={2} fill={DIM} />
      <path d="M81 139 V154 M119 139 V154 M73 154 H127" fill="none" stroke={DIM} strokeWidth={6} strokeLinecap="round" />
      <circle cx={100} cy={95} r={8} fill="none" stroke={INK} strokeWidth={3.5} />
      <rect x={82} y={102} width={36} height={23} rx={10} fill={INK} />
      <path d="M89 121 L62 116 L60 154 L47 154 M111 121 L138 116 L140 154 L153 154" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d="M84 106 L81 75 L79 43 M116 106 L119 75 L121 43" />
        <rect x={66} y={36} width={26} height={14} rx={3} />
        <rect x={108} y={36} width={26} height={14} rx={3} />
      </g>
      <path className="hf-traj" d="M53 81 L79 43 M147 81 L121 43" />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path ref={flArm} d={FL_REST} />
        <path ref={frArm} d={FR_REST} />
        <g ref={flBell} stroke="none"><Dumbbell x={53} y={81} s={0.75} /></g>
        <g ref={frBell} stroke="none"><Dumbbell x={147} y={81} s={0.75} /></g>
      </g>
      <circle cx={84} cy={106} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
      <circle cx={116} cy={106} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  return <Views aLabel="Side" bLabel="Feet end" a={side} b={front} />;
}
