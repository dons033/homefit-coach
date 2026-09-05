/* Simple programmatic audio cues via Web Audio API. No audio files. */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Must be called from a user gesture (Start Workout) to unlock audio. */
export function unlockAudio() {
  ensureCtx();
}

function tone(freq: number, seconds: number, type: OscillatorType = "sine", gain = 0.25, when = 0) {
  const ac = ensureCtx();
  if (!ac) return;
  const t = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t);
  osc.stop(t + seconds + 0.05);
}

export const sounds = {
  /** short countdown beep (3,2,1) */
  beep() {
    tone(880, 0.18, "square", 0.12);
  },
  /** louder start tone */
  start() {
    tone(660, 0.35, "square", 0.2);
    tone(990, 0.45, "square", 0.18, 0.12);
  },
  /** end-of-set bell */
  setComplete() {
    tone(740, 0.5, "triangle", 0.28);
    tone(1108, 0.6, "triangle", 0.22, 0.08);
  },
  /** halfway marker during a work set — distinct from countdown beeps */
  halfway() {
    tone(587, 0.22, "triangle", 0.22);
    tone(587, 0.22, "triangle", 0.22, 0.28);
  },
  /** 10-second warning during rest */
  warn() {
    tone(520, 0.3, "square", 0.14);
    tone(520, 0.3, "square", 0.14, 0.35);
  },
  /** workout complete fanfare */
  complete() {
    tone(523, 0.25, "triangle", 0.25);
    tone(659, 0.25, "triangle", 0.25, 0.22);
    tone(784, 0.25, "triangle", 0.25, 0.44);
    tone(1046, 0.7, "triangle", 0.28, 0.66);
  },
};
