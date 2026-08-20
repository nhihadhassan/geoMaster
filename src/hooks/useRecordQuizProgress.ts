"use client";

import { useEffect, useRef } from "react";
import { features } from "@/config/features";
import { useGameStore } from "@/store/gameStore";
import {
  useProgressStore,
  type QuizOutcomeEntry,
} from "@/store/progressStore";

/**
 * Writes one mastery record per finished run.
 *
 * The two engine shapes report results differently: target-queue modes fill
 * `countryResults`, while type-to-fill only tracks `guessedCountryIds`, so an
 * unguessed country at the end of a type run counts as missed.
 */
export const buildRunOutcome = ({
  quizCountryIds,
  countryResults,
  guessedCountryIds,
  isTargetQueueMode,
}: {
  quizCountryIds: string[];
  countryResults: Record<string, { status: QuizOutcomeEntry["status"] }>;
  guessedCountryIds: string[];
  isTargetQueueMode: boolean;
}): QuizOutcomeEntry[] => {
  if (isTargetQueueMode) {
    return quizCountryIds.map((iso) => ({
      iso,
      status: countryResults[iso]?.status ?? "missed",
    }));
  }

  const guessed = new Set(guessedCountryIds);

  return quizCountryIds.map((iso) => ({
    iso,
    status: guessed.has(iso) ? "correct" : "missed",
  }));
};

export function useRecordQuizProgress() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const hydrate = useProgressStore((state) => state.hydrate);
  const recordRun = useProgressStore((state) => state.recordRun);
  // A run is identified by the feedback sequence at the moment it ended, so a
  // re-render (or a results screen remount) cannot double-count it.
  const recordedSequenceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!features.progressTracking) {
      return;
    }

    const timeoutId = window.setTimeout(hydrate, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hydrate]);

  useEffect(() => {
    if (!features.progressTracking) {
      return;
    }

    if (
      gameStatus !== "completed" &&
      gameStatus !== "failed" &&
      gameStatus !== "gave-up"
    ) {
      recordedSequenceRef.current = null;

      return;
    }

    const state = useGameStore.getState();
    const runId = state.feedbackSequence;

    if (recordedSequenceRef.current === runId) {
      return;
    }

    recordedSequenceRef.current = runId;

    const isTargetQueueMode =
      state.selectedMode === "identify-shaded" ||
      state.selectedMode === "click-country" ||
      state.selectedMode === "capital-challenge";
    const entries = buildRunOutcome({
      quizCountryIds: state.quizCountries.map((country) => country.iso_a3),
      countryResults: state.countryResults,
      guessedCountryIds: state.guessedCountryIds,
      isTargetQueueMode,
    });

    const timeoutId = window.setTimeout(() => recordRun(entries), 0);

    return () => window.clearTimeout(timeoutId);
  }, [gameStatus, recordRun]);
}
