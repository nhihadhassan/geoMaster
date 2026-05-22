"use client";

import { useEffect, useRef } from "react";
import { useGameStore, type QuizFeedbackEvent } from "@/store/gameStore";
import { playGeoSound, unlockGeoAudio } from "@/utils/soundEffects";

type UseSoundEffectsOptions = {
  documentVisible: boolean;
};

const ANSWER_TO_COMPLETION_DELAY_MS = 460;

export function useSoundEffects(
  feedbackEvent: QuizFeedbackEvent | null,
  { documentVisible }: UseSoundEffectsOptions,
) {
  const soundEffectsEnabled = useGameStore(
    (state) => state.soundEffectsEnabled,
  );
  const lastHandledSequenceRef = useRef<number | null>(null);
  const completionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!soundEffectsEnabled) {
      return;
    }

    const unlock = () => unlockGeoAudio();

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [soundEffectsEnabled]);

  useEffect(() => {
    if (!soundEffectsEnabled || !documentVisible || !feedbackEvent) {
      return;
    }

    if (lastHandledSequenceRef.current === feedbackEvent.sequence) {
      return;
    }

    lastHandledSequenceRef.current = feedbackEvent.sequence;

    if (completionTimerRef.current) {
      window.clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    const controller = new AbortController();

    playGeoSound(feedbackEvent.kind, { signal: controller.signal });

    if (feedbackEvent.completed) {
      completionTimerRef.current = window.setTimeout(() => {
        playGeoSound(feedbackEvent.perfect ? "perfect" : "quiz-complete", {
          signal: controller.signal,
        });
      }, ANSWER_TO_COMPLETION_DELAY_MS);
    }

    return () => {
      controller.abort();

      if (completionTimerRef.current) {
        window.clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
  }, [documentVisible, feedbackEvent, soundEffectsEnabled]);
}
