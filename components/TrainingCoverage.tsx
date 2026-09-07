import { FOCUS, rollingCoverage, type ActivityDetails, type TrainingFocus } from "@/lib/training";
import { dateKey, type Session } from "@/lib/coach";
import styles from "./Coach.module.css";

export function ActivityFields({ value, onChange }: { value: ActivityDetails; onChange: (value: ActivityDetails) => void }) {
  return <fieldset className={styles.activityFields}>
    <legend>What did this session involve?</legend>
    <label>Program or source (optional)
      <input list="programs" value={value.program} onChange={e => onChange({ ...value, program: e.target.value })} placeholder="e.g. Caroline Girvan IRON, P90X, local studio" />
      <datalist id="programs">{["Caroline Girvan EPIC", "Caroline Girvan IRON", "Caroline Girvan FUEL", "P90X", "P90X3", "Body Beast", "LIIFT4", "INSANITY", "StrongLifts 5×5", "CrossFit", "Orangetheory", "Peloton", "Apple Fitness+", "Les Mills", "Pilates", "Yoga", "Walking"].map(p => <option key={p} value={p} />)}</datalist>
    </label>
    <p className={styles.muted}>Use the specific class or workout as the session name. Programs mix different sessions; the brand alone does not establish training coverage.</p>
    <p>Select the main areas you actually trained. Leave blank if unsure.</p>
    <div className={styles.focusGrid}>{Object.entries(FOCUS).map(([key, label]) => <label className={styles.check} key={key}>
      <input type="checkbox" checked={value.focus.includes(key as TrainingFocus)} onChange={e => onChange({ ...value, focus: e.target.checked ? [...value.focus, key as TrainingFocus] : value.focus.filter(k => k !== key) })} />{label}
    </label>)}</div>
    <label>Effort (1 easy – 10 maximum, optional)<input type="number" min={1} max={10} value={value.effort ?? ""} onChange={e => onChange({ ...value, effort: e.target.value === "" ? undefined : Number(e.target.value) })} /></label>
    <details><summary>Steps, distance and calories (if available)</summary>
      <p className={styles.muted}>Enter reported values from your tracker. HomeFit does not estimate these.</p>
      {([ ["steps", "Steps"], ["miles", "Distance (miles)"], ["calories", "Calories (kcal)"] ] as const).map(([key,label]) => <label key={key}>{label}<input type="number" min={0} step={key === "miles" ? "0.01" : "1"} value={value[key] ?? ""} onChange={e => onChange({...value, [key]: e.target.value === "" ? undefined : Number(e.target.value)})} /></label>)}
    </details>
  </fieldset>;
}

export function TrainingCoverage({ sessions }: { sessions: Session[] }) {
  const coverage = rollingCoverage(sessions, dateKey(new Date()));
  const missing = Object.entries(coverage.evidence).filter(([, titles]) => !titles.length).map(([key]) => FOCUS[key as TrainingFocus]);
  return <section className={styles.coverage} aria-label="Rolling seven-day coverage">
    <span className={styles.tag}>YOUR LAST 7 DAYS · {coverage.from} – {coverage.through}</span>
    <h2>What has your week covered?</h2>
    <p>{coverage.recent.length} recorded sessions (including saved partial workouts). Guided workouts use their exercise list; outside activities use your focus tags.</p>
    <div className={styles.focusGrid}>{Object.entries(coverage.evidence).map(([key, titles]) => <details key={key} className={styles.coverageItem}>
      <summary>{FOCUS[key as TrainingFocus]} <strong>{titles.length ? `${titles.length} session${titles.length === 1 ? "" : "s"}` : "Not recorded"}</strong></summary>
      {titles.length ? <ul>{titles.map((title,i) => <li key={i}>{title}</li>)}</ul> : <p>No tagged exposure in this window.</p>}
    </details>)}</div>
    <p><strong>Areas to review: </strong>{!coverage.recent.length ? "Record recent sessions first to build a useful picture." : missing.length ? missing.join(", ") + ". These have no recorded exposure; check your log before planning more." : "All listed areas have some recorded exposure. More exercise is not automatically needed."}</p>
    {!!coverage.unknown.length && <p>{coverage.unknown.length} session(s) have unknown coverage: {coverage.unknown.join(", ")}. Add activity details below where available.</p>}
    <p className={styles.muted}>This is a coverage summary, not a volume target or recovery assessment. A session count does not establish sufficient training. Partial guided sessions cannot yet be allocated by exercise. Soreness and goal-specific recommendations are planned.</p>
  </section>;
}
