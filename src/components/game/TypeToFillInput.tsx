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
  const smartHint = useGameStore((state) => state.smartHint);
  const setCurrentInput = useGameStore((state) => state.setCurrentInput);
  const submitTypeGuess = useGameStore((state) => state.submitTypeGuess);
  const submitIdentifyGuess = useGameStore(
    (state) => state.submitIdentifyGuess,
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

    if (selectedMode === "identify-shaded") {
      if (currentInput.trim().length < 2) {
        setLocalHint("Type an answer");
        vibrate([18, 24, 18]);
        return;
      }

      const result = submitIdentifyGuess(match?.country ?? null);
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
      className="absolute inset-x-4 bottom-6 z-20 mx-auto max-w-2xl rounded-[2rem] border border-white/16 bg-black/38 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl"
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
                    : "Type a country..."
        }
        className="h-16 w-full rounded-[1.55rem] border border-white/10 bg-white/10 px-6 text-center text-base font-medium text-white outline-none ring-0 transition placeholder:text-white/36 focus:border-emerald-300/40 focus:bg-white/14 focus:shadow-[0_0_40px_rgba(52,211,153,0.18)] disabled:cursor-not-allowed disabled:opacity-70 sm:text-2xl"
      />
      {selectedMode === "identify-shaded" && gameStatus === "running" ? (
        <button
          type="button"
          onClick={handleSubmit}
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-cyan-100/20 bg-cyan-100/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-100/20 sm:block"
        >
          Submit
        </button>
      ) : null}
      {localHint || smartHint ? (
        <p className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full border border-amber-200/20 bg-black/56 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-xl">
          {smartHint ?? localHint}
        </p>
      ) : null}
    </motion.div>
  );
}
