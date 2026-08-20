"use client";

// Environment probes the map uses to decide how much motion and GPU work is
// safe: reduced-motion preference, tab visibility, and a low-power mobile mode.
// Extracted verbatim from MapContainer.tsx.
import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  return prefersReducedMotion;
}

const getInitialDocumentVisible = () =>
  typeof document === "undefined" ? true : !document.hidden;

export function useDocumentVisible() {
  const [documentVisible, setDocumentVisible] = useState(
    getInitialDocumentVisible,
  );

  useEffect(() => {
    const syncVisibility = () => setDocumentVisible(!document.hidden);

    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);

    return () =>
      document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  return documentVisible;
}

const getInitialMobilePerformanceMode = (prefersReducedMotion: boolean) => {
  if (typeof window === "undefined") {
    return prefersReducedMotion;
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrowViewport = window.matchMedia("(max-width: 767px)").matches;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;

  return (
    prefersReducedMotion ||
    coarsePointer ||
    narrowViewport ||
    Boolean(connection?.saveData)
  );
};

export function useMobilePerformanceMode(prefersReducedMotion: boolean) {
  const [mobilePerformanceMode, setMobilePerformanceMode] = useState(() =>
    getInitialMobilePerformanceMode(prefersReducedMotion),
  );

  useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const narrowViewport = window.matchMedia("(max-width: 767px)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    const syncMode = () => {
      setMobilePerformanceMode(
        prefersReducedMotion ||
          coarsePointer.matches ||
          narrowViewport.matches ||
          Boolean(connection?.saveData),
      );
    };

    syncMode();
    coarsePointer.addEventListener("change", syncMode);
    narrowViewport.addEventListener("change", syncMode);

    return () => {
      coarsePointer.removeEventListener("change", syncMode);
      narrowViewport.removeEventListener("change", syncMode);
    };
  }, [prefersReducedMotion]);

  return mobilePerformanceMode;
}
