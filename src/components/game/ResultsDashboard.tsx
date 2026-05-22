"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { CountryEducationCard } from "@/components/game/CountryEducationCard";
import { getRegionConfig, type Country } from "@/data/countries";
import { useGameStore } from "@/store/gameStore";

type ReviewGroup = {
  label: string;
  tone: "emerald" | "amber" | "rose";
  countries: Country[];
};

const toneClasses: Record<ReviewGroup["tone"], string> = {
  emerald: "border-emerald-200/24 bg-emerald-300/12 text-emerald-50",
  amber: "border-amber-200/24 bg-amber-300/12 text-amber-50",
  rose: "border-rose-200/24 bg-rose-300/12 text-rose-50",
};

export function ResultsDashboard() {
  const prefersReducedMotion = useReducedMotion();
  const gameStatus = useGameStore((state) => state.gameStatus);
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const quizCountries = useGameStore((state) => state.quizCountries);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const countryResults = useGameStore((state) => state.countryResults);
  const score = useGameStore((state) => state.score);
  const total = useGameStore((state) => state.total);
  const resetQuiz = useGameStore((state) => state.resetQuiz);
  const lastFeedbackEvent = useGameStore((state) => state.lastFeedbackEvent);
  const reviewKey = `${gameStatus}-${selectedRegion}-${selectedMode}`;
  const [drawerState, setDrawerState] = useState<{
    key: string;
    expanded: boolean;
    selectedCountryId: string | null;
  }>({
    key: reviewKey,
    expanded: false,
    selectedCountryId: null,
  });
  const expanded =
    drawerState.key === reviewKey ? drawerState.expanded : false;
  const selectedCountryId =
    drawerState.key === reviewKey ? drawerState.selectedCountryId : null;
  const region = getRegionConfig(selectedRegion);
  const statusLabel =
    gameStatus === "completed"
      ? "Quiz complete"
      : gameStatus === "gave-up"
        ? "You gave up"
        : "Time expired";
  const modeBResults = Object.values(countryResults);
  const isTargetQueueMode =
    selectedMode === "identify-shaded" ||
    selectedMode === "click-country" ||
    selectedMode === "capital-challenge";
  const countryById = useMemo(
    () => new Map(quizCountries.map((country) => [country.iso_a3, country])),
    [quizCountries],
  );
  const perfectCount = modeBResults.filter(
    (result) => result.status === "correct",
  ).length;
  const assistedCount = modeBResults.filter(
    (result) => result.status === "assisted",
  ).length;
  const resolvedModeBIds = new Set(Object.keys(countryResults));
  const missedCount =
    modeBResults.filter((result) => result.status === "missed").length +
    (isTargetQueueMode && (gameStatus === "failed" || gameStatus === "gave-up")
      ? quizCountries.filter((country) => !resolvedModeBIds.has(country.iso_a3))
          .length
      : 0);
  const reviewGroups = useMemo<ReviewGroup[]>(() => {
    if (isTargetQueueMode) {
      const perfect = quizCountries.filter(
        (country) => countryResults[country.iso_a3]?.status === "correct",
      );
      const assisted = quizCountries.filter(
        (country) => countryResults[country.iso_a3]?.status === "assisted",
      );
      const missed = quizCountries.filter((country) => {
        const result = countryResults[country.iso_a3];

        return (
          result?.status === "missed" ||
          ((gameStatus === "failed" || gameStatus === "gave-up") && !result)
        );
      });

      return [
        { label: "Perfect", tone: "emerald", countries: perfect },
        { label: "With hints", tone: "amber", countries: assisted },
        { label: "Missed", tone: "rose", countries: missed },
      ];
    }

    const guessed = new Set(guessedCountryIds);
    const correct = quizCountries.filter((country) => guessed.has(country.iso_a3));
    const missed =
      gameStatus === "failed" || gameStatus === "gave-up"
        ? quizCountries.filter((country) => !guessed.has(country.iso_a3))
        : [];

    return [
      { label: "Correct", tone: "emerald", countries: correct },
      { label: "Missed", tone: "rose", countries: missed },
    ];
  }, [
    countryResults,
    gameStatus,
    guessedCountryIds,
    isTargetQueueMode,
    quizCountries,
  ]);
  const reviewCountries = useMemo(
    () => reviewGroups.flatMap((group) => group.countries),
    [reviewGroups],
  );
  const selectedCountry =
    (selectedCountryId ? countryById.get(selectedCountryId) : null) ??
    reviewCountries[0] ??
    null;
  const completionPulse =
    Boolean(lastFeedbackEvent?.completed) && gameStatus === "completed";

  if (
    gameStatus !== "completed" &&
    gameStatus !== "failed" &&
    gameStatus !== "gave-up"
  ) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      animate={
        completionPulse && !prefersReducedMotion
          ? {
              opacity: 1,
              y: 0,
              scale: [1, 1.01, 1],
              boxShadow: [
                "0 18px 48px rgba(0,0,0,0.34)",
                "0 22px 72px rgba(16,185,129,0.28)",
                "0 18px 48px rgba(0,0,0,0.34)",
              ],
            }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={
        completionPulse && !prefersReducedMotion
          ? { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
          : { type: "spring", stiffness: 240, damping: 28 }
      }
      className={`absolute inset-x-2 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 overflow-hidden rounded-3xl border border-white/14 bg-zinc-950/72 text-white shadow-xl shadow-black/34 backdrop-blur-2xl sm:left-1/2 sm:bottom-5 sm:w-[min(48rem,calc(100vw-2rem))] sm:-translate-x-1/2 ${
        expanded
          ? "max-h-[82dvh] overflow-y-auto p-4 sm:max-h-[min(72vh,40rem)] sm:p-5"
          : "p-3"
      }`}
    >
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
          expanded
            ? "sticky top-0 z-10 -mx-4 -mt-4 border-b border-white/10 bg-zinc-950/86 px-4 py-3 backdrop-blur-2xl sm:-mx-5 sm:-mt-5 sm:px-5 sm:py-4"
            : ""
        }`}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/60">
            {statusLabel}
          </p>
          <h2 className={expanded ? "mt-2 text-2xl font-semibold" : "mt-1 truncate text-lg font-semibold"}>
            {region.label}
          </h2>
          <p className={expanded ? "mt-2 text-sm text-white/64" : "mt-1 text-sm text-white/64"}>
            You found {score} of {total} countries.
          </p>
          {isTargetQueueMode ? (
            <p className="mt-1 text-xs font-medium text-white/50">
              Perfect {perfectCount} · With hints {assistedCount} · Missed{" "}
              {missedCount}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setDrawerState((state) => ({
                key: reviewKey,
                expanded: state.key === reviewKey ? !state.expanded : true,
                selectedCountryId:
                  state.key === reviewKey ? state.selectedCountryId : null,
              }))
            }
            className="min-h-11 rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm font-semibold text-white/66 transition hover:bg-white/12 hover:text-white"
          >
            {expanded ? (
              "Minimize"
            ) : (
              <>
                <span className="sm:hidden">Review</span>
                <span className="hidden sm:inline">Expand Review</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetQuiz}
            className="min-h-11 rounded-full border border-emerald-100/34 bg-emerald-300/22 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-sm shadow-emerald-950/20 transition hover:bg-emerald-300/30"
          >
            Try Again
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-4 pb-1 sm:mt-5 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            {reviewGroups.map((group) =>
              group.countries.length > 0 ? (
                <section key={group.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/48">
                      {group.label}
                    </h3>
                    <span className="text-xs font-semibold text-white/44">
                      {group.countries.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.countries.map((country) => (
                      <button
                        key={country.iso_a3}
                        type="button"
                        onClick={() =>
                          setDrawerState((state) => ({
                            key: reviewKey,
                            expanded:
                              state.key === reviewKey ? state.expanded : true,
                            selectedCountryId: country.iso_a3,
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-white/16 ${
                          selectedCountry?.iso_a3 === country.iso_a3
                            ? "border-white/70 bg-white/18 text-white"
                            : toneClasses[group.tone]
                        }`}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null,
            )}
          </div>

          {selectedCountry ? (
            <CountryEducationCard country={selectedCountry} variant="review" />
          ) : null}
        </div>
      ) : null}
    </motion.section>
  );
}
