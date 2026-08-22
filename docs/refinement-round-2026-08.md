# Refinement round — August 2026

A polish round on top of [`product-round-2026-08.md`](product-round-2026-08.md):
no new surfaces, no new dependencies at runtime. Everything here is either a
defect fix or the removal of something that had stopped earning its place.

**Safe pre-change state:** tag `pre-refinement-2026-08-22`, branch
`backup/stable-pre-refinement-2026-08` (both on `origin`, both at `43b82cb`).

Each change is one commit, so any single one can be reverted without touching
the others. There are no new feature flags: these are refinements to existing
behaviour rather than additions, and the flags from the previous round are
untouched.

## What changed, and how to undo it

| Change | Revert | Notes |
|---|---|---|
| Map feedback on one rAF clock | revert `7cec6fa` | Restores the four interval/timeout timers and the old amplitudes. |
| Landing caption removed | revert `42aa56d` | Brings back the adaptive context line and the absolute-positioned Daily chip. |
| HUD Give Up removed; linear setup | revert `1c528bd` | Brings back the HUD Give Up button and the Region/Mode/Timer tab bar. |
| Globe render scale and label throttle | revert `e6dd589` | Returns the globe to 4x render scale and per-frame label projection. |
| Mastery dot on review chips | revert `3eb1ee3`, or set `features.progressTracking = false` | The flag also disables the rest of progress tracking, so prefer the revert if only the dot is unwanted. |
| Playwright suite | revert `b6f0514` | Also reverts two defect fixes found by it (see below); prefer keeping those. |

## The highlight defect

The target glow was described as strobing. The cause was sampling, not the
curve: `Math.sin((now - startedAt) / 280)` is a 1759ms cycle, driven by
`setInterval` at 120ms. That is ~14 steps per breath, with jumps of up to
**0.212** of the full brightness range between them, delivered off the
browser's paint clock so frames bunched and skipped. A `line-width` swing of
2 → 7px made the stepping more obvious, since width jumps read as chunkier than
opacity.

`src/components/map/mapMotion.ts` now holds one `requestAnimationFrame` clock
that every effect subscribes to, plus the shared curves. Measured on the same
maths: **192 samples per cycle instead of 14, and a largest per-frame step of
0.0245 instead of 0.212** — an 8.7x reduction. `scripts/test-map-motion.ts`
pins that, along with continuity at the cycle boundary and the full range being
retained, so "calmer" cannot silently become "invisible".

| | Before | After |
|---|---|---|
| Target period | 1759ms @ 120ms interval | 3200ms @ rAF |
| Target glow opacity / width | 0.38–0.96 / 2–7px | 0.55–0.85 / 3–5px |
| Remaining period | 1900ms @ 160ms interval | 4200ms @ rAF |
| Remaining fill / line opacity | 0.04–0.20 / 0.18–0.62 | 0.06–0.14 / 0.26–0.46 |

Correct, assisted and revealed-answer feedback share that clock and one
`easeOutCubic`, so they read as one language. Reduced motion, mobile
performance mode and hidden tabs skip the loop entirely, as before.

## The globe cost

`width * 2` was passed to cobe while the config also set
`devicePixelRatio: 2`, and the two compounded into a 4x render scale. Measured
against production at identical CSS size: **20.29 megapixels per frame before,
5.07 after** on desktop, and 5.07 → 0.71 on a phone. Nothing looks different,
because the extra samples were never displayable. City labels also moved from a
per-frame React `setState` to a ~125ms gate.

## Defects surfaced by writing the tests

- Both `ExploreSearch` instances render at once (one per breakpoint) and shared
  the DOM id `explore-search`, so ids collided and a label could bind to the
  wrong input.
- The desktop setup panel labelled sections with `<p>` while the mobile sheet
  used headings, so the layouts exposed different structure to assistive tech.

Both are fixed in the Playwright commit rather than papered over in the specs.

## Verification

`npm run lint`, `npm test` (7 suites, 79 cases including the new motion checks),
`npm run build`, and `npm run test:e2e` (10 specs across desktop and mobile
projects, 20 runs). Manual passes at 1280 / 375 / 320px.

**Not verified in this environment:** Mapbox tiles were unreachable from the
verification browser for most of the round, so the retuned glow was not watched
rendering end to end. The curve maths, the clock, and the paint ranges are
covered by unit tests and code review; the visual confirmation should be done
on the live site by someone who can load tiles.
