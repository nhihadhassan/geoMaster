"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createMotionClock,
  type MotionSubscriber,
} from "@/components/map/mapMotion";

/**
 * Owns the single motion clock for a map instance and hands out a stable
 * `subscribe`.
 *
 * `enabled` folds in reduced motion, mobile performance mode and tab
 * visibility. When it is false nothing subscribes and no loop runs, so callers
 * apply their static fallback values instead - the same behaviour the
 * interval-based code had, just decided in one place.
 */
export function useMapMotion(enabled: boolean) {
  // Lazy state rather than a ref: the clock must be created once per map, and
  // constructing it touches no browser APIs (the loop only starts on the first
  // subscribe), so it is safe during SSR.
  const [clock] = useState(createMotionClock);

  useEffect(() => {
    if (!enabled) {
      clock.stop();
    }
  }, [clock, enabled]);

  useEffect(() => () => clock.stop(), [clock]);

  /**
   * Subscribes for as long as `active` holds, returning the caller's effect
   * cleanup. Returns undefined when motion is disabled, so callers can call it
   * unconditionally and keep their fallback branch separate.
   */
  return useCallback(
    (active: boolean, subscriber: MotionSubscriber) =>
      active && enabled ? clock.subscribe(subscriber) : undefined,
    [clock, enabled],
  );
}
