"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Country } from "@/data/countries";
import { useGameStore, type IdentifyGuessResult } from "@/store/gameStore";
import {
  findCountryMatch,
  normalizeCountryText,
} from "@/utils/countryMatcher";

type TypeToFillInputProps = {
  onCountryMatched: (
    country: Country,
    outcome?: Extract<IdentifyGuessResult["outcome"], "correct" | "assisted">,
  ) => void;
};

export function TypeToFillInput({ onCountryMatched }: TypeToFillInputProps) {
  const quizCountries = useGameStore((state) => state.quizCountries);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const currentInput = useGameStore((state) => state.currentInput);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const currentTargetCountry = useGameStore(
    (state) => state.currentTargetCountry,
  );
  const smartHint = useGameStore((state) => state.smartHint);
  const setCurrentInput = useGameStore((state) => state.setCurrentInput);
  const submitTypeGuess = useGameStore((state) => state.submitTypeGuess);
  const submitIdentifyGuess = useGameStore(
    (state) => state.submitIdentifyGuess,
  );
  const submitCapitalGuess = useGameStore(
    (state) => state.submitCapitalGuess,
  );
  const setMapDebug = useGameStore((state) => state.setMapDebug);
  const availableCountries = useMemo(
    () =>
      quizCountries.filter(
        (country) => !guessedCountryIds.includes(country.iso_a3),
      ),
    [guessedCountryIds, quizCountries],
  );
  const [localHint, setLocalHint] = useState<string | null>(null);
  const inputDisabled = gameStatus !== "running";

  if (selectedMode === "click-country") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="pointer-events-none absolute inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-2xl rounded-2xl border border-white/12 bg-zinc-950/62 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl sm:inset-x-4 sm:bottom-6 sm:rounded-3xl sm:p-2"
      >
        <div className="grid min-h-12 place-items-center rounded-xl border border-white/10 bg-white/9 px-4 text-center text-sm font-semibold text-white/76 sm:h-16 sm:rounded-2xl sm:px-6 sm:text-base">
          {gameStatus === "running"
            ? currentTargetCountry
              ? `Find: ${currentTargetCountry.name} · Tap the country`
              : "Tap the country shown in the prompt"
            : gameStatus === "completed"
              ? "Quiz complete"
              : gameStatus === "failed"
                ? "Time expired"
                : gameStatus === "gave-up"
                  ? "Quiz ended"
                  : "Choose a region, then start the quiz"}
        </div>
      </motion.div>
    );
  }

  const vibrate = (pattern: number | number[]) => {
    navigator.vibrate?.(pattern);
  };

  const recordMatchDebug = (
    value: string,
    match: ReturnType<typeof findCountryMatch>,
    accepted: boolean,
  ) => {
    setMapDebug({
      lastRawInput: value,
      lastNormalizedInput: normalizeCountryText(value),
      lastMatchedIso: match?.country.iso_a3 ?? null,
      lastMatchedName: match?.country.name ?? null,
      lastMatchMethod: match?.matchedBy ?? null,
      lastMatchAccepted: accepted,
    });
  };

  const acceptMatch = (
    country: Country,
    outcome?: Extract<IdentifyGuessResult["outcome"], "correct" | "assisted">,
  ) => {
    vibrate(14);
    setLocalHint(null);
    onCountryMatched(country, outcome);
  };

  const handleChange = (value: string) => {
    if (inputDisabled) {
      return;
    }

    setCurrentInput(value);

    if (selectedMode !== "type-to-fill") {
      return;
    }

    const match = findCountryMatch(value, availableCountries);

    if (!match) {
      recordMatchDebug(value, null, false);
      return;
    }

    if (submitTypeGuess(match.country)) {
      recordMatchDebug(value, match, true);
      acceptMatch(match.country);
    } else {
      recordMatchDebug(value, match, false);
    }
  };

  const handleSubmit = () => {
    if (inputDisabled) {
      return;
    }

    const match = findCountryMatch(currentInput, quizCountries);

    if (
      selectedMode === "identify-shaded" ||
      selectedMode === "capital-challenge"
    ) {
      if (currentInput.trim().length < 2) {
        setLocalHint("Type an answer");
        vibrate([18, 24, 18]);
        return;
      }

      const result =
        selectedMode === "capital-challenge"
          ? submitCapitalGuess(match?.country ?? null)
          : submitIdentifyGuess(match?.country ?? null);
      setLocalHint(null);

      recordMatchDebug(
        currentInput,
        match,
        result.outcome === "correct" || result.outcome === "assisted",
      );

      if (
        (result.outcome === "correct" || result.outcome === "assisted") &&
        result.country
      ) {
        acceptMatch(result.country, result.outcome);
      } else {
        vibrate([18, 24, 18]);
      }

      return;
    }

    if (!match) {
      recordMatchDebug(currentInput, null, false);
      setLocalHint("No match yet");
      vibrate([18, 24, 18]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="absolute inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-2xl rounded-2xl border border-white/12 bg-zinc-950/62 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl sm:inset-x-4 sm:bottom-6 sm:rounded-3xl sm:p-2"
    >
      <label className="sr-only" htmlFor="country-guess">
        Type a country name
      </label>
      <input
        id="country-guess"
        value={currentInput}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSubmit();
          }
        }}
        disabled={inputDisabled}
        autoComplete="off"
        spellCheck={false}
        placeholder={
          gameStatus === "idle"
            ? "Choose a region, then start the quiz"
            : gameStatus === "completed"
              ? "Quiz complete"
              : gameStatus === "failed"
                ? "Time expired"
                : gameStatus === "gave-up"
                  ? "Quiz ended"
                  : selectedMode === "identify-shaded"
                    ? "Identify the glowing country, then press Enter"
                    : selectedMode === "capital-challenge"
                      ? "Name the country from the capital, then press Enter"
                    : "Type a country..."
        }
        className="h-12 w-full rounded-xl border border-white/10 bg-white/9 px-4 text-center text-base font-medium text-white outline-none ring-0 transition placeholder:text-white/36 focus:border-emerald-300/40 focus:bg-white/14 focus:shadow-[0_0_34px_rgba(52,211,153,0.16)] disabled:cursor-not-allowed disabled:opacity-70 sm:h-16 sm:rounded-2xl sm:px-6 sm:text-2xl"
      />
      {(selectedMode === "identify-shaded" ||
        selectedMode === "capital-challenge") &&
      gameStatus === "running" ? (
        <button
          type="button"
          onClick={handleSubmit}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-cyan-100/20 bg-cyan-100/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-100/20 sm:block"
      >
          Submit
        </button>
      ) : null}
      {localHint || smartHint ? (
        <p className="pointer-events-none absolute -top-8 left-1/2 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 truncate rounded-full border border-amber-200/20 bg-zinc-950/68 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-xl sm:-top-9">
          {smartHint ?? localHint}
        </p>
      ) : null}
    </motion.div>
  );
}
