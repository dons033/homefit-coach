"use client";

import type { CSSProperties } from "react";
import { Dumbbell, Plate, DumbbellV } from "./bells";
import { RigFigure } from "./RigFigure";
import { RIG_DEFS } from "@/lib/poses";

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
      <div className="mt-1 text-base font-semibold tracking-wide text-slate-300">{label}</div>
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

/* ---------------- Bench press: SIDE (end-on bells) + FRONT (feet end) ---------------- */
function BenchPressAnim() {
  const side = (
    <>
      <rect x={20} y={112} width={120} height={10} rx={2} fill={DIM} />
      <rect x={30} y={122} width={8} height={33} fill={DIM} />
      <rect x={122} y={122} width={8} height={33} fill={DIM} />
      <ellipse cx={84} cy={100} rx={36} ry={11} fill="none" stroke={INK} strokeWidth={4.5} />
      <circle cx={68} cy={97} r={2.5} fill={INK} />
      <circle cx={104} cy={97} r={2.5} fill={INK} />
      <circle cx={44} cy={88} r={9} fill="none" stroke={INK} strokeWidth={3.5} />
      <line x1={36} y1={86} x2={30} y2={84} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={116} y1={100} x2={138} y2={126} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={138} y1={126} x2={138} y2={154} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={138} y1={154} x2={147} y2={154} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <path className="hf-traj" d="M87 36 V68" />
      <g className="hf-anim-press">
        <line x1={68} y1={97} x2={56} y2={79} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={56} y1={79} x2={64} y2={60} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={104} y1={97} x2={116} y2={79} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={116} y1={79} x2={110} y2={60} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <Plate x={64} y={53} />
        <Plate x={110} y={53} />
      </g>
    </>
  );
  const front = (
    <>
      {/* long bench bar behind everything: this figure is LYING down */}
      <rect x={28} y={92} width={144} height={10} rx={2} fill={DIM} />
      <rect x={40} y={102} width={8} height={34} fill={DIM} />
      <rect x={152} y={102} width={8} height={34} fill={DIM} />
      <circle cx={100} cy={40} r={8} fill="none" stroke={INK} strokeWidth={3.5} />
      <rect x={84} y={52} width={32} height={46} rx={10} fill="none" stroke={INK} strokeWidth={4.5} />
      {/* knees bent, feet flat — the unmistakable lying cue */}
      <line x1={100} y1={96} x2={78} y2={70} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={78} y1={70} x2={70} y2={100} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <rect x={60} y={97} width={18} height={7} rx={3.5} fill={INK} />
      <line x1={100} y1={96} x2={122} y2={70} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={122} y1={70} x2={130} y2={100} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <rect x={122} y={97} width={18} height={7} rx={3.5} fill={INK} />
      <circle cx={85} cy={60} r={2.5} fill={INK} />
      <circle cx={115} cy={60} r={2.5} fill={INK} />
      <path className="hf-traj" d="M80 38 V70" />
      <path className="hf-traj" d="M120 38 V70" />
      <g className="hf-anim-press">
        <line x1={85} y1={60} x2={72} y2={84} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={72} y1={84} x2={80} y2={56} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={115} y1={60} x2={128} y2={84} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={128} y1={84} x2={120} y2={56} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <Dumbbell x={80} y={49} />
        <Dumbbell x={120} y={49} />
      </g>
    </>
  );
  return <Views aLabel="Side" bLabel="Front" a={side} b={front} />;
}

/* ---------------- One-arm row: SIDE + BACK (no nose tick = facing away) ---------------- */
function RowAnim() {
  const side = (
    <>
      <rect x={30} y={118} width={110} height={10} rx={2} fill={DIM} />
      <rect x={40} y={128} width={8} height={28} fill={DIM} />
      <rect x={122} y={128} width={8} height={28} fill={DIM} />
      <line x1={55} y1={80} x2={115} y2={80} stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      <line x1={114} y1={79} x2={120} y2={73} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={126} cy={68} r={9} fill="none" stroke={INK} strokeWidth={3.5} />
      <line x1={118} y1={66} x2={112} y2={64} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={60} y1={80} x2={60} y2={118} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={115} y1={80} x2={110} y2={118} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path className="hf-traj" d="M95 88 V110" />
      <g className="hf-anim-row">
        <line x1={95} y1={82} x2={95} y2={108} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={95} y={114} />
      </g>
    </>
  );
  const back = (
    <>
      <rect x={35} y={118} width={100} height={10} rx={2} fill={DIM} />
      <rect x={45} y={128} width={8} height={28} fill={DIM} />
      <rect x={117} y={128} width={8} height={28} fill={DIM} />
      <line x1={45} y1={80} x2={155} y2={80} stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      <line x1={100} y1={73} x2={100} y2={80} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={100} cy={64} r={9} fill="none" stroke={INK} strokeWidth={3.5} />
      <line x1={70} y1={80} x2={70} y2={114} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={140} y1={80} x2={122} y2={106} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx={118} cy={110} r={7} fill="none" stroke={INK} strokeWidth={3.5} />
      <line x1={148} y1={80} x2={150} y2={116} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={150} y1={116} x2={156} y2={116} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path className="hf-traj" d="M138 86 V110" />
      <g className="hf-anim-row">
        <line x1={138} y1={82} x2={138} y2={106} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Plate x={138} y={112} />
      </g>
    </>
  );
  return <Views aLabel="Side" bLabel="Back" a={side} b={back} />;
}

/* ---------------- Shoulder press: FRONT (bars) + SIDE profile (plates) ---------------- */
function ShoulderPressAnim() {
  const front = (
    <>
      <StandingFigure />
      <line x1={100} y1={62} x2={72} y2={62} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={62} x2={128} y2={62} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path className="hf-traj" d="M72 28 V58" />
      <path className="hf-traj" d="M128 28 V58" />
      <g className="hf-anim-press">
        <line x1={72} y1={62} x2={72} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={128} y1={62} x2={128} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={72} y={34} />
        <Dumbbell x={128} y={34} />
      </g>
    </>
  );
  const side = (
    <>
      <circle cx={66} cy={32} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={57} y1={30} x2={52} y2={28} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={76} y1={44} x2={76} y2={106} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={76} y1={106} x2={64} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={76} y1={106} x2={88} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={64} y1={150} x2={56} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={88} y1={150} x2={96} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={76} y1={60} x2={94} y2={74} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path className="hf-traj" d="M94 36 V68" />
      <g className="hf-anim-press">
        <line x1={94} y1={74} x2={94} y2={50} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Plate x={94} y={44} />
      </g>
    </>
  );
  return <Views aLabel="Front" bLabel="Side" a={front} b={side} />;
}

/* ---------------- Lateral raise: FRONT (plates) + TOP (bars) ----------------
 * Full ROM: rest hangs at the sides, top ≈ 100° abduction (measured).
 * The old figure hovered half-raised forever — it never came down. */
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
  const topPivot: CSSProperties = { transformBox: "view-box", transformOrigin: "100px 62px" };
  const top = (
    <>
      <circle cx={100} cy={32} r={10} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={100} y1={44} x2={100} y2={112} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path className="hf-traj" d="M86 100 Q62 80 54 66" />
      <path className="hf-traj" d="M114 100 Q138 80 146 66" />
      <g className="hf-anim-raiseFL" style={topPivot}>
        <line x1={100} y1={62} x2={88} y2={104} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={86} y={108} />
      </g>
      <g className="hf-anim-raiseFR" style={topPivot}>
        <line x1={100} y1={62} x2={112} y2={104} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={114} y={108} />
      </g>
    </>
  );
  return <Views aLabel="Front" bLabel="Top" a={front} b={top} />;
}

/* ---------------- Biceps curl: FRONT (bars) + SIDE profile (plates) ---------------- */
/* ---------------- Rig-driven curls (regular + hammer share the side view) ---------------- */
function RigViews({
  frontId,
  sideId,
  repSeconds,
  paused,
}: {
  frontId: string;
  sideId: string;
  repSeconds: number;
  paused: boolean;
}) {
  const front = RIG_DEFS[frontId];
  const side = RIG_DEFS[sideId];
  if (!front || !side) return null;
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 items-end gap-6 max-sm:grid-cols-1">
      <div className="flex min-w-0 flex-col items-center">
        <RigFigure joints={front.joints} body={front.body} repSeconds={repSeconds} paused={paused} />
        <div className="mt-1 text-base font-semibold tracking-wide text-slate-300">Front</div>
      </div>
      <div className="flex min-w-0 flex-col items-center">
        <RigFigure joints={side.joints} body={side.body} repSeconds={repSeconds} paused={paused} />
        <div className="mt-1 text-base font-semibold tracking-wide text-slate-300">Side</div>
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
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <rect x={8} y={44} width={50} height={5} rx={1} fill={DIM} stroke="none" />
          <ellipse cx={33} cy={39} rx={15} ry={5} />
          <circle cx={18} cy={34} r={4.5} />
          <g className="hf-anim-press">
            <line x1={32} y1={39} x2={32} y2={20} />
            <circle cx={32} cy={17} r={5} fill={BLUE} stroke="none" />
          </g>
        </g>
      )}
      {exerciseId === "one-arm-row" && (
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <rect x={10} y={46} width={46} height={5} rx={1} fill={DIM} stroke="none" />
          <line x1={20} y1={30} x2={46} y2={30} strokeWidth={3.5} />
          <circle cx={52} cy={24} r={4.5} />
          <g className="hf-anim-row">
            <line x1={38} y1={31} x2={38} y2={44} />
            <circle cx={38} cy={47} r={5} fill={BLUE} stroke="none" />
          </g>
        </g>
      )}
      {exerciseId === "shoulder-press" && (
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <circle cx={40} cy={12} r={5} />
          <line x1={40} y1={18} x2={40} y2={48} strokeWidth={3} />
          <line x1={40} y1={48} x2={33} y2={64} />
          <line x1={40} y1={48} x2={47} y2={64} />
          <g className="hf-anim-press">
            <line x1={40} y1={28} x2={30} y2={26} />
            <line x1={40} y1={28} x2={50} y2={26} />
            <line x1={30} y1={26} x2={30} y2={14} />
            <line x1={50} y1={26} x2={50} y2={14} />
            <circle cx={30} cy={12} r={4} fill={BLUE} stroke="none" />
            <circle cx={50} cy={12} r={4} fill={BLUE} stroke="none" />
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
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <circle cx={40} cy={12} r={5} />
          <line x1={40} y1={18} x2={40} y2={48} strokeWidth={3} />
          <line x1={40} y1={48} x2={33} y2={64} />
          <line x1={40} y1={48} x2={47} y2={64} />
          <g className="hf-anim-curl">
            <line x1={40} y1={28} x2={32} y2={44} />
            <circle cx={32} cy={48} r={4} fill={BLUE} stroke="none" />
            <line x1={40} y1={28} x2={48} y2={44} />
            <circle cx={48} cy={48} r={4} fill={BLUE} stroke="none" />
          </g>
        </g>
      )}
      {exerciseId === "biceps-curl-hammer" && (
        <g stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round">
          <circle cx={40} cy={12} r={5} />
          <line x1={40} y1={18} x2={40} y2={48} strokeWidth={3} />
          <line x1={40} y1={48} x2={33} y2={64} />
          <line x1={40} y1={48} x2={47} y2={64} />
          <g className="hf-anim-curl">
            <line x1={40} y1={28} x2={34} y2={44} />
            <circle cx={34} cy={48} r={4} fill={BLUE} stroke="none" />
            <line x1={40} y1={28} x2={46} y2={44} />
            <circle cx={46} cy={48} r={4} fill={BLUE} stroke="none" />
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
    <div className="relative mx-auto mt-1 h-7 w-full max-w-3xl text-center text-lg font-bold uppercase tracking-[0.2em]" aria-hidden="true">
      <span className="hf-cap-lift absolute inset-0 text-green-300">Lift ↑</span>
      <span className="hf-cap-hold absolute inset-0 text-sky-300">Hold</span>
      <span className="hf-cap-lower absolute inset-0 text-amber-300">Lower ↓</span>
      <span className="hf-cap-bottom absolute inset-0 text-slate-400">Bottom</span>
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
      {exerciseId === "bench-press" && <BenchPressAnim />}
      {exerciseId === "one-arm-row" && <RowAnim />}
      {exerciseId === "shoulder-press" && <ShoulderPressAnim />}
      {exerciseId === "lateral-raise" && <LateralRaiseAnim />}
      {exerciseId === "biceps-curl" && (
        <RigViews frontId="curl-front-regular" sideId="curl-side" repSeconds={repSeconds} paused={paused} />
      )}
      {exerciseId === "biceps-curl-hammer" && (
        <RigViews frontId="curl-front-hammer" sideId="curl-side" repSeconds={repSeconds} paused={paused} />
      )}
      {exerciseId === "triceps-extension" && <TricepsAnim />}
      {!KNOWN_IDS.has(exerciseId) && <GenericAnim />}
      <PhaseCaption />
    </div>
  );
}
