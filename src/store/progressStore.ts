"use client";

// Local-first mastery tracking. Deliberately separate from gameStore: the quiz
// engine stays unaware of it, and turning features.progressTracking off means
// nothing here is ever read or written.
import { create } from "zustand";
import { features } from "@/config/features";
import type { QuizRegion } from "@/data/countries";
import {
  emptyProgress,
  getMasteredCount,
  getRegionMastery,
  getWeakestCountryIds,
  type CountryProgress,
  type ProgressMap,
} from "@/utils/countryMastery";

const PROGRESS_KEY = "geomaster-progress-v1";
const PROGRESS_VERSION = 1;

type StoredProgress = {
  v: number;
  countries: ProgressMap;
  lastPlayedAt: number;
  runsCompleted: number;
};

export type QuizOutcomeEntry = {
  iso: string;
  status: "correct" | "assisted" | "missed";
};

const emptyStore = (): StoredProgress => ({
  v: PROGRESS_VERSION,
  countries: {},
  lastPlayedAt: 0,
  runsCompleted: 0,
});

export const readStoredProgress = (): StoredProgress => {
  if (typeof window === "undefined" || !features.progressTracking) {
    return emptyStore();
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);

    if (!raw) {
      return emptyStore();
    }

    const parsed = JSON.parse(raw) as StoredProgress;

    if (!parsed || parsed.v !== PROGRESS_VERSION || !parsed.countries) {
      return emptyStore();
    }

    return parsed;
  } catch {
    return emptyStore();
  }
};

const writeStoredProgress = (stored: StoredProgress) => {
  if (typeof window === "undefined" || !features.progressTracking) {
    return;
  }

  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(stored));
  } catch {
    // Storage can be unavailable (private mode, quota). Progress is a bonus,
    // never a prerequisite for playing.
  }
};

type ProgressState = StoredProgress & {
  /** True once the browser value has been read, so SSR and the first client
   *  render agree and no hydration mismatch is possible. */
  hydrated: boolean;
  hydrate: () => void;
  recordRun: (entries: QuizOutcomeEntry[]) => void;
  resetProgress: () => void;
};

const applyEntry = (
  progressMap: ProgressMap,
  entry: QuizOutcomeEntry,
  now: number,
): ProgressMap => {
  const previous = progressMap[entry.iso] ?? emptyProgress();

  return {
    ...progressMap,
    [entry.iso]: {
      ...previous,
      correct: previous.correct + (entry.status === "correct" ? 1 : 0),
      assisted: previous.assisted + (entry.status === "assisted" ? 1 : 0),
      missed: previous.missed + (entry.status === "missed" ? 1 : 0),
      lastSeenAt: now,
      lastResult: entry.status,
    } satisfies CountryProgress,
  };
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...emptyStore(),
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return;
    }

    set({ ...readStoredProgress(), hydrated: true });
  },
  recordRun: (entries) => {
    if (!features.progressTracking || entries.length === 0) {
      return;
    }

    const now = Date.now();
    const state = get();
    const countries = entries.reduce(
      (progressMap, entry) => applyEntry(progressMap, entry, now),
      state.countries,
    );
    const next: StoredProgress = {
      v: PROGRESS_VERSION,
      countries,
      lastPlayedAt: now,
      runsCompleted: state.runsCompleted + 1,
    };

    writeStoredProgress(next);
    set(next);
  },
  resetProgress: () => {
    const next = emptyStore();

    writeStoredProgress(next);
    set({ ...next, hydrated: true });
  },
}));

// Convenience selectors so components do not re-implement the derivations.
export const selectMasteredCount = (state: ProgressState) =>
  getMasteredCount(state.countries);

export const selectHasProgress = (state: ProgressState) =>
  state.hydrated && Object.keys(state.countries).length > 0;

export const selectRegionMastery =
  (region: QuizRegion) => (state: ProgressState) =>
    getRegionMastery(state.countries, region);

export const selectWeakestCountryIds =
  (options?: { region?: QuizRegion; limit?: number }) =>
  (state: ProgressState) =>
    getWeakestCountryIds(state.countries, options);
