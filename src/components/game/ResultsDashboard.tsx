"use client";

import { motion } from "framer-motion";
import { getRegionConfig } from "@/data/countries";
import { useGameStore } from "@/store/gameStore";

export function ResultsDashboard() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const quizCountries = useGameStore((state) => state.quizCountries);
  const countryResults = useGameStore((state) => state.countryResults);
  const score = useGameStore((state) => state.score);
  const total = useGameStore((state) => state.total);
  const resetQuiz = useGameStore((state) => state.resetQuiz);

  if (
    gameStatus !== "completed" &&
    gameStatus !== "failed" &&
    gameStatus !== "gave-up"
  ) {
    return null;
  }

  const region = getRegionConfig(selectedRegion);
  const statusLabel =
    gameStatus === "completed"
      ? "Quiz complete"
      : gameStatus === "gave-up"
        ? "You gave up"
        : "Time expired";
  const modeBResults = Object.values(countryResults);
  const isTargetQueueMode =
    selectedMode === "identify-shaded" || selectedMode === "click-country";
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="absolute left-1/2 top-28 z-30 w-[min(25rem,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-white/16 bg-black/50 p-5 text-white shadow-2xl shadow-black/42 backdrop-blur-3xl"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/60">
        {statusLabel}
      </p>
      <h2 className="mt-2 text-2xl font-semibold">{region.label}</h2>
      <p className="mt-2 text-sm text-white/64">
        You found {score} of {total} countries.
      </p>
      {isTargetQueueMode ? (
        <p className="mt-2 text-xs font-medium text-white/50">
          Perfect {perfectCount} · With hints {assistedCount} · Missed{" "}
          {missedCount}
        </p>
      ) : null}
      <button
        type="button"
        onClick={resetQuiz}
        className="mt-4 rounded-full border border-emerald-100/30 bg-emerald-300/18 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/26"
      >
        Try Again
      </button>
    </motion.section>
  );
}
