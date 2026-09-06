"use client";

import { useEffect } from "react";
import { getExerciseInfo } from "@/lib/exercise-catalog";
import type { Exercise } from "@/lib/workout";

/* Form reference modal: vendored public-domain start/end photos
 * (free-exercise-db) + reference steps + workout cues.
 * Opening it pauses the workout — a running clock while you study
 * form is hostile. Closing leaves you paused; Resume is one tap away.
 */
export function FormModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const info = getExerciseInfo(exercise.id);
  const variant =
    info.variants[exercise.variantId] ?? info.variants[info.defaultVariant];
  const steps = variant?.dbSteps ?? [];
  const images = variant?.formImages;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${exercise.name} form guide`}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-[#0a1120] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-sky-300">Form guide</div>
            <h2 className="text-3xl font-extrabold">{exercise.name}</h2>
          </div>
          <button
            onClick={onClose}
            autoFocus
            aria-label="Close form guide"
            className="min-h-[56px] min-w-[56px] rounded-2xl bg-slate-700 text-2xl font-bold hover:bg-slate-600"
          >
            ✕
          </button>
        </div>

        {images ? (
          <div className="mt-4 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            {[
              { src: images.start, label: "Start" },
              { src: images.end, label: "End" },
            ].map((p) => (
              <figure key={p.label} className="min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={`${exercise.name} ${p.label.toLowerCase()} position`}
                  className="h-auto w-full rounded-2xl border border-slate-800"
                  loading="lazy"
                />
                <figcaption className="mt-1 text-center text-lg font-bold text-slate-300">
                  {p.label}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-800/60 p-4 text-xl text-slate-300">
            Reference photos coming soon — follow the cues below for now.
          </p>
        )}

        {steps.length > 0 && (
          <div className="mt-4">
            <div className="mb-1 text-lg font-bold uppercase tracking-wider text-slate-400">Reference</div>
            <ol className="list-decimal space-y-1 pl-6 text-xl text-slate-200">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-4">
          <div className="mb-1 text-lg font-bold uppercase tracking-wider text-slate-400">Your cues</div>
          <ul className="list-disc space-y-1 pl-6 text-xl text-slate-200">
            {exercise.cues.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-base text-slate-500">
          Photos: public-domain reference (free-exercise-db). Workout stays paused — tap Resume when ready.
        </p>
      </div>
    </div>
  );
}
