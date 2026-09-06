"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RigFigure } from "@/components/RigFigure";
import { PhaseCaption } from "@/components/ExerciseAnimation";
import { RIG_DEF_LIST, RIG_DEFS } from "@/lib/poses";

/* Animation lab — a critique workbench, NOT part of the workout.
 * Big rig rendering, tempo control, phase scrub, joint readouts,
 * and A/B variant comparison. New poses get reviewed here first. */

function angleAt(def: (typeof RIG_DEF_LIST)[number], jointId: string, phase: number): number | null {
  const j = def.joints.find((x) => x.id === jointId);
  if (!j) return null;
  const t = Math.min(1, Math.max(0, phase));
  if (t < 0.38) return j.from + (j.to - j.from) * (t / 0.38);
  if (t < 0.52) return j.to;
  if (t < 0.88) return j.to + (j.from - j.to) * ((t - 0.52) / 0.36);
  return j.from;
}

export default function LabPage() {
  const [defId, setDefId] = useState(RIG_DEF_LIST[0]?.id ?? "");
  const [compareId, setCompareId] = useState<string | null>(null);
  const [tempo, setTempo] = useState(4);
  const [scrub, setScrub] = useState<number | null>(null);
  const def = RIG_DEFS[defId];
  const compare = compareId ? RIG_DEFS[compareId] : null;
  const phase = useMemo(() => scrub, [scrub]);

  if (!def) return <div className="p-10 text-2xl">No rig defs yet.</div>;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold uppercase tracking-widest text-amber-300">Dev lab — critique tool</div>
          <h1 className="text-4xl font-extrabold">Animation Lab</h1>
        </div>
        <Link href="/" className="min-h-[56px] rounded-2xl bg-slate-700 px-6 py-3 text-xl font-bold">
          ← Workout
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {RIG_DEF_LIST.map((d) => (
          <button
            key={d.id}
            onClick={() => setDefId(d.id)}
            aria-pressed={defId === d.id}
            className={`min-h-[48px] rounded-xl px-4 text-lg font-bold ${defId === d.id ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-white"}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
          <RigFigure joints={def.joints} body={def.body} repSeconds={tempo} paused={scrub !== null} phase={phase} />
          <PhaseCaption />
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
          {compare ? (
            <>
              <RigFigure joints={compare.joints} body={compare.body} repSeconds={tempo} paused={scrub !== null} phase={phase} />
              <PhaseCaption />
            </>
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-slate-400">
              <div className="text-xl">Pick a second pose to compare side by side.</div>
              <div className="flex flex-wrap justify-center gap-2">
                {RIG_DEF_LIST.filter((d) => d.id !== defId).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setCompareId(d.id)}
                    className="min-h-[48px] rounded-xl bg-slate-800 px-4 text-lg font-bold text-white"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {compare && (
            <button onClick={() => setCompareId(null)} className="mt-2 min-h-[48px] rounded-xl px-4 text-lg font-bold text-slate-300 hover:bg-slate-800">
              Clear comparison ({compare.label})
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-2 text-lg font-bold uppercase tracking-wider text-slate-400">Tempo: {tempo.toFixed(1)}s / rep</div>
          <input
            type="range" min={1} max={6} step={0.1} value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-full" aria-label="Rep tempo seconds"
          />
          <div className="mb-2 mt-4 text-lg font-bold uppercase tracking-wider text-slate-400">
            Scrub: {scrub === null ? "playing" : `${Math.round(scrub * 100)}%`}
          </div>
          <input
            type="range" min={0} max={100} step={1} value={scrub === null ? 0 : scrub * 100}
            onChange={(e) => setScrub(Number(e.target.value) / 100)}
            className="w-full" aria-label="Scrub rep phase"
          />
          <button
            onClick={() => setScrub((s) => (s === null ? 0 : null))}
            className="mt-2 min-h-[48px] rounded-xl bg-slate-700 px-4 text-lg font-bold"
          >
            {scrub === null ? "Freeze + scrub" : "Resume motion"}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-2 text-lg font-bold uppercase tracking-wider text-slate-400">Joints — {def.label}</div>
          <table className="w-full text-left text-lg">
            <thead className="text-slate-400">
              <tr><th>Joint</th><th>Pivot</th><th>Rest → Full</th><th>Now</th></tr>
            </thead>
            <tbody>
              {def.joints.map((j) => (
                <tr key={j.id} className="border-t border-slate-800">
                  <td className="py-1 font-bold">{j.id}</td>
                  <td className="tabular-nums text-slate-300">({j.pivot[0]}, {j.pivot[1]})</td>
                  <td className="tabular-nums text-slate-300">{j.from}° → {j.to}°</td>
                  <td className="tabular-nums text-sky-300">
                    {phase === null ? "—" : `${Math.round(angleAt(def, j.id, phase) ?? 0)}°`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-2 text-lg font-bold uppercase tracking-wider text-slate-400">Critique checklist</div>
          <ul className="list-disc space-y-1 pl-5 text-lg text-slate-200">
            {def.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
