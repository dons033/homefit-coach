"use client";

/* Reusable procedural stick-figure demos. Loops continuously, slow enough to follow.
   Usage: <ExerciseAnimation exerciseId="bench-press" className="..." />
   No video files. Respects prefers-reduced-motion via CSS (animation: none).
*/

const INK = "#e2e8f0";
const DIM = "#64748b";
const BLUE = "#38bdf8";

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 170" className="h-56 w-64 sm:h-72 sm:w-96" role="img" aria-label={label}>
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

function BenchPressAnim() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      {/* Start: bar at chest */}
      <Frame label="Start">
        {/* bench */}
        <rect x={20} y={110} width={120} height={10} rx={2} fill={DIM} />
        <rect x={30} y={120} width={8} height={35} fill={DIM} />
        <rect x={122} y={120} width={8} height={35} fill={DIM} />
        {/* body */}
        <ellipse cx={85} cy={100} rx={38} ry={12} fill="none" stroke={INK} strokeWidth={3} />
        <circle cx={45} cy={88} r={9} fill="none" stroke={INK} strokeWidth={3} />
        <line x1={120} y1={100} x2={140} y2={125} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <line x1={140} y1={125} x2={140} y2={155} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        {/* arms bent, bells at chest */}
        <g className="hf-anim-press">
          <line x1={80} y1={100} x2={70} y2={78} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={70} y1={78} x2={82} y2={66} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={100} y1={100} x2={110} y2={78} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={110} y1={78} x2={98} y2={66} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={82} y={60} />
          <Dumbbell x={98} y={60} />
        </g>
      </Frame>
      {/* End: pressed up */}
      <Frame label="Press up">
        <rect x={20} y={110} width={120} height={10} rx={2} fill={DIM} />
        <rect x={30} y={120} width={8} height={35} fill={DIM} />
        <rect x={122} y={120} width={8} height={35} fill={DIM} />
        <ellipse cx={85} cy={100} rx={38} ry={12} fill="none" stroke={INK} strokeWidth={3} />
        <circle cx={45} cy={88} r={9} fill="none" stroke={INK} strokeWidth={3} />
        <line x1={120} y1={100} x2={140} y2={125} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <line x1={140} y1={125} x2={140} y2={155} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <g className="hf-anim-press hf-phase-b">
          <line x1={82} y1={100} x2={82} y2={55} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={102} y1={100} x2={102} y2={55} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={82} y={45} />
          <Dumbbell x={102} y={45} />
        </g>
      </Frame>
    </div>
  );
}

function RowAnim() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      <Frame label="Hang">
        <rect x={30} y={118} width={110} height={10} rx={2} fill={DIM} />
        <rect x={40} y={128} width={8} height={28} fill={DIM} />
        <rect x={122} y={128} width={8} height={28} fill={DIM} />
        {/* torso flat */}
        <line x1={55} y1={80} x2={115} y2={80} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <circle cx={125} cy={68} r={9} fill="none" stroke={INK} strokeWidth={3} />
        <line x1={60} y1={80} x2={60} y2={118} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={115} y1={80} x2={110} y2={118} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <g className="hf-anim-row">
          <line x1={95} y1={82} x2={95} y2={110} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={95} y={116} />
        </g>
      </Frame>
      <Frame label="Row to hip">
        <rect x={30} y={118} width={110} height={10} rx={2} fill={DIM} />
        <rect x={40} y={128} width={8} height={28} fill={DIM} />
        <rect x={122} y={128} width={8} height={28} fill={DIM} />
        <line x1={55} y1={80} x2={115} y2={80} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <circle cx={125} cy={68} r={9} fill="none" stroke={INK} strokeWidth={3} />
        <line x1={60} y1={80} x2={60} y2={118} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={115} y1={80} x2={110} y2={118} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <g className="hf-anim-row hf-phase-b">
          <line x1={95} y1={82} x2={105} y2={92} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={104} y={88} />
        </g>
      </Frame>
    </div>
  );
}

function StandingFigure({ armUp = 0 }: { armUp?: number }) {
  // armUp 0 = at sides, 1 = overhead; we animate via CSS groups in parents
  return (
    <>
      <circle cx={100} cy={28} r={11} fill="none" stroke={INK} strokeWidth={3.5} />
      <line x1={100} y1={40} x2={100} y2={105} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={100} y1={105} x2={82} y2={150} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={100} y1={105} x2={118} y2={150} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={82} y1={150} x2={74} y2={150} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={118} y1={150} x2={126} y2={150} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      {!armUp ? null : null}
    </>
  );
}

function ShoulderPressAnim() {
  const arm = (x: number, flip = 1) => (
    <g className="hf-anim-press" style={{ animationDelay: flip > 0 ? "0s" : "-0.15s" }}>
      <line x1={100 + x} y1={62} x2={100 + x * 1.6} y2={34} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <Dumbbell x={100 + x * 1.6} y={28} />
    </g>
  );
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      <Frame label="At shoulders">
        <StandingFigure />
        <line x1={100} y1={62} x2={78} y2={72} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={100} y1={62} x2={122} y2={72} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <Dumbbell x={74} y={68} />
        <Dumbbell x={126} y={68} />
      </Frame>
      <Frame label="Press overhead">
        <StandingFigure />
        {arm(-14)}
        {arm(14, -1)}
      </Frame>
    </div>
  );
}

function LateralRaiseAnim() {
  return (
    <div className="flex items-center justify-center">
      <Frame label="Raise to shoulder height">
        <svg viewBox="0 0 200 170" className="hidden" />
        <StandingFigure />
        <g className="hf-anim-raise-l">
          <line x1={100} y1={62} x2={52} y2={78} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={46} y={80} />
        </g>
        <g className="hf-anim-raise-r">
          <line x1={100} y1={62} x2={148} y2={78} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={154} y={80} />
        </g>
      </Frame>
    </div>
  );
}

function CurlAnim() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      <Frame label="Down">
        <StandingFigure />
        <line x1={100} y1={62} x2={84} y2={88} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={100} y1={62} x2={116} y2={88} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <g className="hf-anim-curl">
          <line x1={84} y1={88} x2={84} y2={116} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={84} y={122} />
        </g>
        <g className="hf-anim-curl" style={{ animationDelay: "-0.15s" }}>
          <line x1={116} y1={88} x2={116} y2={116} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={116} y={122} />
        </g>
      </Frame>
      <Frame label="Curl up">
        <StandingFigure />
        <line x1={100} y1={62} x2={84} y2={88} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={100} y1={62} x2={116} y2={88} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <g className="hf-anim-curl" style={{ animationDelay: "-1.1s" }}>
          <line x1={84} y1={88} x2={92} y2={64} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={93} y={58} />
        </g>
        <g className="hf-anim-curl" style={{ animationDelay: "-1.25s" }}>
          <line x1={116} y1={88} x2={108} y2={64} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={107} y={58} />
        </g>
      </Frame>
    </div>
  );
}

function TricepsAnim() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      <Frame label="Behind head">
        <StandingFigure />
        <line x1={100} y1={62} x2={100} y2={38} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <g className="hf-anim-tri">
          <line x1={100} y1={38} x2={86} y2={58} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={82} y={62} />
        </g>
      </Frame>
      <Frame label="Press up">
        <StandingFigure />
        <line x1={100} y1={62} x2={100} y2={38} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <g className="hf-anim-tri" style={{ animationDelay: "-1.2s" }}>
          <line x1={100} y1={38} x2={100} y2={10} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <Dumbbell x={100} y={8} />
        </g>
      </Frame>
    </div>
  );
}

/** Compact single-figure preview for sidebars (small). */
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
            <line x1={40} y1={28} x2={30} y2={16} />
            <line x1={40} y1={28} x2={50} y2={16} />
            <circle cx={29} cy={14} r={4.5} fill={BLUE} stroke="none" />
            <circle cx={51} cy={14} r={4.5} fill={BLUE} stroke="none" />
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
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      <Frame label="Move">
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
      </Frame>
      <Frame label="Return">
        <circle cx={100} cy={28} r={11} fill="none" stroke={INK} strokeWidth={4} />
        <line x1={100} y1={40} x2={100} y2={105} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        <line x1={100} y1={105} x2={82} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={100} y1={105} x2={118} y2={150} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <g className="hf-anim-press" style={{ animationDelay: "-1.2s" }}>
          <line x1={100} y1={62} x2={84} y2={100} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <line x1={100} y1={62} x2={116} y2={100} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <Dumbbell x={84} y={106} />
          <Dumbbell x={116} y={106} />
        </g>
      </Frame>
    </div>
  );
}

export function ExerciseAnimation({
  exerciseId,
  variant = "full",
  className = "",
}: {
  exerciseId: string;
  variant?: "full" | "mini";
  className?: string;
}) {
  if (variant === "mini" && !KNOWN_IDS.has(exerciseId)) {
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
  if (variant === "mini") return <MiniFigure exerciseId={exerciseId} />;
  return (
    <div className={className} aria-hidden="false">
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
