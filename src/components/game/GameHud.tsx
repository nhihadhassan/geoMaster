"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { getRegionConfig } from "@/data/countries";
import { useGameStore, type GameMode } from "@/store/gameStore";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
};

const modeLabels: Record<GameMode, string> = {
  "type-to-fill": "Type",
  "identify-shaded": "Identify",
  "click-country": "Map Click",
};

export function GameHud() {
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const countryResults = useGameStore((state) => state.countryResults);
  const total = useGameStore((state) => state.total);
  const remainingSeconds = useGameStore((state) => state.remainingSeconds);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const selectMode = useGameStore((state) => state.selectMode);
  const startQuiz = useGameStore((state) => state.startQuiz);
  const resetQuiz = useGameStore((state) => state.resetQuiz);
  const giveUp = useGameStore((state) => state.giveUp);
  const backToRegionSelect = useGameStore((state) => state.backToRegionSelect);
  const tick = useGameStore((state) => state.tick);
  const region = getRegionConfig(selectedRegion);
  const modeBResults = Object.values(countryResults);
  const perfectCount = modeBResults.filter(
    (result) => result.status === "correct",
  ).length;
  const assistedCount = modeBResults.filter(
    (result) => result.status === "assisted",
  ).length;
  const missedCount = modeBResults.filter(
    (result) => result.status === "missed",
  ).length;
  const isTargetQueueMode =
    selectedMode === "identify-shaded" || selectedMode === "click-country";
  const identifiedCount =
    isTargetQueueMode
      ? perfectCount + assistedCount
      : guessedCountryIds.length;
  const progressCount =
    isTargetQueueMode
      ? modeBResults.length
      : guessedCountryIds.length;
  const progress = total === 0 ? 0 : progressCount / total;

  useEffect(() => {
    if (gameStatus !== "running") {
      return;
    }

    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [gameStatus, tick]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute left-1/2 top-5 z-20 flex w-[min(58rem,calc(100vw-2rem))] -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-white/16 bg-black/38 px-4 py-3 text-white shadow-2xl shadow-black/35 backdrop-blur-2xl"
    >
      <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-white/48">
          {region.label}
        </p>
        <p className="text-sm font-medium text-white/82">
          {identifiedCount}/{total} countries
        </p>
        {isTargetQueueMode && modeBResults.length > 0 ? (
          <p className="mt-0.5 text-[0.68rem] font-medium text-white/48">
            Perfect {perfectCount} · Hints {assistedCount} · Missed {missedCount}
          </p>
        ) : null}
      </div>

      <div className="hidden min-w-48 items-center gap-2 lg:flex">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-200 to-sky-300"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 26 }}
          />
        </div>
      </div>

      <div className="flex rounded-full border border-white/10 bg-white/6 p-1">
        {(Object.keys(modeLabels) as GameMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => selectMode(mode)}
            disabled={gameStatus === "running"}
            className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
              selectedMode === mode
                ? "bg-white text-slate-950"
                : "text-white/58 hover:text-white"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {gameStatus === "idle" ? (
          <button
            type="button"
            onClick={startQuiz}
            className="rounded-full border border-emerald-100/30 bg-emerald-300/20 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/28"
          >
            Start Quiz
          </button>
        ) : null}
        <button
          type="button"
          onClick={backToRegionSelect}
          className="hidden rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-white/68 transition hover:bg-white/14 hover:text-white sm:block"
        >
          Back to Region Select
        </button>
        {gameStatus === "running" ? (
          <button
            type="button"
            onClick={giveUp}
            className="rounded-full border border-rose-200/24 bg-rose-300/14 px-3 py-2 text-xs font-semibold text-rose-50 transition hover:bg-rose-300/22"
          >
            Give Up
          </button>
        ) : null}
        {gameStatus === "completed" ||
        gameStatus === "failed" ||
        gameStatus === "gave-up" ? (
          <button
            type="button"
            onClick={resetQuiz}
            className="rounded-full border border-emerald-200/24 bg-emerald-300/14 px-3 py-2 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/22"
          >
            Try Again
          </button>
        ) : null}
        <div className="min-w-16 text-right">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-white/48">
            Timer
          </p>
          <p className="font-mono text-lg font-semibold text-white">
            {formatTime(remainingSeconds)}
          </p>
        </div>
      </div>
    </motion.header>
  );
}
