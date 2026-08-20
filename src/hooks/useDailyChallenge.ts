"use client";

import { useCallback, useEffect, useState } from "react";
import { features } from "@/config/features";
import { useGameStore } from "@/store/gameStore";
import {
  DAILY_CHALLENGE_LABEL,
  getDailyCountryIds,
  getDailyKeyForDate,
  isDailyDoneToday,
  readDailyRecord,
  recordDailyCompletion,
  type DailyRecord,
} from "@/utils/dailyChallenge";

/**
 * Owns the daily challenge: today's roster, the local streak, and starting the
 * run. It rides on startCustomQuiz, so the daily uses the same engine as every
 * other quiz.
 */
export function useDailyChallenge() {
  const [record, setRecord] = useState<DailyRecord>({
    lastPlayedDay: null,
    streak: 0,
    bestStreak: 0,
  });
  // Read after mount so the server and first client render agree.
  const [hydrated, setHydrated] = useState(false);
  const startCustomQuiz = useGameStore((state) => state.startCustomQuiz);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const customQuizSet = useGameStore((state) => state.customQuizSet);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setRecord(readDailyRecord());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // A daily run counts once it is finished, however it ended.
  useEffect(() => {
    if (
      !features.dailyChallenge ||
      !hydrated ||
      customQuizSet?.label !== DAILY_CHALLENGE_LABEL ||
      (gameStatus !== "completed" &&
        gameStatus !== "failed" &&
        gameStatus !== "gave-up")
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRecord((current) => recordDailyCompletion(current));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [customQuizSet, gameStatus, hydrated]);

  const startDailyChallenge = useCallback(() => {
    startCustomQuiz(getDailyCountryIds(), {
      mode: "identify-shaded",
      region: "world",
      label: DAILY_CHALLENGE_LABEL,
    });
  }, [startCustomQuiz]);

  return {
    available: features.dailyChallenge && hydrated,
    doneToday: hydrated && isDailyDoneToday(record),
    streak: record.streak,
    today: getDailyKeyForDate(),
    startDailyChallenge,
  };
}
