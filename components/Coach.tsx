"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { EXERCISE_CATALOG } from "@/lib/exercise-catalog";
import {
  buildWorkout,
  lowerBodyA,
  repTarget,
  estimateMinutes,
  type WorkoutEntry,
} from "@/lib/workout";
import {
  PURPOSES,
  STORAGE_KEY,
  dateKey,
  shiftDate,
  weekDates,
  initialCoach,
  validateCoach,
  upgradePreparation,
  localCoach,
  type CoachState,
  type Session,
  type Purpose,
  type CoachProposal,
} from "@/lib/coach";
import { ActivityFields, TrainingCoverage } from "./TrainingCoverage";
import { type ActivityDetails } from "@/lib/training";
import { WorkoutSession } from "./WorkoutSession";

import styles from "./Coach.module.css";

export default function Coach() {
  const [state, setState] = useState<CoachState | null>(null);
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState("plan");
  const [notice, setNotice] = useState("");
  const [playing, setPlaying] = useState<Session | null>(null);
  const [form, setForm] = useState<"guided" | "external" | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityDetails>({ program: "", focus: [] });
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [logged, setLogged] = useState(true);
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(
    "A little flexibility goes a long way. I can help move a planned session to tomorrow.",
  );
  const [proposal, setProposal] = useState<CoachProposal | null>(null);
  useEffect(() => {
    const today = dateKey(new Date());
    setSelected(today);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!validateCoach(parsed)) throw new Error();
        setState(upgradePreparation(parsed));
      } else setState(initialCoach(today));
    } catch {
      setNotice(
        "Saved plan could not be loaded. Changes will only be saved when you edit the plan.",
      );
      setState(initialCoach(today));
    }
  }, []);
  useEffect(() => {
    if (!form) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setForm(null);
      if (event.key !== "Tab" || !dialog) return;
      const nodes = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, textarea, summary, [tabindex="0"]',
        ),
      );
      const visibleNodes = nodes.filter(node => node.getClientRects().length > 0);
      const first = visibleNodes[0],
        last = visibleNodes[visibleNodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [form]);
  function commit(next: CoachState) {
    setState(next);
    setProposal(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotice("Saved on this device");
    } catch {
      setNotice(
        "Storage unavailable. These changes will be lost when you close this page.",
      );
    }
  }
  if (!state) return <main className={styles.shell}>Loading your coach…</main>;
  const current = state;
  function patchSession(id: string, patch: Partial<Session>) {
    commit({
      ...current,
      sessions: current.sessions.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    });
  }
  function openForm(kind: "guided" | "external") {
    setForm(kind);
    setEditing(null);
    setActivity({ program: "", focus: [] });
    setTitle("");
    setNotes("");
    setEntries([]);
    setMinutes(30);
    setLogged(kind === "external");
  }
  function saveSession() {
    if (!title.trim() || (form === "guided" && !entries.length)) return;
    const id = editing ?? crypto.randomUUID();
    const focus = current.purpose === "glp-1" ? "lean" : current.purpose;
    const workout =
      form === "guided"
        ? buildWorkout(
            id,
            title.trim(),
            "Your custom session",
            focus,
            entries.map((e) =>
              ["one-arm-row", "bulgarian-split-squat"].includes(e.exerciseId)
                ? {
                    ...e,
                    sides: Array.from({ length: e.sets }, (_, i) =>
                      e.exerciseId === "bulgarian-split-squat"
                        ? i % 2 === 0
                          ? "LEFT LEG"
                          : "RIGHT LEG"
                        : i % 2 === 0
                          ? "Left"
                          : "Right",
                    ),
                  }
                : e,
            ),
          )
        : undefined;
    const session: Session = {
      id,
      date: selected,
      title: title.trim(),
      kind: form!,
      purpose: current.purpose,
      minutes: workout ? Math.max(1, estimateMinutes(workout)) : minutes,
      notes: notes.trim(),
      completed: form === "external" && logged,
      workout,
      ...(form === "external" ? { activity } : {}),
    };
    commit({ ...current, sessions: editing ? current.sessions.map(s => s.id === editing ? { ...s, ...session, purpose: s.purpose } : s) : [...current.sessions, session] });
    setForm(null);
    setTab("plan");
  }
  async function ask(text: string) {
    setMessage("");
    const result = await localCoach.propose(text, {
      date: selected,
      sessions: current.sessions,
    });
    setReply(result.message);
    setProposal(result.proposal ?? null);
  }
  if (playing)
    return (
      <WorkoutSession
        key={playing.id}
        workout={playing.workout!}
        onClose={() => setPlaying(null)}
        onSave={(result) => {
          patchSession(playing.id, {
            ...result,
          });
          setPlaying(null);
        }}
      />
    );
  const dates = weekDates(selected);
  const week = current.sessions.filter((s) => dates.includes(s.date));
  const sessions = current.sessions.filter((s) => s.date === selected);
  const catalog = Object.values(EXERCISE_CATALOG).filter((e) =>
    `${e.name} ${e.muscles.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logo}>h</span> homefit
          <span className={styles.brandLight}> / coach</span>
        </Link>
        <span className={styles.storage}>
          {notice || "Your plan, saved on this device"}
        </span>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.eyebrow}>YOUR WORKSPACE</p>
          <nav>
            {[
              ["plan", "▦", "My week"],
              ["library", "◇", "Exercise library"],
              ["connections", "⌁", "Connections"],
            ].map(([id, icon, label]) => (
              <button
                key={id}
                aria-current={tab === id ? "page" : undefined}
                className={tab === id ? styles.active : ""}
                onClick={() => setTab(id)}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </nav>
          <div className={styles.sideNote}>
            <span className={styles.dot} /> BUILT AROUND YOU
            <p>
              Make room for real life.
              <br />
              Every kind of movement counts.
            </p>
          </div>
          <Link href="/workout" className={styles.legacy}>
            Original workout player ↗
          </Link>
        </aside>
        <main className={styles.main}>
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>A PLAN THAT MOVES WITH YOU</p>
              <h1>
                {tab === "plan"
                  ? "Your week. Your pace."
                  : tab === "library"
                    ? "Build once. Move often."
                    : "A more connected picture."}
              </h1>
              <p className={styles.muted}>
                {tab === "plan"
                  ? "Strength days, studio classes, and everything in between."
                  : tab === "library"
                    ? "Reusable movements. Different days. Your own programming."
                    : "A foundation for your future fitness and health integrations."}
              </p>
            </div>
            <button
              className={styles.primary}
              onClick={() => openForm("external")}
            >
              + Record activity
            </button>
          </div>
          <section className={styles.purpose}>
            <div>
              <span className={styles.eyebrow}>TRAINING PURPOSE</span>
              <p>What are you working toward?</p>
            </div>
            <label>
              <span className={styles.srOnly}>Training purpose</span>
              <select
                value={current.purpose}
                onChange={(e) =>
                  commit({ ...current, purpose: e.target.value as Purpose })
                }
              >
                {Object.entries(PURPOSES).map(([id, label]) => (
                  <option value={id} key={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <small>
              Used for new sessions. Set your own reps and pace below.
            </small>
          </section>
          {tab === "plan" && <TrainingCoverage sessions={current.sessions} />}
          {(tab === "plan" || tab === "library") && (
            <section
              className={styles.session}
              aria-label="Lower Body A workout template"
            >
              <span className={styles.tag}>NEW · READY-TO-USE WORKOUT</span>
              <h2 className="mt-3 text-2xl font-bold">LOWER BODY A</h2>
              <p className={styles.muted}>
                Foundational lower-body strength · ~37 minutes · 18 working sets
              </p>
              <p className={styles.notes}>
                A guided 3-minute warm-up, six exercises, an optional wall sit,
                and a 3-minute cool-down. Dumbbells, bench/chair, and mat.
              </p>
              <div className={styles.sessionActions}>
                <button
                  className={styles.primary}
                  onClick={() => {
                    const workout = structuredClone(lowerBodyA);
                    commit({
                      ...current,
                      sessions: [
                        ...current.sessions,
                        {
                          id: crypto.randomUUID(),
                          date: selected,
                          title: workout.name,
                          kind: "guided",
                          purpose: "strength",
                          minutes: estimateMinutes(workout),
                          notes: workout.purpose ?? "",
                          completed: false,
                          workout,
                        },
                      ],
                    });
                    setTab("plan");
                  }}
                >
                  Add Lower Body A to selected day
                </button>
                <Link
                  href="/workout?id=lower-body-a"
                  className="px-3 text-sm text-green-200"
                >
                  Preview workout →
                </Link>
              </div>
            </section>
          )}
          {tab === "plan" && (
            <>
              <div className={styles.weekHeading}>
                <h2>
                  {new Date(`${dates[0]}T12:00:00`).toLocaleDateString(
                    undefined,
                    { month: "long", day: "numeric" },
                  )}{" "}
                  –{" "}
                  {new Date(`${dates[6]}T12:00:00`).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </h2>
                <div>
                  <button
                    aria-label="Previous week"
                    onClick={() => setSelected(shiftDate(selected, -7))}
                  >
                    ←
                  </button>
                  <button onClick={() => setSelected(dateKey(new Date()))}>
                    Today
                  </button>
                  <button
                    aria-label="Next week"
                    onClick={() => setSelected(shiftDate(selected, 7))}
                  >
                    →
                  </button>
                </div>
              </div>
              <div className={styles.week}>
                {dates.map((date) => {
                  const daily = current.sessions.filter((s) => s.date === date);
                  return (
                    <button
                      key={date}
                      aria-pressed={selected === date}
                      className={selected === date ? styles.selectedDay : ""}
                      onClick={() => {
                        setSelected(date);
                        setProposal(null);
                      }}
                    >
                      <span>
                        {new Date(`${date}T12:00:00`).toLocaleDateString(
                          undefined,
                          { weekday: "short" },
                        )}
                      </span>
                      <strong>{Number(date.slice(-2))}</strong>
                      <small>
                        {daily.length
                          ? `${daily.length} session${daily.length > 1 ? "s" : ""}`
                          : "Open day"}
                      </small>
                      <span className={styles.dayDot}>
                        {daily.length ? "•" : "·"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className={styles.columns}>
                <section>
                  <div className={styles.sectionHeading}>
                    <h2>
                      {new Date(`${selected}T12:00:00`).toLocaleDateString(
                        undefined,
                        { weekday: "long" },
                      )}
                      &apos;s plan
                    </h2>
                    <button onClick={() => openForm("guided")}>
                      + Build workout
                    </button>
                  </div>
                  {sessions.length === 0 && (
                    <div className={styles.empty}>
                      <h3>A little breathing room.</h3>
                      <p>
                        Add a workout, record some movement, or leave today
                        open.
                      </p>
                      <button onClick={() => openForm("guided")}>
                        Build a workout →
                      </button>
                    </div>
                  )}
                  {sessions.map((session) => (
                    <article key={session.id} className={styles.session}>
                      <div className={styles.sessionTop}>
                        <span className={styles.tag}>
                          {session.kind === "guided"
                            ? "FOLLOW ALONG"
                            : "OUTSIDE THE APP"}
                        </span>
                        <button
                          onClick={() =>
                            patchSession(session.id, {
                              completed: !session.completed,
                            })
                          }
                          aria-label={`${session.completed ? "Mark planned" : "Mark complete"}: ${session.title}`}
                          className={session.completed ? styles.complete : ""}
                        >
                          {session.completed ? "✓ Completed" : "○ Planned"}
                        </button>
                      </div>
                      <h3>{session.title}</h3>
                      {session.kind === "external" && <>
                        {session.activity?.program && <p>{session.activity.program}</p>}
                        <button onClick={() => {
                          openForm("external"); setEditing(session.id); setTitle(session.title);
                          setMinutes(session.minutes); setNotes(session.notes); setLogged(session.completed);
                          setActivity(session.activity ?? { program: "", focus: [] });
                        }}>Edit activity details</button>
                      </>}
                      <p className={styles.muted}>
                        {session.minutes} min · {PURPOSES[session.purpose]}
                        {session.workout
                          ? ` · ${session.workout.exercises.filter((e) => !e.optional).length} exercises`
                          : ""}
                      </p>
                      {session.notes && (
                        <p className={styles.notes}>{session.notes}</p>
                      )}
                      {session.workout && (
                        <div className={styles.exerciseChips}>
                          {session.workout.exercises.map((e) => (
                            <span key={e.id}>
                              {e.shortName}{" "}
                              <b>
                                {e.sets} × {repTarget(e)}
                              </b>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className={styles.sessionActions}>
                        {session.workout && (
                          <button
                            className={styles.primary}
                            onClick={() => setPlaying(session)}
                          >
                            ▶ Start session
                          </button>
                        )}
                        <label>
                          Move to{" "}
                          <input
                            type="date"
                            aria-label={`Move ${session.title} to`}
                            value={session.date}
                            onChange={(e) => {
                              if (e.target.value)
                                patchSession(session.id, {
                                  date: e.target.value,
                                });
                            }}
                          />
                        </label>
                        <button
                          onClick={() => {
                            const id = crypto.randomUUID();
                            commit({
                              ...current,
                              sessions: [
                                ...current.sessions,
                                {
                                  ...structuredClone(session),
                                  id,
                                  date: shiftDate(selected, 1),
                                  completed: false,
                                  completedSets: undefined,
                                  completedExercises: undefined,
                                },
                              ],
                            });
                          }}
                        >
                          Copy to tomorrow
                        </button>
                        <button
                          aria-label={`Delete ${session.title}`}
                          onClick={() =>
                            commit({
                              ...current,
                              sessions: current.sessions.filter(
                                (s) => s.id !== session.id,
                              ),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </section>
                <aside>
                  <section className={styles.coach}>
                    <span className={styles.eyebrow}>✦ YOUR COACH</span>
                    <h2>
                      Life happens.
                      <br />
                      Let&apos;s adjust.
                    </h2>
                    <span className={styles.tag}>LOCAL PLANNING ASSISTANT</span>
                    <p aria-live="polite">{reply}</p>
                    <button
                      className={styles.suggestion}
                      onClick={() => void ask("Move my workout to tomorrow")}
                    >
                      Move my workout to tomorrow ↗
                    </button>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void ask(message);
                      }}
                    >
                      <label className={styles.srOnly} htmlFor="coach-message">
                        Message coach
                      </label>
                      <input
                        id="coach-message"
                        placeholder="Ask about your plan…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        maxLength={1000}
                      />
                      <button aria-label="Send message">↑</button>
                    </form>
                    {proposal && (
                      <div className={styles.proposal}>
                        <p>{proposal.summary}</p>
                        <button
                          className={styles.primary}
                          onClick={() =>
                            patchSession(proposal.sessionId, proposal.patch)
                          }
                        >
                          Apply change
                        </button>
                        <button onClick={() => setProposal(null)}>
                          Dismiss
                        </button>
                      </div>
                    )}
                  </section>
                  <section className={styles.summary}>
                    <span className={styles.eyebrow}>THIS WEEK</span>
                    <div>
                      <strong>
                        {week.filter((s) => s.completed).length}
                        <small> / {week.length}</small>
                      </strong>
                      <span>sessions completed</span>
                    </div>
                    <div>
                      <strong>
                        {week
                          .filter((s) => s.completed)
                          .reduce((n, s) => n + s.minutes, 0)}
                        <small> min</small>
                      </strong>
                      <span>movement recorded</span>
                    </div>
                  </section>
                </aside>
              </div>
            </>
          )}
          {tab === "library" && (
            <>
              <div className={styles.sectionHeading}>
                <h2>
                  {Object.keys(EXERCISE_CATALOG).length} reusable exercises
                </h2>
                <button
                  className={styles.primary}
                  onClick={() => openForm("guided")}
                >
                  + Build workout
                </button>
              </div>
              <input
                className={styles.search}
                aria-label="Search exercises"
                placeholder="Search movements or muscles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className={styles.library}>
                {catalog.map((e) => (
                  <article className={styles.session} key={e.id}>
                    <span className={styles.tag}>{e.muscles[0]}</span>
                    <h3>{e.shortName}</h3>
                    <p className={styles.muted}>{e.equipment.join(" + ")}</p>
                    <p>
                      {Object.values(e.variants)
                        .map((v) => v.label)
                        .join(" / ")}
                    </p>
                    <button
                      onClick={() => {
                        openForm("guided");
                        setEntries([
                          {
                            exerciseId: e.id,
                            variantId: e.defaultVariant,
                            sets: EXERCISE_CATALOG[e.id].timed ? 1 : 3,
                            targetReps: EXERCISE_CATALOG[e.id].timed ? 0 : 10,
                            workSeconds: EXERCISE_CATALOG[e.id].timed ? 45 : 40,
                            restSeconds: EXERCISE_CATALOG[e.id].timed ? 0 : 90,
                          },
                        ]);
                      }}
                    >
                      Use in a workout →
                    </button>
                  </article>
                ))}
              </div>
              {!catalog.length && <p>No matching exercises.</p>}
              <p className={styles.muted}>
                More movements can be added to the shared exercise catalog as
                you build out the week.
              </p>
            </>
          )}
          {tab === "connections" && (
            <div className={styles.library}>
              {[
                ["Fitness devices", "Activity, steps, and heart rate"],
                ["Smart scales", "Weight measurements"],
                ["Blood pressure monitors", "Systolic and diastolic readings"],
              ].map(([name, description]) => (
                <article key={name} className={styles.session}>
                  <span className={styles.tag}>PLANNED INTEGRATION</span>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <p className={styles.muted}>
                    Not connected. Device support and account authorization will
                    be added in a future release.
                  </p>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
      {form && (
        <div className={styles.overlay}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={form === "guided" ? "Build workout" : "Record activity"}
            className={styles.dialog}
          >
            <div className={styles.sectionHeading}>
              <h2>
                {form === "guided"
                  ? "Build your workout"
                  : "Every movement counts"}
              </h2>
              <button onClick={() => setForm(null)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <p className={styles.muted}>
              {selected} · {PURPOSES[current.purpose]}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSession();
              }}
            >
              <label>
                Name
                <input
                  autoFocus
                  required
                  maxLength={100}
                  placeholder={
                    form === "guided"
                      ? "e.g. Thursday upper body"
                      : "e.g. P90X, Pilates, walking the dog"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              {form === "external" ? (
                <>
                  <label>
                    Duration (minutes)
                    <input
                      type="number"
                      required
                      min={1}
                      max={1440}
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                    />
                  </label>
                  <ActivityFields value={activity} onChange={setActivity} />
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={logged}
                      onChange={(e) => setLogged(e.target.checked)}
                    />{" "}
                    Already completed
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Add a movement
                    <select
                      value=""
                      onChange={(e) => {
                        const info = EXERCISE_CATALOG[e.target.value];
                        if (info)
                          setEntries([
                            ...entries,
                            {
                              exerciseId: info.id,
                              variantId: info.defaultVariant,
                              kind: info.timed ? "hold" : "reps",
                              sets: info.timed ? 1 : 3,
                              targetReps: info.timed ? 0 : 10,
                              workSeconds: info.timed ? 45 : 40,
                              restSeconds: info.timed ? 0 : 90,
                            },
                          ]);
                      }}
                    >
                      <option value="">Choose from your library…</option>
                      {Object.values(EXERCISE_CATALOG)
                        .filter(
                          (e) => !entries.some((x) => x.exerciseId === e.id),
                        )
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  {entries.map((entry, index) => (
                    <div className={styles.entry} key={entry.exerciseId}>
                      <div className={styles.sectionHeading}>
                        <strong>
                          {EXERCISE_CATALOG[entry.exerciseId].shortName}
                        </strong>
                        <button
                          type="button"
                          onClick={() =>
                            setEntries(entries.filter((_, i) => i !== index))
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <label>
                        Variant
                        <select
                          value={entry.variantId}
                          onChange={(e) =>
                            setEntries(
                              entries.map((x, i) =>
                                i === index
                                  ? { ...x, variantId: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        >
                          {Object.values(
                            EXERCISE_CATALOG[entry.exerciseId].variants,
                          ).map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className={styles.numbers}>
                        {(
                          [
                            ["sets", "Sets", 1, 20],
                            ["targetReps", "Reps", 1, 100],
                            ["workSeconds", "Work (s)", 5, 600],
                            ["restSeconds", "Rest (s)", 5, 600],
                          ] as const
                        )
                          .filter(
                            ([key]) =>
                              !EXERCISE_CATALOG[entry.exerciseId].timed ||
                              key !== "targetReps",
                          )
                          .map(([key, label, min, max]) => (
                            <label key={key}>
                              {label}
                              <input
                                type="number"
                                required
                                min={key === "restSeconds" ? 0 : min}
                                max={max}
                                value={entry[key]}
                                onChange={(e) =>
                                  setEntries(
                                    entries.map((x, i) =>
                                      i === index
                                        ? {
                                            ...x,
                                            [key]: Number(e.target.value),
                                          }
                                        : x,
                                    ),
                                  )
                                }
                              />
                            </label>
                          ))}
                      </div>
                      {["one-arm-row", "bulgarian-split-squat"].includes(
                        entry.exerciseId,
                      ) && (
                        <small>
                          Sets are total sets. Split them between your left and
                          right sides.
                        </small>
                      )}
                    </div>
                  ))}
                </>
              )}
              <label>
                Notes
                <textarea
                  maxLength={2000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How it went, equipment, or a reminder for next time"
                />
              </label>
              <button
                className={styles.primary}
                disabled={form === "guided" && !entries.length}
              >
                Save {form === "guided" ? "workout" : "activity"}
              </button>
            </form>
          </section>
        </div>
      )}
      <div role="status" className={styles.srOnly}>
        {notice}
      </div>
    </div>
  );
}
