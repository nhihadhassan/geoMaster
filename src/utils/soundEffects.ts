"use client";

export type GeoSoundEvent =
  | "quiz-start"
  | "correct"
  | "assisted"
  | "wrong"
  | "missed"
  | "quiz-complete"
  | "perfect"
  | "give-up";

type PlayOptions = {
  volume?: number;
  signal?: AbortSignal;
};

type ToneOptions = {
  frequency: number;
  endFrequency?: number;
  start: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
};

const BASE_VOLUME = 0.18;
const MIN_SOUND_GAP_MS = 55;

let audioContext: AudioContext | null = null;
let userInteracted = false;
let lastSoundAt = 0;

const getAudioContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (audioContext) {
    return audioContext;
  }

  const AudioContextConstructor =
    window.AudioContext ??
    (
      window as Window &
        typeof globalThis & {
          webkitAudioContext?: typeof AudioContext;
        }
    ).webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  audioContext = new AudioContextConstructor();

  return audioContext;
};

export const unlockGeoAudio = () => {
  userInteracted = true;

  try {
    const context = getAudioContext();

    if (context?.state === "suspended") {
      void context.resume();
    }
  } catch {
    // Sound is optional. Browsers can reject audio setup without breaking play.
  }
};

const playTone = (
  context: AudioContext,
  output: AudioNode,
  { frequency, endFrequency, start, duration, volume, type = "sine" }: ToneOptions,
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const stopAt = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  if (endFrequency && endFrequency !== frequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, endFrequency),
      stopAt,
    );
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + Math.min(0.035, duration * 0.28));
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(start);
  oscillator.stop(stopAt + 0.02);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
};

const scheduleSound = (
  context: AudioContext,
  event: GeoSoundEvent,
  volume: number,
) => {
  const now = context.currentTime;
  const masterGain = context.createGain();

  masterGain.gain.value = volume;
  masterGain.connect(context.destination);

  const tone = (options: Omit<ToneOptions, "volume"> & { volume?: number }) =>
    playTone(context, masterGain, {
      ...options,
      volume: options.volume ?? 1,
    });

  switch (event) {
    case "quiz-start":
      tone({ frequency: 392, endFrequency: 523, start: now, duration: 0.18, type: "sine" });
      break;
    case "correct":
      tone({ frequency: 659, start: now, duration: 0.13, type: "sine" });
      tone({ frequency: 880, start: now + 0.075, duration: 0.16, type: "sine", volume: 0.78 });
      break;
    case "assisted":
      tone({ frequency: 440, start: now, duration: 0.14, type: "triangle", volume: 0.78 });
      tone({ frequency: 659, start: now + 0.08, duration: 0.16, type: "sine", volume: 0.58 });
      break;
    case "wrong":
      tone({ frequency: 164, endFrequency: 128, start: now, duration: 0.1, type: "triangle", volume: 0.68 });
      break;
    case "missed":
      tone({ frequency: 330, endFrequency: 196, start: now, duration: 0.24, type: "triangle", volume: 0.72 });
      break;
    case "quiz-complete":
      tone({ frequency: 392, start: now, duration: 0.22, type: "sine", volume: 0.58 });
      tone({ frequency: 523, start: now + 0.06, duration: 0.28, type: "sine", volume: 0.62 });
      tone({ frequency: 659, start: now + 0.12, duration: 0.34, type: "sine", volume: 0.54 });
      break;
    case "perfect":
      tone({ frequency: 523, start: now, duration: 0.14, type: "sine", volume: 0.64 });
      tone({ frequency: 659, start: now + 0.08, duration: 0.16, type: "sine", volume: 0.62 });
      tone({ frequency: 784, start: now + 0.16, duration: 0.2, type: "sine", volume: 0.58 });
      tone({ frequency: 1046, start: now + 0.26, duration: 0.26, type: "sine", volume: 0.44 });
      break;
    case "give-up":
      tone({ frequency: 294, endFrequency: 220, start: now, duration: 0.2, type: "triangle", volume: 0.54 });
      break;
  }

  window.setTimeout(() => {
    masterGain.disconnect();
  }, 1200);
};

export const playGeoSound = (
  event: GeoSoundEvent,
  { volume = BASE_VOLUME, signal }: PlayOptions = {},
) => {
  if (typeof window === "undefined" || !userInteracted || signal?.aborted) {
    return;
  }

  const timestamp = performance.now();

  if (timestamp - lastSoundAt < MIN_SOUND_GAP_MS) {
    return;
  }

  lastSoundAt = timestamp;

  try {
    const context = getAudioContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      void context.resume();
    }

    scheduleSound(context, event, volume);
  } catch {
    // Feedback audio is deliberately non-critical.
  }
};
