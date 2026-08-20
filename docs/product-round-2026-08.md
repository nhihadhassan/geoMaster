# Product round — August 2026

Improvements to the existing GeoMaster, built as small reversible commits behind
independent flags. Nothing that already worked was replaced.

**Safe pre-change state:** tag `pre-round-2026-08-20`, branch
`backup/stable-pre-round-2026-08` (both pushed to `origin`).
Full rollback: `git revert` the merge commit, or reset `main` to the tag.

## Feature flags

Every user-facing addition reads a flag from [`src/config/features.ts`](../src/config/features.ts).
Setting one to `false` restores the previous behaviour without a revert, and
without touching any other feature.

| Flag | What it adds | What `false` restores | Main files |
|---|---|---|---|
| `adaptiveLanding` | One orientation line on the landing, adapting to first-time / returning / in-progress | The landing with no context line | `components/game/LandingPage.tsx`, `components/map/MapContainer.tsx` |
| `quickStart` | Remembers the last region + mode; landing starts it in one tap | Setup always opens; defaults to South America / Type | `store/preferences.ts`, `store/gameStore.ts`, `LandingPage.tsx` |
| `progressTracking` | Per-country mastery in `localStorage`, written at the end of each run | Nothing read or written; no progress exists | `store/progressStore.ts`, `utils/countryMastery.ts`, `hooks/useRecordQuizProgress.ts` |
| `practiceMistakes` | "Practice N" on results; "Practice N weak spots" on the landing | Results keep Review / Try Again / Change Region / Explore | `components/game/ResultsDashboard.tsx`, `LandingPage.tsx` |
| `mapMissTeaching` | A wrong map pick flashes rose; the answer is shown only once revealed | Wrong picks keep the hint text, vibration, and HUD flash | `components/map/mapLayers.ts`, `MapContainer.tsx`, `store/gameStore.ts` |
| `exploreSearch` | Search across countries, cities, landmarks, features, subdivisions | Explore header without a search field | `components/map/ExploreSearch.tsx`, `utils/exploreSearch.ts` |
| `mapControls` | Zoom in / out / recenter buttons | Map with attribution only, as before | `components/map/MapControls.tsx` |
| `untimedMode` | An infinity chip beside the timer multipliers | Timed runs only | `store/gameStore.ts`, `components/game/PremiumControls.tsx`, `GameHud.tsx` |
| `dailyChallenge` | Date-seeded 12-country run with a local streak | No chip, no daily state | `utils/dailyChallenge.ts`, `hooks/useDailyChallenge.ts` |
| `shareResultCard` | Canvas result card, Web Share with download fallback | Expanded review without a Share button | `components/game/ShareResultCard.tsx` |
| `lazyMapInit` | Mapbox loads on idle / on leaving the landing | Eager initialization on mount, as before | `components/map/MapContainer.tsx` |

Not flagged, because they are corrections rather than features — revert the
named commit to undo:

- **Timestamp timer** — the clock is derived from a deadline instead of being
  decremented, so a backgrounded tab no longer freezes it.
- **Map error boundary** — a WebGL/Mapbox failure no longer takes the app down.
- **PWA manifest** — installability metadata only; no service worker.

## Architectural cleanup

`MapContainer.tsx` went from 3108 to roughly 2400 lines by moving whole
concerns out unchanged — layer ids and paint builders (`mapLayers.ts`), the dev
debug panel, the environment hooks, idle rotation, and the idle toast. Each move
was verified as behaviour-preserving by diffing the line sets.
`addCountryLayers` was deliberately left alone: it closes over too much state
for a safe mechanical extraction, and shrinking the file is not worth the risk.

`gameStore.ts` went from 1173 to about 1040 lines by moving localStorage
plumbing into `quizPersistence.ts` and `preferences.ts`, and the state types
into `gameTypes.ts` so persistence can use them without an import cycle. The
store's public API — selectors, `readQuizProgress`, `TIMER_MULTIPLIER_OPTIONS`,
the type re-exports — is unchanged.

## Tests

`npm test` runs country validation, the matcher, and four new suites (26 cases)
using `tsx`, already a devDependency — no test runner was added.

- `test:store` — starting, scoring, rejecting invalid guesses, hint escalation
  and the three-attempt miss, the deadline timer under a simulated background
  throttle, pause/resume, untimed runs, custom rosters, save/resume.
- `test:progress` — mastery levels, region scoping, weakness ranking and its
  recency drift, and reading results from both engine shapes.
- `test:search` — dataset coverage and ranking.
- `test:daily` — roster determinism and streak rules.

## Known limitation of this round's verification

Mapbox tiles were intermittently unreachable from the verification browser.
Where they loaded, quiz flows, explore search, map controls, recenter, and
wrong-pick teaching were all exercised directly; when they did not, the current
production build showed the same "Initializing terrain engine" state, confirming
the block was environmental rather than a regression.
