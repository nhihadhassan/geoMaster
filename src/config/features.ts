// Central feature switchboard for the 2026-08 product round.
//
// Every addition from that round reads its flag here and falls back to the
// previous behaviour when the flag is `false`, so an individual feature can be
// disabled with a one-line change and a redeploy — no revert needed.
//
// Corrections that are not flagged (they are fixed by reverting their commit):
// the timestamp-based timer, the map error boundary, and the PWA manifest.
export const features = {
  /** Landing copy and primary CTA adapt to first-time / returning / in-progress. */
  adaptiveLanding: true,
  /** Remember the last region + mode and let the landing start it in one tap. */
  quickStart: true,
  /** Local per-country mastery tracking written at the end of each run. */
  progressTracking: true,
  /** "Practice Mistakes" action that re-quizzes the countries just missed. */
  practiceMistakes: true,
  /** Show a wrong pick (and, once revealed, the correct country) on the map. */
  mapMissTeaching: true,
  /** Search field in explore mode across countries, cities, landmarks, features. */
  exploreSearch: true,
  /** Zoom in / out / recenter buttons on the map. */
  mapControls: true,
  /** Untimed practice option alongside the timer multipliers. */
  untimedMode: true,
  /** Date-seeded daily challenge with a local streak. */
  dailyChallenge: true,
  /** Canvas result card with Web Share / download fallback. */
  shareResultCard: true,
  /** Defer Mapbox GL loading until the landing screen is dismissed. */
  lazyMapInit: true,
} as const;

export type FeatureName = keyof typeof features;
