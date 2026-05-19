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
  "capital-challenge": "Capital",
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
  const pauseQuiz = useGameStore((state) => state.pauseQuiz);
  const resumeQuiz = useGameStore((state) => state.resumeQuiz);
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
    selectedMode === "identify-shaded" ||
    selectedMode === "click-country" ||
    selectedMode === "capital-challenge";
  const identifiedCount =
    isTargetQueueMode
      ? perfectCount + assistedCount
      : guessedCountryIds.length;
  const progressCount =
    isTargetQueueMode
      ? modeBResults.length
      : guessedCountryIds.length;
  const progress = total === 0 ? 0 : progressCount / total;
  const isIdle = gameStatus === "idle";
  const isFinished =
    gameStatus === "completed" ||
    gameStatus === "failed" ||
    gameStatus === "gave-up";

  useEffect(() => {
    if (gameStatus !== "running") {
      return;
    }

    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [gameStatus, tick]);

  const mobilePrimaryAction =
    gameStatus === "idle" ? (
      <button
        type="button"
        onClick={startQuiz}
        className="min-h-10 rounded-full border border-emerald-100/30 bg-emerald-300/20 px-3 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/28"
      >
        Start
      </button>
    ) : gameStatus === "running" ? (
      <button
        type="button"
        onClick={pauseQuiz}
        className="min-h-10 rounded-full border border-sky-100/24 bg-sky-300/14 px-3 text-xs font-semibold text-sky-50 transition hover:bg-sky-300/22"
        aria-label="Pause quiz"
      >
        Pause
      </button>
    ) : gameStatus === "paused" ? (
      <button
        type="button"
        onClick={resumeQuiz}
        className="min-h-10 rounded-full border border-emerald-100/30 bg-emerald-300/18 px-3 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/26"
      >
        Resume
      </button>
    ) : isFinished ? (
      <button
        type="button"
        onClick={resetQuiz}
        className="min-h-10 rounded-full border border-emerald-100/30 bg-emerald-300/18 px-3 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/26"
      >
        Again
      </button>
    ) : null;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="absolute left-2 right-2 top-[calc(0.75rem+env(safe-area-inset-top))] z-20 flex min-h-14 items-center justify-between gap-2 rounded-3xl border border-white/12 bg-zinc-950/62 px-2.5 py-2 text-white shadow-xl shadow-black/28 backdrop-blur-xl sm:hidden"
      >
        <div className="min-w-0">
          <p className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/48">
            {region.label}
          </p>
          <p className="text-sm font-semibold text-white/86">
            {identifiedCount}/{total}
            <span className="ml-2 rounded-full border border-white/10 bg-white/7 px-2 py-0.5 text-[0.68rem] text-white/58">
              {modeLabels[selectedMode]}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-1.5 text-center">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/42">
            Timer
          </p>
          <p className="font-mono text-base font-semibold tabular-nums text-white">
            {formatTime(remainingSeconds)}
          </p>
        </div>
        <div className="shrink-0">{mobilePrimaryAction}</div>
      </motion.header>

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/12 bg-zinc-950/56 px-4 py-2.5 text-white shadow-xl shadow-black/28 backdrop-blur-xl sm:flex ${
          isIdle
            ? "w-[min(50rem,calc(100vw-2rem))]"
            : "w-[min(44rem,calc(100vw-2rem))]"
        }`}
      >
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/48">
            {region.label}
          </p>
          <p className="text-sm font-medium text-white/82">
            {identifiedCount}/{total} countries
          </p>
          {isTargetQueueMode && modeBResults.length > 0 ? (
            <p className="mt-0.5 text-[0.68rem] font-medium text-white/50">
              Perfect {perfectCount} · Hints {assistedCount} · Missed{" "}
              {missedCount}
            </p>
          ) : null}
        </div>

        <div className="hidden min-w-32 items-center gap-2 md:flex">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-200 to-sky-300"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
            />
          </div>
        </div>

        {isIdle ? (
          <div className="flex overflow-x-auto rounded-full border border-white/10 bg-white/6 p-1">
            {(Object.keys(modeLabels) as GameMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => selectMode(mode)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedMode === mode
                    ? "bg-white text-slate-950"
                    : "text-white/58 hover:text-white"
                }`}
              >
                {modeLabels[mode]}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-full border border-white/10 bg-white/7 px-3 py-1.5 text-xs font-semibold text-white/68">
            {modeLabels[selectedMode]}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
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
            className="rounded-full border border-white/10 bg-white/7 px-3 py-2 text-xs font-semibold text-white/62 transition hover:bg-white/12 hover:text-white"
          >
            Back to Region Select
          </button>
          {gameStatus === "running" ? (
            <button
              type="button"
              onClick={pauseQuiz}
              className="rounded-full border border-sky-100/24 bg-sky-300/14 px-3 py-2 text-xs font-semibold text-sky-50 transition hover:bg-sky-300/22"
            >
              Pause
            </button>
          ) : null}
          {gameStatus === "paused" ? (
            <button
              type="button"
              onClick={resumeQuiz}
              className="rounded-full border border-emerald-100/30 bg-emerald-300/18 px-3 py-2 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/26"
            >
              Resume
            </button>
          ) : null}
          {gameStatus === "running" || gameStatus === "paused" ? (
            <button
              type="button"
              onClick={giveUp}
              className="rounded-full border border-rose-200/24 bg-rose-300/14 px-3 py-2 text-xs font-semibold text-rose-50 transition hover:bg-rose-300/22"
            >
              Give Up
            </button>
          ) : null}
          {isFinished ? (
            <button
              type="button"
              onClick={resetQuiz}
              className="rounded-full border border-emerald-200/24 bg-emerald-300/14 px-3 py-2 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/22"
            >
              Try Again
            </button>
          ) : null}
          <div className="min-w-16 text-right">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/48">
              Timer
            </p>
            <p className="font-mono text-lg font-semibold text-white">
              {formatTime(remainingSeconds)}
            </p>
          </div>
        </div>
      </motion.header>
    </>
  );
}
