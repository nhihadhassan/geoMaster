"use client";

import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

const STUCK_DELAY_MS = 12_000;
const LATE_QUIZ_REMAINING_RATIO = 0.2;

export function useLateQuizHint() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const total = useGameStore((state) => state.total);
  const guessedCount = useGameStore((state) => state.guessedCountryIds.length);
  const resolvedCount = useGameStore((state) => state.countryResults ? Object.keys(state.countryResults).length : 0);
  const currentTargetIso = useGameStore((state) => state.currentTargetCountry?.iso_a3 ?? "");
  const lastFeedbackEvent = useGameStore((state) => state.lastFeedbackEvent);
  const requestHint = useGameStore((state) => state.requestHint);
  const progressKey = `${guessedCount}:${resolvedCount}:${currentTargetIso}`;
  const [progressStartedAt, setProgressStartedAt] = useState(() => Date.now());
  const [unsuccessfulEvents, setUnsuccessfulEvents] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintKey, setHintKey] = useState<string | null>(null);
  const [lastEventSequence, setLastEventSequence] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setProgressStartedAt(Date.now());
      setUnsuccessfulEvents(0);
      setHintKey(null);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [progressKey]);

  useEffect(() => {
    if (
      !lastFeedbackEvent ||
      lastFeedbackEvent.sequence === lastEventSequence
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setLastEventSequence(lastFeedbackEvent.sequence);
      if (lastFeedbackEvent.kind === "wrong") {
        setUnsuccessfulEvents((count) => count + 1);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [lastEventSequence, lastFeedbackEvent]);

  useEffect(() => {
    if (gameStatus !== "running") {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [gameStatus]);

  const remaining = Math.max(0, total - Math.max(guessedCount, resolvedCount));
  const threshold = Math.max(2, Math.ceil(total * LATE_QUIZ_REMAINING_RATIO));
  const stuck =
    now - progressStartedAt >= STUCK_DELAY_MS || unsuccessfulEvents >= 2;
  const eligible = gameStatus === "running" && remaining > 0 && remaining <= threshold && stuck;

  const request = useCallback(() => {
    const reveal = requestHint();
    if (reveal) {
      setHintText(reveal.text);
      setHintKey(progressKey);
      setProgressStartedAt(Date.now());
      setUnsuccessfulEvents(0);
    }
  }, [progressKey, requestHint]);

  return {
    eligible,
    hintText: hintKey === progressKey ? hintText : null,
    request,
  };
}
