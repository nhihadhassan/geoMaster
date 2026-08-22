// The map's shared motion vocabulary.
//
// Every piece of map feedback - the target breathing, the remaining-country
// pulse, and the transient correct/assisted/wrong flashes - runs on one clock
// and one set of curves, so they read as a single system rather than several
// unrelated effects.
//
// The previous implementation drove each effect from its own setInterval. At
// 120ms per step against a ~1.75s cycle that is only ~14 samples per breath,
// and setInterval is not aligned to the browser's paint clock, so updates
// bunched and skipped frames. That sampling - not the curve - is what made the
// highlight look like it was strobing.

/** Milliseconds for one full breath of the current quiz target. */
export const TARGET_BREATH_PERIOD_MS = 3_200;

/** Milliseconds for one full breath of the remaining-country pulse. */
export const REMAINING_BREATH_PERIOD_MS = 4_200;

/** How long a correct / assisted / wrong flash takes to fade out. */
export const FEEDBACK_FLASH_MS = 700;

/** How long the revealed answer stays lit after a final wrong pick. */
export const MISS_REVEAL_MS = 1_500;

/** How long a wrong pick is marked when the answer is still withheld. */
export const MISS_MARK_MS = 900;

/**
 * Writes below this delta are skipped. Mapbox repaints on every
 * setFeatureState / setPaintProperty call, and at 60fps a slow breath moves by
 * far less than a pixel between frames, so most of those repaints would be
 * invisible work.
 */
export const MOTION_EPSILON = 0.004;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** Classic smoothstep: eases in and out, flat at both ends. */
export const smoothstep = (value: number) => {
  const t = clamp01(value);

  return t * t * (3 - 2 * t);
};

export const easeOutCubic = (value: number) => {
  const t = clamp01(value);

  return 1 - Math.pow(1 - t, 3);
};

/**
 * A 0..1 breath. A raised cosine gives the cycle, and smoothstep then slows it
 * at the extremes so it lingers at full and empty instead of sweeping linearly
 * through them - the difference between a pulse and a breath.
 */
export const breathe = (elapsedMs: number, periodMs: number) => {
  const phase = (elapsedMs % periodMs) / periodMs;

  return smoothstep((1 - Math.cos(phase * Math.PI * 2)) / 2);
};

/** Maps a 0..1 curve onto a value range. */
export const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

export type MotionSubscriber = (elapsedMs: number) => void;

/**
 * One requestAnimationFrame loop shared by every map effect.
 *
 * rAF is frame-aligned, so values land exactly once per painted frame, and the
 * browser suspends it while the tab is hidden - both things setInterval got
 * wrong here. Subscribers all receive the same elapsed time, which is what
 * keeps the effects visually in step with one another.
 */
export const createMotionClock = () => {
  const subscribers = new Set<MotionSubscriber>();
  let frameId: number | null = null;
  let startedAt: number | null = null;

  const tick = (timestamp: number) => {
    startedAt ??= timestamp;

    const elapsed = timestamp - startedAt;

    subscribers.forEach((subscriber) => subscriber(elapsed));

    frameId = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (frameId !== null) {
      return;
    }

    frameId = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }

    startedAt = null;
  };

  return {
    subscribe(subscriber: MotionSubscriber) {
      subscribers.add(subscriber);
      start();

      return () => {
        subscribers.delete(subscriber);

        if (subscribers.size === 0) {
          stop();
        }
      };
    },
    stop,
  };
};

export type MotionClock = ReturnType<typeof createMotionClock>;
