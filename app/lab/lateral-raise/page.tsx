"use client";

import { useState } from "react";
import Link from "next/link";
import { LateralRaiseAnimation } from "@/components/LateralRaiseAnimation";

export default function LateralRaiseReview() {
  const [phase, setPhase] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const button = "min-h-12 rounded-xl bg-slate-800 px-5 py-3 text-base font-bold hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300";
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4 text-sm"><Link href="/" className="text-slate-300 hover:text-white">← HomeFit Coach</Link><span className="rounded-full border border-sky-500/30 px-3 py-1 text-sky-300">Form review · example</span></div>
      <h1 className="mt-7 text-4xl font-extrabold sm:text-5xl">Lateral raise</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-300">Lift out wide. Keep a soft elbow bend. Lower with control.</p>
      <section aria-label="Exercise demonstration" className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/40 px-3 py-5 sm:px-6">
        <LateralRaiseAnimation repSeconds={4} paused={paused} phase={phase} />
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button className={`${button} !bg-sky-400 !text-slate-950 hover:!bg-sky-300`} onClick={() => { if (phase !== null) { setPhase(null); setPaused(false); } else setPaused(p => !p); }}>{phase !== null ? "Play loop" : paused ? "Resume" : "Pause"}</button>
          <button className={button} onClick={() => setPhase(0)}>Start position</button>
          <button className={button} onClick={() => setPhase(0.45)}>Raised position</button>
        </div>
        <label className="mx-auto mt-5 block max-w-lg text-sm text-slate-300">Explore the movement{phase !== null ? ` · ${Math.round(phase * 100)}% of rep` : ""}
          <input aria-label="Rep position" className="mt-3 w-full accent-sky-400" type="range" min={0} max={100} value={phase === null ? 0 : Math.round(phase * 100)} onChange={e => setPhase(Number(e.target.value) / 100)} />
        </label>
        <p className="mt-4 text-center text-sm text-slate-400">Blue shows the moving arms. Faint outlines show the start and finish.</p>
      </section>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[['01 · Set up', 'Stand tall, feet planted.', 'Start with light dumbbells beside your thighs.'], ['02 · Lift', 'Out to the sides.', 'Keep a small elbow bend as you lift to around shoulder height.'], ['03 · Return', 'Lower smoothly.', 'Keep your body steady and avoid swinging the weights.']].map(([label,title,detail]) => (
          <section key={label} className="rounded-2xl border border-slate-800 p-5"><p className="text-xs font-bold uppercase tracking-wider text-sky-300">{label}</p><h2 className="mt-2 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-300">{detail}</p></section>
        ))}
      </div>
      <details className="mt-6 rounded-2xl border border-slate-800 p-5 text-sm text-slate-300">
        <summary className="cursor-pointer font-bold text-slate-100">Compare the reference & review the form</summary>
        <p className="mt-3">This is a visual example for review. A coach has not yet signed off on this illustration. Range should suit the person; the drawing is not an angle target.</p>
        <div className="mt-4 flex flex-wrap gap-4"><a href="/form/lateral-raise/0.jpg" target="_blank" rel="noreferrer" className="text-sky-300 underline">Starting photo ↗</a><a href="/form/lateral-raise/1.jpg" target="_blank" rel="noreferrer" className="text-sky-300 underline">Raised photo ↗</a><a href="https://www.acefitness.org/resources/everyone/exercise-library/26/lateral-raise/" target="_blank" rel="noreferrer" className="text-sky-300 underline">ACE technique reference ↗</a></div>
        <p className="mt-4">Review both views: is the direction clear, does the elbow bend stay consistent, and can you identify the setup and endpoints at a glance?</p>
      </details>
    </main>
  );
}
