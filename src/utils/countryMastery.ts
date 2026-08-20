// Derives mastery from raw per-country counters. Everything here is a pure
// function over the stored record, so nothing extra needs persisting and the
// rules can change later without a storage migration.
import {
  countries,
  getCountriesForRegion,
  type QuizRegion,
} from "@/data/countries";

export type CountryProgress = {
  correct: number;
  assisted: number;
  missed: number;
  lastSeenAt: number;
  lastResult: "correct" | "assisted" | "missed";
};

export type ProgressMap = Record<string, CountryProgress>;

export type MasteryLevel = "unseen" | "learning" | "shaky" | "mastered";

export const emptyProgress = (): CountryProgress => ({
  correct: 0,
  assisted: 0,
  missed: 0,
  lastSeenAt: 0,
  lastResult: "missed",
});

/**
 * Mastered: answered unaided at least twice and not missed recently.
 * Shaky: missed more often than it was answered cleanly.
 * Learning: everything else that has been seen at least once.
 */
export const getMasteryLevel = (
  progress: CountryProgress | undefined,
): MasteryLevel => {
  if (!progress) {
    return "unseen";
  }

  const attempts = progress.correct + progress.assisted + progress.missed;

  if (attempts === 0) {
    return "unseen";
  }

  if (progress.correct >= 2 && progress.lastResult === "correct") {
    return "mastered";
  }

  if (progress.missed >= progress.correct && progress.missed > 0) {
    return "shaky";
  }

  return "learning";
};

export const getMasteredCount = (progressMap: ProgressMap) =>
  Object.values(progressMap).filter(
    (progress) => getMasteryLevel(progress) === "mastered",
  ).length;

export const getRegionMastery = (
  progressMap: ProgressMap,
  region: QuizRegion,
) => {
  const regionCountries = getCountriesForRegion(region);

  if (regionCountries.length === 0) {
    return { mastered: 0, total: 0, ratio: 0 };
  }

  const mastered = regionCountries.filter(
    (country) => getMasteryLevel(progressMap[country.iso_a3]) === "mastered",
  ).length;

  return {
    mastered,
    total: regionCountries.length,
    ratio: mastered / regionCountries.length,
  };
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Ranks countries the player struggles with. A miss weighs more than a hinted
 * answer, clean answers pay the score down, and a country untouched for a long
 * time drifts back up so practice does not fixate on the same handful.
 */
const getWeaknessScore = (progress: CountryProgress, now: number) => {
  const base = progress.missed * 3 + progress.assisted * 1.5 - progress.correct;

  if (base <= 0) {
    return 0;
  }

  const weeksSinceSeen = Math.min(
    (now - progress.lastSeenAt) / WEEK_MS,
    4,
  );

  return base + weeksSinceSeen * 0.5;
};

export const getWeakestCountryIds = (
  progressMap: ProgressMap,
  {
    region,
    limit = 12,
    now = Date.now(),
  }: { region?: QuizRegion; limit?: number; now?: number } = {},
) => {
  const scope =
    region && region !== "world" ? getCountriesForRegion(region) : countries;
  const scopeIds = new Set(scope.map((country) => country.iso_a3));

  return Object.entries(progressMap)
    .filter(([iso]) => scopeIds.has(iso))
    .map(([iso, progress]) => ({
      iso,
      score: getWeaknessScore(progress, now),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.iso);
};
