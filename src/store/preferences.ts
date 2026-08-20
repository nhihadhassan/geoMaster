// Small localStorage-backed preference helpers for the game store.
// Extracted from gameStore.ts unchanged; every reader is SSR-safe and every
// writer tolerates storage being unavailable.
const AUTO_HIDE_CORRECT_CARD_KEY = "geomaster-auto-hide-correct-card";
const SOUND_EFFECTS_ENABLED_KEY = "geomaster-sound-effects-enabled";
const TIMER_MULTIPLIER_KEY = "geomaster-timer-multiplier";

export const readInitialAutoHideCorrectCard = () => {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(AUTO_HIDE_CORRECT_CARD_KEY) !== "false";
};

export const persistAutoHideCorrectCard = (enabled: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTO_HIDE_CORRECT_CARD_KEY, String(enabled));
};

export const readInitialSoundEffectsEnabled = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SOUND_EFFECTS_ENABLED_KEY) === "true";
};

export const persistSoundEffectsEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SOUND_EFFECTS_ENABLED_KEY, String(enabled));
};

// Timer multiplier lets players give themselves more time before starting.
// 1 = the region's standard timer; larger values scale it up.
export const TIMER_MULTIPLIER_OPTIONS = [1, 1.5, 2, 3] as const;

export const DEFAULT_TIMER_MULTIPLIER = 1;

export const normalizeTimerMultiplier = (value: number) =>
  (TIMER_MULTIPLIER_OPTIONS as readonly number[]).includes(value)
    ? value
    : DEFAULT_TIMER_MULTIPLIER;

export const readInitialTimerMultiplier = () => {
  if (typeof window === "undefined") {
    return DEFAULT_TIMER_MULTIPLIER;
  }

  return normalizeTimerMultiplier(
    Number(window.localStorage.getItem(TIMER_MULTIPLIER_KEY)),
  );
};

export const persistTimerMultiplier = (multiplier: number) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TIMER_MULTIPLIER_KEY, String(multiplier));
};

// Untimed practice: the clock is hidden and never runs out, so a player can
// work through a region without pressure. Persisted alongside the multiplier.
const TIMER_MODE_KEY = "geomaster-timer-mode";

export type TimerMode = "timed" | "untimed";

export const readInitialTimerMode = (): TimerMode => {
  if (typeof window === "undefined") {
    return "timed";
  }

  return window.localStorage.getItem(TIMER_MODE_KEY) === "untimed"
    ? "untimed"
    : "timed";
};

export const persistTimerMode = (mode: TimerMode) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TIMER_MODE_KEY, mode);
};
