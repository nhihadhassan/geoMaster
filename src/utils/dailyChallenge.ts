// A fixed set of countries per calendar day, identical for everyone, so a
// result is comparable between players. Local-only: the streak lives in
// localStorage and there is no leaderboard, account, or network call.
import { countries } from "@/data/countries";

const DAILY_KEY = "geomaster-daily-v1";
const DAILY_COUNT = 12;

export type DailyRecord = {
  /** Last completed day, as YYYY-MM-DD in UTC. */
  lastPlayedDay: string | null;
  streak: number;
  bestStreak: number;
};

export const getDailyKeyForDate = (date = new Date()) =>
  date.toISOString().slice(0, 10);

// Deterministic PRNG so every player gets the same set for a given day.
const hashSeed = (seed: string) => {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;

  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const getDailyCountryIds = (day = getDailyKeyForDate()) => {
  const random = mulberry32(hashSeed(day));
  const pool = countries.map((country) => country.iso_a3);

  // Fisher-Yates with the seeded generator, then take the first N.
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));

    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, DAILY_COUNT);
};

const emptyRecord = (): DailyRecord => ({
  lastPlayedDay: null,
  streak: 0,
  bestStreak: 0,
});

export const readDailyRecord = (): DailyRecord => {
  if (typeof window === "undefined") {
    return emptyRecord();
  }

  try {
    const raw = window.localStorage.getItem(DAILY_KEY);

    if (!raw) {
      return emptyRecord();
    }

    const parsed = JSON.parse(raw) as DailyRecord;

    return parsed?.lastPlayedDay !== undefined ? parsed : emptyRecord();
  } catch {
    return emptyRecord();
  }
};

const yesterdayOf = (day: string) => {
  const date = new Date(`${day}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() - 1);

  return getDailyKeyForDate(date);
};

export const recordDailyCompletion = (
  record: DailyRecord,
  day = getDailyKeyForDate(),
): DailyRecord => {
  if (record.lastPlayedDay === day) {
    return record;
  }

  // Consecutive days extend the streak; any gap starts a new one.
  const streak =
    record.lastPlayedDay === yesterdayOf(day) ? record.streak + 1 : 1;
  const next: DailyRecord = {
    lastPlayedDay: day,
    streak,
    bestStreak: Math.max(streak, record.bestStreak),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DAILY_KEY, JSON.stringify(next));
    } catch {
      // A streak is a nicety, never a blocker.
    }
  }

  return next;
};

export const isDailyDoneToday = (
  record: DailyRecord,
  day = getDailyKeyForDate(),
) => record.lastPlayedDay === day;

export const DAILY_CHALLENGE_LABEL = "Daily Challenge";
