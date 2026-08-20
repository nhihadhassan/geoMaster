"use client";

// Slow idle rotation of the globe while nobody is interacting with the map.
// Extracted verbatim from MapContainer.tsx.
import { useEffect, type MutableRefObject } from "react";
import type { Map } from "mapbox-gl";

const IDLE_ROTATION_STEP_MS = 250;

export function useIdleGlobeRotation({
  enabled,
  idleDelayMs,
  mapRef,
  onInteraction,
  interactionKey,
  documentVisible,
}: {
  enabled: boolean;
  idleDelayMs: number;
  mapRef: MutableRefObject<Map | null>;
  onInteraction: () => void;
  interactionKey: number;
  documentVisible: boolean;
}) {
  useEffect(() => {
    const map = mapRef.current;

    if (!enabled || !documentVisible || !map) {
      return;
    }

    let timeoutId: number | null = null;
    let intervalId: number | null = null;
    let previousTimestamp = 0;

    const stopRotation = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleInteraction = () => {
      stopRotation();
      onInteraction();
    };

    const rotateOnce = () => {
      if (mapRef.current !== map) {
        return;
      }

      const timestamp = performance.now();

      if (!previousTimestamp) {
        previousTimestamp = timestamp;
      }

      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;
      map.setBearing(map.getBearing() + elapsedSeconds * 0.18);
    };

    timeoutId = window.setTimeout(() => {
      previousTimestamp = 0;
      rotateOnce();
      intervalId = window.setInterval(rotateOnce, IDLE_ROTATION_STEP_MS);
    }, idleDelayMs);

    map.on("dragstart", handleInteraction);
    map.on("zoomstart", handleInteraction);
    map.on("rotatestart", handleInteraction);
    map.on("pitchstart", handleInteraction);
    map.on("mousedown", handleInteraction);
    map.on("touchstart", handleInteraction);
    const canvas = map.getCanvas();
    canvas.addEventListener("wheel", handleInteraction, { passive: true });

    return () => {
      stopRotation();
      map.off("dragstart", handleInteraction);
      map.off("zoomstart", handleInteraction);
      map.off("rotatestart", handleInteraction);
      map.off("pitchstart", handleInteraction);
      map.off("mousedown", handleInteraction);
      map.off("touchstart", handleInteraction);
      canvas.removeEventListener("wheel", handleInteraction);
    };
  }, [
    documentVisible,
    enabled,
    idleDelayMs,
    interactionKey,
    mapRef,
    onInteraction,
  ]);
}
