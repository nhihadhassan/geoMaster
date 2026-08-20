// localStorage persistence for an in-progress quiz, so a reload can offer to
// resume it. Extracted from gameStore.ts unchanged.
import { getCountriesForRegion, type QuizRegion } from "@/data/countries";
import type { CountryResult, GameMode } from "@/store/gameTypes";

const QUIZ_PROGRESS_KEY = "geomaster-quiz-progress";
export const QUIZ_PROGRESS_VERSION = 2;

export type QuizProgressSnapshot = {
  v: number;
  region: QuizRegion;
  mode: GameMode;
  status: "running" | "paused";
  guessedCountryIds: string[];
  countryResults: Record<string, CountryResult>;
  incorrectAttempts: Record<string, number>;
  score: number;
  total: number;
  remainingSeconds: number;
  targetQueue: string[];
  currentTargetIso: string | null;
  /** Present when the run used an explicit roster (focused practice, daily
   *  challenge) rather than the region's full country list. */
  customCountryIds?: string[];
  customLabel?: string;
  savedAt: number;
};

export const writeQuizProgress = (snapshot: QuizProgressSnapshot) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable (private mode, quota). The quiz keeps
    // running; it just won't survive a reload.
  }
};

export const clearQuizProgress = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
  } catch {
    // Same storage caveat as writeQuizProgress.
  }
};

export const readQuizProgress = (): QuizProgressSnapshot | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(QUIZ_PROGRESS_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as QuizProgressSnapshot;

    if (
      !parsed ||
      parsed.v !== QUIZ_PROGRESS_VERSION ||
      (parsed.status !== "running" && parsed.status !== "paused") ||
      (!parsed.customCountryIds?.length &&
        getCountriesForRegion(parsed.region).length === 0)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};
