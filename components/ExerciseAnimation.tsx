"use client";

import type { CSSProperties } from "react";

/* Procedural stick-figure demos. One animation loop = one rep; tempo comes
 * from --rep-dur (work seconds ÷ target reps, set via repSeconds prop).
 * Start/end frames draw IDENTICAL geometry — the second runs half a rep out
 * of phase (hf-phase-b), so the pair always shows opposite ends of the rep.
 *
 * Rotational pivots use explicit view-box coordinates (transform-box:
 * view-box + transform-origin in px) so elbows/shoulders stay pinned.
 * Bounding-box origins drift when the dumbbell rect widens the box —
 * never use fill-box origins here.
 *
 * LONG-RUN SPRITE PATH (Krita):
 *   1. Draw N equal frames in a horizontal strip, transparent PNG.
 *   2. Save as public/sprites/<exercise-id>.png (suggested 480px/frame).
 *   3. Register the frame count in SPRITE_FRAMES below.
 *   The sprite renders automatically with stepped timing on the same
 *   --rep-dur tempo; unregistered ids keep the SVG figure. Nothing else changes.
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

function Dumbbell({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-14} y={-7} width={28} height={14} rx={7} fill={BLUE} />
      <rect x={-18} y={-10} width={6} height={20} rx={3} fill={BLUE} opacity={0.85} />
      <rect x={12} y={-10} width={6} height={20} rx={3} fill={BLUE} opacity={0.85} />
    </g>
  );
}

/** Pair wrapper: same pose twice, second half a rep out of phase. */
function Pair({
  startLabel,
  endLabel,
  baseClass,
  pose,
}: {
  startLabel: string;
  endLabel: string;
  baseClass: string;
  pose: (groupClass: string) => React.ReactNode;
}) {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 items-end gap-6 max-sm:grid-cols-1">
      <Frame label={startLabel}>{pose(baseClass)}</Frame>
      <Frame label={endLabel}>{pose(`${baseClass} hf-phase-b`)}</Frame>
    </div>
  );
}

/* ---------------- Bench press: flat back, bells chest ↔ overhead ---------------- */
function BenchPressAnim() {
  const pose = (cls: string) => (
    <>
      <rect x={20} y={110} width={120} height={10} rx={2} fill={DIM} />
      <rect x={30} y={120} width={8} height={35} fill={DIM} />
      <rect x={122} y={120} width={8} height={35} fill={DIM} />
      <ellipse cx={85} cy={100} rx={38} ry={12} fill="none" stroke={INK} strokeWidth={3.5} />
      <circle cx={45} cy={88} r={9} fill="none" stroke={INK} strokeWidth={3.5} />
      <line x1={120} y1={100} x2={140} y2={125} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={140} y1={125} x2={140} y2={155} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <g className={cls}>
        <line x1={84} y1={98} x2={74} y2={78} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={74} y1={78} x2={80} y2={58} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={104} y1={98} x2={114} y2={78} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={114} y1={78} x2={108} y2={58} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={80} y={52} />
        <Dumbbell x={108} y={52} />
      </g>
    </>
  );
  return <Pair startLabel="Chest" endLabel="Press up" baseClass="hf-anim-press" pose={pose} />;
}

/* ---------------- One-arm row: flat back like a table, hang ↔ hip ---------------- */
function RowAnim() {
  const pose = (cls: string) => (
    <>
      <rect x={30} y={118} width={110} height={10} rx={2} fill={DIM} />
      <rect x={40} y={128} width={8} height={28} fill={DIM} />
      <rect x={122} y={128} width={8} height={28} fill={DIM} />
      <line x1={55} y1={80} x2={115} y2={80} stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      <circle cx={126} cy={68} r={9} fill="none" stroke={INK} strokeWidth={3.5} />
      <line x1={60} y1={80} x2={60} y2={118} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={115} y1={80} x2={110} y2={118} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g className={cls}>
        <line x1={95} y1={82} x2={95} y2={108} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={95} y={114} />
      </g>
    </>
  );
  return <Pair startLabel="Hang" endLabel="Row to hip" baseClass="hf-anim-row" pose={pose} />;
}

function StandingFigure() {
  return (
    <>
      <circle cx={100} cy={28} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={100} y1={40} x2={100} y2={105} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={100} y1={105} x2={82} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={105} x2={118} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={82} y1={150} x2={74} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={118} y1={150} x2={126} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </>
  );
}

/* ---------------- Shoulder press: goalpost start, bells overhead ---------------- */
function ShoulderPressAnim() {
  const pose = (cls: string) => (
    <>
      <StandingFigure />
      {/* upper arms held horizontal — the press moves forearms + bells */}
      <line x1={100} y1={62} x2={76} y2={62} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={62} x2={124} y2={62} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g className={cls}>
        <line x1={76} y1={62} x2={76} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={124} y1={62} x2={124} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={76} y={34} />
        <Dumbbell x={124} y={34} />
      </g>
    </>
  );
  return <Pair startLabel="At shoulders" endLabel="Press overhead" baseClass="hf-anim-press" pose={pose} />;
}

/* ---------------- Lateral raise: pinned shoulder pivots ---------------- */
function LateralRaiseAnim() {
  const pivot: CSSProperties = { transformBox: "view-box", transformOrigin: "100px 62px" };
  return (
    <div className="flex items-center justify-center">
      <Frame label="Raise to shoulder height">
        <StandingFigure />
        <g className="hf-anim-raise-l" style={pivot}>
          <line x1={100} y1={62} x2={54} y2={72} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Dumbbell x={48} y={74} />
        </g>
        <g className="hf-anim-raise-r" style={pivot}>
          <line x1={100} y1={62} x2={146} y2={72} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Dumbbell x={152} y={74} />
        </g>
      </Frame>
    </div>
  );
}

/* ---------------- Biceps curl: pinned elbow pivots, upper arms still ---------------- */
function CurlAnim() {
  const pose = (cls: string) => (
    <>
      <StandingFigure />
      <line x1={100} y1={62} x2={86} y2={86} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={62} x2={114} y2={86} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g
        className={cls}
        style={{ transformBox: "view-box", transformOrigin: "86px 86px" }}
      >
        <line x1={86} y1={86} x2={86} y2={114} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={86} y={120} />
      </g>
      <g
        className={cls}
        style={{ transformBox: "view-box", transformOrigin: "114px 86px" }}
      >
        <line x1={114} y1={86} x2={114} y2={114} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={114} y={120} />
      </g>
    </>
  );
  return <Pair startLabel="Down" endLabel="Curl up" baseClass="hf-anim-curl" pose={pose} />;
}

/* ---------------- Overhead triceps: elbows pinned up, forearms hinge ---------------- */
function TricepsAnim() {
  const pose = (cls: string) => (
    <>
      <StandingFigure />
      <line x1={100} y1={62} x2={94} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={62} x2={106} y2={40} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g
        className={cls}
        style={{ transformBox: "view-box", transformOrigin: "100px 40px" }}
      >
        <line x1={100} y1={40} x2={100} y2={14} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={100} y={8} />
      </g>
    </>
  );
  return <Pair startLabel="Behind head" endLabel="Press up" baseClass="hf-anim-tri" pose={pose} />;
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
            <line x1={40} y1={28} x2={32} y2={26} />
            <line x1={40} y1={28} x2={48} y2={26} />
            <line x1={32} y1={26} x2={32} y2={14} />
            <line x1={48} y1={26} x2={48} y2={14} />
            <circle cx={32} cy={12} r={4} fill={BLUE} stroke="none" />
            <circle cx={48} cy={12} r={4} fill={BLUE} stroke="none" />
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
  "triceps-extension",
]);

/** Placeholder for new catalog entries that don't have a custom figure yet. */
function GenericAnim() {
  const pose = (cls: string) => (
    <>
      <circle cx={100} cy={28} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={100} y1={40} x2={100} y2={105} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={100} y1={105} x2={82} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={105} x2={118} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g className={cls}>
        <line x1={100} y1={62} x2={76} y2={80} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={100} y1={62} x2={124} y2={80} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <Dumbbell x={70} y={82} />
        <Dumbbell x={130} y={82} />
      </g>
    </>
  );
  return <Pair startLabel="Move" endLabel="Return" baseClass="hf-anim-press" pose={pose} />;
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
      style={{ "--rep-dur": `${Math.min(8, Math.max(1.2, repSeconds))}s` } as CSSProperties}
      aria-hidden="false"
    >
      {exerciseId === "bench-press" && <BenchPressAnim />}
      {exerciseId === "one-arm-row" && <RowAnim />}
      {exerciseId === "shoulder-press" && <ShoulderPressAnim />}
      {exerciseId === "lateral-raise" && <LateralRaiseAnim />}
      {exerciseId === "biceps-curl" && <CurlAnim />}
      {exerciseId === "triceps-extension" && <TricepsAnim />}
      {!KNOWN_IDS.has(exerciseId) && <GenericAnim />}
    </div>
  );
}
