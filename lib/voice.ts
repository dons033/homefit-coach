/* Spoken cues via speechSynthesis — eyes-off training.
 * Speaks exercise names and transitions so the user can follow
 * without looking at the screen. No audio files, works offline.
 */

import { isMuted } from "./audio";

let voiceOn = true;
const VOICE_KEY = "homefit-voice-v1";

export function loadVoiceOn(): boolean {
  try {
    const raw = window.localStorage.getItem(VOICE_KEY);
    return raw === null ? true : raw === "1";
  } catch {
    return true;
  }
}

export function saveVoiceOn(on: boolean) {
  voiceOn = on;
  try {
    window.localStorage.setItem(VOICE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (!on) cancelVoice();
}

export function initVoice(on: boolean) {
  voiceOn = on;
}

export function isVoiceOn(): boolean {
  return voiceOn;
}

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function cancelVoice() {
  try {
    synth()?.cancel();
  } catch {
    /* ignore */
  }
}

/** Speak a short cue. Skipped when muted, voice-off, or unsupported. */
export function speak(text: string) {
  if (!voiceOn || isMuted()) return;
  const s = synth();
  if (!s) return;
  try {
    // Cancel any queued cue so announcements never lag behind the timer.
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.volume = 1;
    s.speak(u);
  } catch {
    /* speech unavailable — beeps still work */
  }
}
