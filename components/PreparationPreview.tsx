import type { Workout } from "@/lib/workout";
export function PreparationPreview({ workout }: { workout: Workout }) {
  return (
    <div className="my-5 grid gap-4 sm:grid-cols-2">
      {(
        [
          ["warmup", "Warm-up"],
          ["cooldown", "Cool-down"],
        ] as const
      ).map(([key, label]) => {
        const stages = workout[key];
        if (!stages?.length) return null;
        return (
          <section
            key={key}
            className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5"
          >
            <h2 className="text-xl font-bold">
              {`${stages.reduce((n, e) => n + e.workSeconds, 0) / 60}-minute guided ${label.toLowerCase()}`}
            </h2>
            <p className="my-2 text-sm text-slate-300">
              Continuous guidance. No weights or rep targets.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-slate-300">
              {stages.map((e) => (
                <li key={e.id}>
                  {e.name} · {e.workSeconds}s
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
