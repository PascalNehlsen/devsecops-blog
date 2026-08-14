/**
 * Pipeline Defender: fully synthesised sound. No asset files, so the
 * no-third-party gate never sees a resource; the AudioContext is created
 * lazily on the first play() after a user gesture (the game only opens via
 * keypress or button, so autoplay policy is satisfied).
 */

export type SoundName =
  | 'shoot'
  | 'kill'
  | 'wrongTool'
  | 'leak'
  | 'waveEnd'
  | 'gameOver';

const MUTE_KEY = 'game.muted';

interface Note {
  type: OscillatorType;
  from: number;
  to: number;
  ms: number;
  atMs?: number;
  gain?: number;
}

/* Every sound is one or more oscillator sweeps with an exponential decay:
   enough for an arcade voice, ~zero bytes. */
const SOUNDS: Record<SoundName, Note[]> = {
  shoot: [{ type: 'square', from: 880, to: 340, ms: 70, gain: 0.06 }],
  kill: [
    { type: 'triangle', from: 440, to: 880, ms: 90, gain: 0.1 },
    { type: 'triangle', from: 660, to: 1320, ms: 90, atMs: 60, gain: 0.08 },
  ],
  wrongTool: [{ type: 'sawtooth', from: 160, to: 110, ms: 160, gain: 0.08 }],
  leak: [{ type: 'square', from: 320, to: 70, ms: 350, gain: 0.1 }],
  waveEnd: [
    { type: 'triangle', from: 523, to: 523, ms: 90, gain: 0.09 },
    { type: 'triangle', from: 659, to: 659, ms: 90, atMs: 90, gain: 0.09 },
    { type: 'triangle', from: 784, to: 784, ms: 140, atMs: 180, gain: 0.09 },
  ],
  gameOver: [
    { type: 'sawtooth', from: 392, to: 392, ms: 160, gain: 0.08 },
    { type: 'sawtooth', from: 330, to: 330, ms: 160, atMs: 170, gain: 0.08 },
    { type: 'sawtooth', from: 262, to: 196, ms: 420, atMs: 340, gain: 0.08 },
  ],
};

export interface GameAudio {
  play(name: SoundName): void;
  muted(): boolean;
  toggleMuted(): boolean;
}

export function createAudio(): GameAudio {
  let context: AudioContext | null = null;
  let isMuted = false;
  try {
    isMuted = window.localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    /* Private mode: default to sound on. */
  }

  function ensureContext(): AudioContext | null {
    if (context) {
      return context;
    }
    if (typeof window === 'undefined' || !('AudioContext' in window)) {
      return null;
    }
    context = new AudioContext();
    return context;
  }

  return {
    play(name) {
      if (isMuted) {
        return;
      }
      const ctx = ensureContext();
      if (!ctx) {
        return;
      }
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const now = ctx.currentTime;
      for (const note of SOUNDS[name]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (note.atMs ?? 0) / 1000;
        const end = start + note.ms / 1000;
        osc.type = note.type;
        osc.frequency.setValueAtTime(note.from, start);
        if (note.to !== note.from) {
          osc.frequency.exponentialRampToValueAtTime(note.to, end);
        }
        gain.gain.setValueAtTime(note.gain ?? 0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(end);
      }
    },

    muted() {
      return isMuted;
    },

    toggleMuted() {
      isMuted = !isMuted;
      try {
        window.localStorage.setItem(MUTE_KEY, String(isMuted));
      } catch {
        /* Not persisted, still effective for this session. */
      }
      return isMuted;
    },
  };
}
