"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Dumbbell, Plate, DumbbellV } from "./bells";
import { RigFigure } from "./RigFigure";
import { RIG_DEFS } from "@/lib/poses";
import rowStyles from "./RowAnimation.module.css";

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

/* Procedural stick-figure demos. Doctrine:
 *   - EVERY exercise shows TWO DIFFERENT views (side/front/top/back —
 *     whichever two teach the move). Never one view, never the same twice.
 *   - Both views animate IN SYNC (same rep phase) so the user can compare
 *     angles of the same instant.
 *   - One loop = one rep; tempo from --rep-dur (work ÷ target reps,
 *     clamped readable). Keyframe plateaus model lift → hold → lower → rest.
 *   - Bells drawn in correct projection per view/grip:
 *       bar    = handle across the view (full dumbbell shape)
 *       plate  = handle along the view axis (end-on circle)
 *       vertical bell = two-handed overhead hold (unmistakable tri icon)
 *   - Rotational pivots use explicit view-box coordinates so joints stay pinned.
 *
 * LONG-RUN SPRITE PATH (Krita):
 *   1. Draw N equal frames in a horizontal strip, transparent PNG.
 *   2. Save as public/sprites/<exercise-id>.png (suggested 480px/frame).
 *   3. Register the frame count in SPRITE_FRAMES below.
 */

const SPRITE_FRAMES: Record<string, number> = {
  // "bench-press": 10,
};

const INK = "#e2e8f0";
const DIM = "#64748b";
const BLUE = "#38bdf8";

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

/** Two synced views of the same rep instant. */
function Views({
  aLabel,
  bLabel,
  a,
  b,
}: {
  aLabel: string;
  bLabel: string;
  a: React.ReactNode;
  b: React.ReactNode;
}) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 items-end gap-6 max-sm:grid-cols-1">
      <Frame label={aLabel}>{a}</Frame>
      <Frame label={bLabel}>{b}</Frame>
    </div>
  );
}

function StandingFigure({ spread = 18 }: { spread?: number }) {
  return (
    <>
      <circle cx={100} cy={28} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={100} y1={40} x2={100} y2={105} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={100} y1={105} x2={100 - spread} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={105} x2={100 + spread} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100 - spread} y1={150} x2={100 - spread - 8} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100 + spread} y1={150} x2={100 + spread + 8} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </>
  );
}

/* ---------------- Bench press: SIDE (end-on bells) + FRONT (feet end) ----------------
 * Arms morph path geometry (elbows extend — a rigid rotation can't show that).
 * CSS `d: path()` is still unsupported in Safari, so arms use SMIL
 * <animate attributeName="d"> with the same path strings and the same
 * 38/52/88 rep windows; bells ride along on CSS translate (works everywhere).
 * Pause reaches SMIL via svg.pauseAnimations(); reduced-motion renders rest. */
const MORPH_SPLINES = "0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1";

/** Arm path morph rest→top on the shared 38/52/88 rep windows (SMIL — the
 *  CSS `d: path()` property is still unsupported in Safari). Omitted under
 *  reduced motion so the arm rests at its drawn geometry. */
function ArmMorphD({ rest, top, dur, on }: { rest: string; top: string; dur: number; on: boolean }) {
  if (!on) return null;
  return (
    <animate
      attributeName="d"
      values={`${rest};${top};${top};${rest};${rest}`}
      keyTimes="0;0.38;0.52;0.88;1"
      calcMode="spline"
      keySplines={MORPH_SPLINES}
      dur={`${dur}s`}
      repeatCount="indefinite"
    />
  );
}

/** SMIL's clock can start before the first rendered CSS frame, so align it
 *  to a CSS-animated element (bells share the document timeline). Also
 *  freezes SMIL on pause — the CSS bells freeze via .hf-paused. */
function useSmilClock(
  boxRef: React.RefObject<HTMLDivElement | null>,
  selector: string,
  paused: boolean,
  motion: boolean,
  dur: number,
) {
  useLayoutEffect(() => {
    let cancelled = false;
    boxRef.current?.querySelectorAll("svg").forEach((s) => {
      try {
        const bell = s.querySelector(selector);
        const animation = bell?.getAnimations()[0];
        const align = () => {
          const time = animation?.currentTime;
          if (!cancelled && typeof time === "number") s.setCurrentTime(time / 1000);
        };
        align();
        if (paused) s.pauseAnimations();
        else s.unpauseAnimations();
        // CSS pause/play settles on the next frame; use its final clock value.
        void animation?.ready.then(align, () => {});
      } catch {
        /* No CSS clock in this svg — nothing to align to. */
      }
    });
    return () => { cancelled = true; };
  }, [boxRef, selector, paused, motion, dur]);
}
const SIDE_REST = "M65 101 L90 110 L90 77";
const SIDE_TOP = "M65 101 L68 68 L66 36";
const FL_REST = "M84 106 L53 115 L53 81";
const FL_TOP = "M84 106 L81 75 L79 43";
const FR_REST = "M116 106 L147 115 L147 81";
const FR_TOP = "M116 106 L119 75 L121 43";

function BenchPressAnim({ repSeconds = 4, paused = false }: { repSeconds?: number; paused?: boolean }) {
  const dur = Math.min(5, Math.max(2.5, repSeconds));
  const motion = !usePrefersReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  useSmilClock(boxRef, "[class^='hf-bench-']", paused, motion, dur);
  const side = (
    <>
      <path d="M16 158 H184" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      <rect x={18} y={116} width={114} height={9} rx={3} fill={DIM} />
      <path d="M32 125 V154 M119 125 V154 M24 154 H42 M110 154 H130" fill="none" stroke={DIM} strokeWidth={6} strokeLinecap="round" />
      {/* Horizontal back and head rest on the pad; both feet meet the floor. */}
      <path d="M115 105 L144 115 L142 153 L154 153" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
      <rect x={47} y={96} width={76} height={19} rx={9.5} fill={INK} />
      <path d="M42 107 H52 M117 105 L157 114 L156 154 L171 154" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={33} cy={104} r={10} fill="none" stroke={INK} strokeWidth={3.5} />
      <path d="M33 94 L36 89 L39 95" fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {/* In true profile the arms overlap: one silhouette, one end-on plate. */}
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d="M65 101 L68 68 L66 36" />
        <circle cx={66} cy={36} r={9} />
      </g>
      <path className="hf-traj" d="M90 77 L66 36" />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d={SIDE_REST}>
          <ArmMorphD rest={SIDE_REST} top={SIDE_TOP} dur={dur} on={motion} />
        </path>
        <g className="hf-bench-side-bell" stroke="none"><Plate x={90} y={77} s={0.82} /></g>
      </g>
      <circle cx={65} cy={101} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  const front = (
    <>
      <path d="M22 158 H178" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      {/* Slightly elevated feet-end projection: pad recedes beneath the body. */}
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
        <path d={FL_REST}>
          <ArmMorphD rest={FL_REST} top={FL_TOP} dur={dur} on={motion} />
        </path>
        <path d={FR_REST}>
          <ArmMorphD rest={FR_REST} top={FR_TOP} dur={dur} on={motion} />
        </path>
        <g className="hf-bench-front-left-bell" stroke="none"><Dumbbell x={53} y={81} s={0.75} /></g>
        <g className="hf-bench-front-right-bell" stroke="none"><Dumbbell x={147} y={81} s={0.75} /></g>
      </g>
      <circle cx={84} cy={106} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
      <circle cx={116} cy={106} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  return (
    <div ref={boxRef}>
      <Views aLabel="Side" bLabel="Feet end" a={side} b={front} />
    </div>
  );
}

/* ---------------- One-arm row: SIDE + BACK (no nose tick = facing away) ---------------- */
function RowAnim({ repSeconds = 4, paused = false }: { repSeconds?: number; paused?: boolean }) {
  const dur = Math.min(5, Math.max(2.5, repSeconds));
  const motion = !usePrefersReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  useSmilClock(boxRef, "[data-row-bell]", paused, motion, dur);
  const sideRest = "M76 76 L78 108 L80 139";
  const sideTop = "M76 76 L110 62 L106 94";
  const backRest = "M122 77 L124 108 L126 139";
  const backTop = "M122 77 L142 66 L142 98";
  const side = (
    <>
      <path d="M20 161 H180" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      <rect x={37} y={112} width={120} height={9} rx={3} fill={DIM} />
      <path d="M47 121 V157 M146 121 V157 M39 157 H55 M138 157 H154" fill="none" stroke={DIM} strokeWidth={6} strokeLinecap="round" />
      {/* Far knee and shin rest on the pad; the near leg reaches the floor. */}
      <path d="M124 79 L116 108 L147 108 L149 100" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M68 77 L53 108" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <rect x={44} y={107} width={18} height={5} rx={2.5} fill={INK} />
      <rect x={60} y={65} width={72} height={18} rx={9} fill={INK} />
      <path d="M52 68 L65 73 M126 81 L145 123 L162 157 L149 157" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      {/* Head continues the spine line — neck level, eyes forward, no droop. */}
      <path d="M51 60 L60 66" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <circle cx={44} cy={54} r={10} fill="none" stroke={INK} strokeWidth={3.5} />
      <path d="M35 52 L29 54 L35 57" fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d={sideTop} />
        <rect x={93} y={87} width={26} height={14} rx={3} />
      </g>
      <path className="hf-traj" d="M80 139 L106 94" />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d={sideRest}><ArmMorphD rest={sideRest} top={sideTop} dur={dur} on={motion} /></path>
        <g data-row-bell className={rowStyles.sideBell} stroke="none"><Dumbbell x={80} y={139} s={0.75} /></g>
      </g>
      <circle cx={76} cy={76} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  const back = (
    <>
      <path d="M22 161 H178" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      {/* Rear view, slightly elevated: the pad recedes under the supporting side. */}
      <path d="M45 108 H98 L110 128 H35 Z" fill={DIM} />
      <rect x={35} y={128} width={75} height={8} rx={3} fill={DIM} />
      <path d="M45 136 V157 M98 136 V157 M37 157 H53 M90 157 H106" fill="none" stroke={DIM} strokeWidth={6} strokeLinecap="round" />
      <path d="M78 77 L63 106" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <rect x={54} y={105} width={18} height={5} rx={2.5} fill={INK} />
      <path d="M88 100 L80 123 L56 123 L52 117 M111 100 L113 129 L117 157 L132 157" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={78} y={70} width={44} height={34} rx={13} fill={INK} />
      <path d="M100 65 V73" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <circle cx={100} cy={56} r={10} fill="none" stroke={INK} strokeWidth={3.5} />
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d={backTop} />
        <circle cx={142} cy={98} r={9} />
      </g>
      <path className="hf-traj" d="M126 139 L142 98" />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d={backRest}><ArmMorphD rest={backRest} top={backTop} dur={dur} on={motion} /></path>
        <g data-row-bell className={rowStyles.backBell} stroke="none"><Plate x={126} y={139} s={0.82} /></g>
      </g>
      <circle cx={122} cy={77} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  return <div ref={boxRef}><Views aLabel="Side" bLabel="Back" a={side} b={back} /></div>;
}

/** Shared standing front body: floor, head, torso capsule, legs, feet. */
function StandingFront() {
  return (
    <>
      <path d="M30 157 H170" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      <circle cx={100} cy={35} r={10} fill="none" stroke={INK} strokeWidth={3.5} />
      <rect x={87} y={46} width={26} height={49} rx={13} fill={INK} />
      <path d="M93 95 L89 150 M107 95 L111 150" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={85} cy={151} rx={9} ry={4.5} fill={INK} />
      <ellipse cx={115} cy={151} rx={9} ry={4.5} fill={INK} />
    </>
  );
}

/** Shared standing profile body (facing left): floor, head, torso, legs. */
function StandingSide() {
  return (
    <>
      <path d="M30 157 H170" stroke={DIM} strokeWidth={2} strokeLinecap="round" />
      <circle cx={62} cy={32} r={10} fill="none" stroke={INK} strokeWidth={3.5} />
      <path d="M53 31 L48 33 L54 35" fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <rect x={68} y={44} width={17} height={51} rx={8.5} fill={INK} />
      <path d="M75 93 L64 150 M75 93 L87 150" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={58} cy={151} rx={9} ry={4.5} fill={INK} />
      <ellipse cx={81} cy={151} rx={9} ry={4.5} fill={INK} />
    </>
  );
}

/* ---------------- Shoulder press: FRONT (bars) + SIDE profile (plates) ----------------
 * Rack: bells at shoulder height just outside the shoulders, forearms
 * vertical, elbows out-front. Lockout: arms straight, bells nearly touching
 * overhead. The arm CHANGES SHAPE (bent → straight), so arms morph via SMIL
 * (bench pattern); bells ride on CSS translate. */
const SP_FRONT_REST_L = "M85 58 L74 78 L74 56";
const SP_FRONT_TOP_L = "M85 58 L86 37 L86 16";
const SP_FRONT_REST_R = "M115 58 L126 78 L126 56";
const SP_FRONT_TOP_R = "M115 58 L114 37 L114 16";
const SP_SIDE_REST = "M76 56 L66 76 L66 58";
const SP_SIDE_TOP = "M76 56 L74 35 L72 14";

function ShoulderPressAnim({ repSeconds = 4, paused = false }: { repSeconds?: number; paused?: boolean }) {
  const dur = Math.min(5, Math.max(2.5, repSeconds));
  const motion = !usePrefersReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  useSmilClock(boxRef, "[data-sp-bell]", paused, motion, dur);
  const front = (
    <>
      <StandingFront />
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d={SP_FRONT_TOP_L} />
        <path d={SP_FRONT_TOP_R} />
        <rect x={72} y={5} width={27} height={15} rx={4} />
        <rect x={101} y={5} width={27} height={15} rx={4} />
      </g>
      <path className="hf-traj" d="M74 51 L86 12" />
      <path className="hf-traj" d="M126 51 L114 12" />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d={SP_FRONT_REST_L}>
          <ArmMorphD rest={SP_FRONT_REST_L} top={SP_FRONT_TOP_L} dur={dur} on={motion} />
        </path>
        <path d={SP_FRONT_REST_R}>
          <ArmMorphD rest={SP_FRONT_REST_R} top={SP_FRONT_TOP_R} dur={dur} on={motion} />
        </path>
        <g data-sp-bell className="hf-sp-front-left-bell" stroke="none"><Dumbbell x={74} y={51} s={0.75} /></g>
        <g className="hf-sp-front-right-bell" stroke="none"><Dumbbell x={126} y={51} s={0.75} /></g>
      </g>
      <circle cx={85} cy={58} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
      <circle cx={115} cy={58} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  const side = (
    <>
      <StandingSide />
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d={SP_SIDE_TOP} />
        <circle cx={72} cy={10} r={10} />
      </g>
      <path className="hf-traj" d="M66 52 L72 10" />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d={SP_SIDE_REST}>
          <ArmMorphD rest={SP_SIDE_REST} top={SP_SIDE_TOP} dur={dur} on={motion} />
        </path>
        <g data-sp-bell className="hf-sp-side-bell" stroke="none"><Plate x={66} y={52} s={0.9} /></g>
      </g>
      <circle cx={76} cy={56} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  return (
    <div ref={boxRef}>
      <Views aLabel="Front" bLabel="Side" a={front} b={side} />
    </div>
  );
}

/* ---------------- Lateral raise: FRONT (plates) + SIDE profile (plate end-on) ----------------
 * Full ROM: rest hangs at the sides, top ≈ 100° abduction (measured).
 * The old figure hovered half-raised forever — it never came down.
 * The old second view (top-down) read as a broken front view, so the pair
 * is front + side now: the side arm is a rigid rotation about the shoulder
 * (CSS rotate, bell inside the group so it tracks), 0 → 95°. */
function LateralRaiseAnim() {
  const pivot: CSSProperties = { transformBox: "view-box", transformOrigin: "100px 62px" };
  const front = (
    <>
      <StandingFigure />
      <path className="hf-traj" d="M84 106 Q60 80 53 55" />
      <path className="hf-traj" d="M116 106 Q140 80 147 55" />
      <g className="hf-anim-raiseFL" style={pivot}>
        <line x1={100} y1={62} x2={88} y2={108} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Plate x={87} y={113} />
      </g>
      <g className="hf-anim-raiseFR" style={pivot}>
        <line x1={100} y1={62} x2={112} y2={108} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Plate x={113} y={113} />
      </g>
    </>
  );
  const side = (
    <>
      <StandingSide />
      {/* Ghost at the raised extreme (95° about the shoulder). */}
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d="M76 56 L51 48 L26 50" />
        <circle cx={20} cy={49} r={9} />
      </g>
      <path className="hf-traj" d="M74 112 A56 56 0 0 1 20 49" />
      <g className="hf-mover hf-raise-side" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M76 56 L70 82 L74 106" />
        <g stroke="none"><Plate x={74} y={112} s={0.9} /></g>
      </g>
      <circle cx={76} cy={56} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  return <Views aLabel="Front" bLabel="Side" a={front} b={side} />;
}

/* ---------------- Biceps curls: FRONT (bars/plates) + SIDE rig (plate) ----------------
 * Front: elbows pinned at the sides (static INK upper arms); the forearm
 * rises straight up — a front view foreshortens the arc, so the hand tracks
 * a line and the bell rides a matching CSS translate. Hammer = same hinge,
 * plate bells, tops at chest height. Side = the rig: profile rotation IS
 * the hinge plane, and the bell rides inside the rotating group. */
function CurlViews({ hammer, repSeconds, paused }: { hammer: boolean; repSeconds: number; paused: boolean }) {
  const dur = Math.min(5, Math.max(2.5, repSeconds));
  const motion = !usePrefersReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  useSmilClock(boxRef, "[data-curl-bell]", paused, motion, dur);
  const side = RIG_DEFS["curl-side"];
  const restL = "M85 86 L85 114";
  const restR = "M115 86 L115 114";
  const topL = hammer ? "M85 86 L82 66" : "M85 86 L82 60";
  const topR = hammer ? "M115 86 L118 66" : "M115 86 L118 60";
  const bellTopY = hammer ? 65 : 60;
  const front = (
    <>
      <StandingFront />
      {/* Pinned upper arms: static body — the elbow is the only mover. */}
      <path d="M85 58 L85 86 M115 58 L115 86" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <g className="hf-ghost" fill="none" stroke={BLUE} strokeWidth={3} strokeLinecap="round" aria-hidden="true">
        <path d={topL} />
        <path d={topR} />
        {hammer ? (
          <>
            <circle cx={82} cy={bellTopY} r={9} />
            <circle cx={118} cy={bellTopY} r={9} />
          </>
        ) : (
          <>
            <rect x={68.5} y={bellTopY - 7.5} width={27} height={15} rx={4} />
            <rect x={104.5} y={bellTopY - 7.5} width={27} height={15} rx={4} />
          </>
        )}
      </g>
      <path className="hf-traj" d={`M85 114 L82 ${bellTopY}`} />
      <path className="hf-traj" d={`M115 114 L118 ${bellTopY}`} />
      <g className="hf-mover" fill="none" stroke={BLUE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        <path d={restL}><ArmMorphD rest={restL} top={topL} dur={dur} on={motion} /></path>
        <path d={restR}><ArmMorphD rest={restR} top={topR} dur={dur} on={motion} /></path>
        {hammer ? (
          <>
            <g data-curl-bell className="hf-curl-hammer-left-bell" stroke="none"><Plate x={85} y={114} s={0.85} /></g>
            <g className="hf-curl-hammer-right-bell" stroke="none"><Plate x={115} y={114} s={0.85} /></g>
          </>
        ) : (
          <>
            <g data-curl-bell className="hf-curl-front-left-bell" stroke="none"><Dumbbell x={85} y={114} s={0.75} /></g>
            <g className="hf-curl-front-right-bell" stroke="none"><Dumbbell x={115} y={114} s={0.75} /></g>
          </>
        )}
      </g>
      <circle cx={85} cy={86} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
      <circle cx={115} cy={86} r={4} fill={BLUE} stroke="#0a1120" strokeWidth={1.5} />
    </>
  );
  if (!side) return null;
  return (
    <div ref={boxRef}>
      <div className="grid w-full max-w-3xl grid-cols-2 items-end gap-6 max-sm:grid-cols-1">
        <div className="flex min-w-0 flex-col items-center">
          <svg viewBox="0 0 200 170" className="h-auto w-full max-w-[360px]" role="img" aria-label="Front">
            {front}
          </svg>
          <div className="mt-1 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-0.5 text-sm font-bold uppercase tracking-[0.25em] text-sky-300">Front</div>
        </div>
        <div className="flex min-w-0 flex-col items-center">
          <RigFigure joints={side.joints} body={side.body} repSeconds={repSeconds} paused={paused} />
          <div className="mt-1 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-0.5 text-sm font-bold uppercase tracking-[0.25em] text-sky-300">Side</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Overhead triceps: SIDE profile + FRONT (vertical bells) ---------------- */
function TricepsAnim() {
  const side = (
    <g transform="translate(10 10) scale(0.9)">
      <circle cx={58} cy={42} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={49} y1={40} x2={44} y2={38} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={70} y1={54} x2={70} y2={114} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={70} y1={114} x2={58} y2={158} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={70} y1={114} x2={84} y2={158} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={58} y1={158} x2={50} y2={158} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={84} y1={158} x2={92} y2={158} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={70} y1={56} x2={73} y2={34} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path className="hf-traj" d="M78 14 A30 30 0 0 1 102 52" />
      <g
        className="hf-anim-trirear"
        style={{ transformBox: "view-box", transformOrigin: "73px 34px" }}
      >
        <line x1={73} y1={34} x2={75} y2={12} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <DumbbellV x={75} y={6} />
      </g>
    </g>
  );
  const front = (
    <>
      {/* bell group first: it passes BEHIND the head, as in the lift */}
      <path className="hf-traj" d="M100 6 A34 34 0 0 0 64 44" />
      <g
        className="hf-anim-tri"
        style={{ transformBox: "view-box", transformOrigin: "100px 40px" }}
      >
        <line x1={94} y1={40} x2={99} y2={24} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={106} y1={40} x2={101} y2={24} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <DumbbellV x={100} y={8} />
      </g>
      <StandingFigure />
      <line x1={100} y1={62} x2={94} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={62} x2={106} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </>
  );
  return <Views aLabel="Side" bLabel="Front" a={side} b={front} />;
}

/** Krita sprite strip: stepped playback on the same rep tempo. */
function SpriteStrip({ exerciseId, frames }: { exerciseId: string; frames: number }) {
  return (
    <div className="flex items-center justify-center" role="img" aria-label={`${exerciseId} demonstration`}>
      <div
        className="hf-sprite aspect-[4/3] w-full max-w-96"
        style={
          {
            backgroundImage: `url(/sprites/${exerciseId}.png)`,
            backgroundSize: `${frames * 100}% 100%`,
            "--frames": frames,
          } as CSSProperties
        }
      />
    </div>
  );
}

/** Compact single-figure preview for sidebars (decorative, fixed tempo). */
function MiniFigure({ exerciseId }: { exerciseId: string }) {
  return (
    <svg viewBox="0 0 80 72" className="h-14 w-16 shrink-0" aria-hidden="true">
      {exerciseId === "bench-press" && (
        <g transform="scale(0.4)" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x={18} y={116} width={114} height={9} rx={3} fill={DIM} stroke="none" />
          <path d="M32 125 V154 M119 125 V154 M16 158 H184" stroke={DIM} strokeWidth={5} />
          <rect x={47} y={96} width={76} height={19} rx={9.5} fill={INK} stroke="none" />
          <circle cx={33} cy={104} r={10} strokeWidth={4} />
          <path d="M42 107 H52 M117 105 L157 114 L156 154 L171 154" />
          {/* Static rest pose: the sidebar thumb identifies the move; the
              full-size figure teaches the motion. No SMIL clock lives here. */}
          <g stroke={BLUE}>
            <path d="M65 101 L90 110 L90 77" />
            <g stroke="none"><Plate x={90} y={77} s={0.82} /></g>
          </g>
        </g>
      )}
      {exerciseId === "one-arm-row" && (
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <rect x={13} y={44} width={47} height={4} rx={1} fill={DIM} stroke="none" />
          <path d="M18 48 V62 M55 48 V62 M8 64 H71" stroke={DIM} />
          <rect x={23} y={24} width={28} height={8} rx={4} fill={INK} stroke="none" />
          <circle cx={16} cy={25} r={4} />
          <path d="M20 26 L24 28 L19 42 H15 M47 31 L44 42 H56 M49 32 L56 47 L64 62 H59" strokeLinejoin="round" />
          <g className={`hf-mover ${rowStyles.miniArm}`}>
            <line x1={29} y1={28} x2={30} y2={51} />
            <circle cx={30} cy={53} r={4} fill={BLUE} stroke="none" />
          </g>
          <circle cx={29} cy={28} r={1.6} fill={BLUE} stroke="#0a1120" strokeWidth={0.6} />
        </g>
      )}
      {exerciseId === "shoulder-press" && (
        <g transform="scale(0.4)" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 157 H170" stroke={DIM} strokeWidth={5} />
          <circle cx={100} cy={35} r={10} strokeWidth={4} />
          <rect x={87} y={46} width={26} height={49} rx={13} fill={INK} stroke="none" />
          <path d="M93 95 L89 150 M107 95 L111 150" />
          {/* Static rack pose identifies the move; the full figure teaches it. */}
          <g stroke={BLUE}>
            <path d="M85 58 L74 78 L74 56" />
            <path d="M115 58 L126 78 L126 56" />
            <g stroke="none"><Dumbbell x={74} y={51} s={0.75} /><Dumbbell x={126} y={51} s={0.75} /></g>
          </g>
        </g>
      )}
      {exerciseId === "lateral-raise" && (
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <circle cx={40} cy={12} r={5} />
          <line x1={40} y1={18} x2={40} y2={48} strokeWidth={3} />
          <line x1={40} y1={48} x2={33} y2={64} />
          <line x1={40} y1={48} x2={47} y2={64} />
          <g className="hf-anim-raise-l">
            <line x1={40} y1={28} x2={22} y2={32} />
            <circle cx={19} cy={33} r={4} fill={BLUE} stroke="none" />
          </g>
          <g className="hf-anim-raise-r">
            <line x1={40} y1={28} x2={58} y2={32} />
            <circle cx={61} cy={33} r={4} fill={BLUE} stroke="none" />
          </g>
        </g>
      )}
      {exerciseId === "biceps-curl" && (
        <g transform="scale(0.4)" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 157 H170" stroke={DIM} strokeWidth={5} />
          <circle cx={100} cy={35} r={10} strokeWidth={4} />
          <rect x={87} y={46} width={26} height={49} rx={13} fill={INK} stroke="none" />
          <path d="M93 95 L89 150 M107 95 L111 150" />
          <path d="M85 58 L85 86 M115 58 L115 86" />
          {/* Static hang identifies the move; the full figure teaches it. */}
          <g stroke={BLUE}>
            <path d="M85 86 L85 114" />
            <path d="M115 86 L115 114" />
            <g stroke="none"><Dumbbell x={85} y={114} s={0.75} /><Dumbbell x={115} y={114} s={0.75} /></g>
          </g>
        </g>
      )}
      {exerciseId === "biceps-curl-hammer" && (
        <g transform="scale(0.4)" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 157 H170" stroke={DIM} strokeWidth={5} />
          <circle cx={100} cy={35} r={10} strokeWidth={4} />
          <rect x={87} y={46} width={26} height={49} rx={13} fill={INK} stroke="none" />
          <path d="M93 95 L89 150 M107 95 L111 150" />
          <path d="M85 58 L85 86 M115 58 L115 86" />
          <g stroke={BLUE}>
            <path d="M85 86 L85 114" />
            <path d="M115 86 L115 114" />
            <g stroke="none"><Plate x={85} y={114} s={0.85} /><Plate x={115} y={114} s={0.85} /></g>
          </g>
        </g>
      )}
      {exerciseId === "triceps-extension" && (
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <circle cx={40} cy={20} r={5} />
          <line x1={40} y1={26} x2={40} y2={52} strokeWidth={3} />
          <line x1={40} y1={52} x2={33} y2={66} />
          <line x1={40} y1={52} x2={47} y2={66} />
          <g className="hf-anim-tri">
            <line x1={40} y1={30} x2={40} y2={10} />
            <circle cx={40} cy={7} r={4.5} fill={BLUE} stroke="none" />
          </g>
        </g>
      )}
    </svg>
  );
}

const KNOWN_IDS = new Set([
  "bench-press",
  "one-arm-row",
  "shoulder-press",
  "lateral-raise",
  "biceps-curl",
  "biceps-curl-hammer",
  "triceps-extension",
]);

/** Placeholder for new catalog entries that don't have a custom figure yet. */
function GenericAnim() {
  const front = (
    <>
      <circle cx={100} cy={28} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={100} y1={40} x2={100} y2={105} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={100} y1={105} x2={82} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={105} x2={118} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g className="hf-anim-press">
        <line x1={100} y1={62} x2={76} y2={80} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={100} y1={62} x2={124} y2={80} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={70} y={82} />
        <Dumbbell x={130} y={82} />
      </g>
    </>
  );
  const side = (
    <>
      <circle cx={62} cy={32} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={72} y1={44} x2={72} y2={106} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={72} y1={106} x2={60} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={72} y1={106} x2={84} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g className="hf-anim-press">
        <line x1={72} y1={62} x2={58} y2={84} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Plate x={56} y={90} />
      </g>
    </>
  );
  return <Views aLabel="Front" bLabel="Side" a={front} b={side} />;
}

/** Rep-phase caption: LIFT → HOLD → LOWER → BOTTOM, on the same tempo.
 *  Lives inside the --rep-dur wrapper so it stays in sync with the figure. */
export function PhaseCaption() {
  return (
    <div className="relative mx-auto mt-2 h-8 w-full max-w-3xl rounded-full border border-slate-800 bg-slate-900/70 text-center text-lg font-bold uppercase tracking-[0.2em]" aria-hidden="true">
      <span className="hf-cap-lift absolute inset-0 py-0.5 text-green-300">Lift ↑</span>
      <span className="hf-cap-hold absolute inset-0 py-0.5 text-sky-300">Hold</span>
      <span className="hf-cap-lower absolute inset-0 py-0.5 text-amber-300">Lower ↓</span>
      <span className="hf-cap-bottom absolute inset-0 py-0.5 text-slate-400">Bottom</span>
    </div>
  );
}

export function ExerciseAnimation({
  exerciseId,
  variant = "full",
  className = "",
  /** Seconds per rep — drives animation tempo. Defaults to a calm demo pace. */
  repSeconds = 4,
  /** Freeze mid-pose (workout paused). */
  paused = false,
}: {
  exerciseId: string;
  variant?: "full" | "mini";
  className?: string;
  repSeconds?: number;
  paused?: boolean;
}) {
  if (variant === "mini") {
    if (!KNOWN_IDS.has(exerciseId)) {
      return (
        <svg viewBox="0 0 80 72" className="h-14 w-16 shrink-0" aria-hidden="true">
          <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
            <circle cx={40} cy={12} r={5} />
            <line x1={40} y1={18} x2={40} y2={48} strokeWidth={3} />
            <line x1={40} y1={48} x2={33} y2={64} />
            <line x1={40} y1={48} x2={47} y2={64} />
            <g className="hf-anim-press">
              <line x1={40} y1={28} x2={30} y2={42} />
              <line x1={40} y1={28} x2={50} y2={42} />
              <circle cx={29} cy={45} r={4} fill={BLUE} stroke="none" />
              <circle cx={51} cy={45} r={4} fill={BLUE} stroke="none" />
            </g>
          </g>
        </svg>
      );
    }
    return <MiniFigure exerciseId={exerciseId} />;
  }

  const frames = SPRITE_FRAMES[exerciseId];
  if (frames) return <SpriteStrip exerciseId={exerciseId} frames={frames} />;

  return (
    <div
      className={`${paused ? "hf-paused" : ""} ${className}`}
      style={{ "--rep-dur": `${Math.min(5, Math.max(2.5, repSeconds))}s` } as CSSProperties}
      aria-hidden="false"
    >
      {exerciseId === "bench-press" && <BenchPressAnim repSeconds={repSeconds} paused={paused} />}
      {exerciseId === "one-arm-row" && <RowAnim repSeconds={repSeconds} paused={paused} />}
      {exerciseId === "shoulder-press" && <ShoulderPressAnim repSeconds={repSeconds} paused={paused} />}
      {exerciseId === "lateral-raise" && <LateralRaiseAnim />}
      {exerciseId === "biceps-curl" && <CurlViews hammer={false} repSeconds={repSeconds} paused={paused} />}
      {exerciseId === "biceps-curl-hammer" && <CurlViews hammer={true} repSeconds={repSeconds} paused={paused} />}
      {exerciseId === "triceps-extension" && <TricepsAnim />}
      {!KNOWN_IDS.has(exerciseId) && <GenericAnim />}
      <PhaseCaption />
    </div>
  );
}
