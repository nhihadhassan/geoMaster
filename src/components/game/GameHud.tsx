"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { getRegionConfig } from "@/data/countries";
import { useGameStore, type GameMode } from "@/store/gameStore";

const brandIconSrc = "/brand/geomaster-icon-192.png";

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

type GameHudProps = {
  onOpenLanding: () => void;
  onOpenRegionPanel: () => void;
  regionPanelOpen: boolean;
};

function GeoMasterBrand({
  onOpenLanding,
  compact = false,
}: {
  onOpenLanding: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpenLanding}
      className={`flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/7 text-left transition hover:bg-white/12 ${
        compact ? "min-h-10 px-2.5" : "min-h-11 px-3"
      }`}
      aria-label="Open GeoMaster intro"
      title="Open GeoMaster intro"
    >
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-cyan-100/18 bg-cyan-200/10 shadow-inner shadow-cyan-950/30 ${
          compact ? "size-7" : "size-8"
        }`}
      >
        <Image
          src={brandIconSrc}
          width={compact ? 28 : 32}
          height={compact ? 28 : 32}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          priority
        />
      </span>
      <span className="min-w-0">
        <span
          className={`block truncate font-semibold text-white/90 ${
            compact ? "text-sm" : "text-[0.95rem]"
          }`}
        >
          GeoMaster
        </span>
        {!compact ? (
          <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-cyan-50/58">
            Explore
          </span>
        ) : null}
      </span>
    </button>
  );
}

function HudFeedbackFlash({
  tone,
  sequence,
}: {
  tone: "correct" | "assisted" | "wrong" | "missed" | "complete";
  sequence: number;
}) {
  const toneClass =
    tone === "assisted"
      ? "border-amber-200/34 bg-amber-300/10"
      : tone === "wrong" || tone === "missed"
        ? "border-rose-200/34 bg-rose-300/10"
        : tone === "complete"
          ? "border-cyan-200/34 bg-cyan-300/10"
          : "border-emerald-200/34 bg-emerald-300/10";

  return (
    <motion.span
      key={sequence}
      className={`pointer-events-none absolute inset-0 rounded-2xl border ${toneClass}`}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: [0, 0.34, 0], scale: [0.985, 1.012, 1] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

export function GameHud({
  onOpenLanding,
  onOpenRegionPanel,
  regionPanelOpen,
}: GameHudProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const countryResults = useGameStore((state) => state.countryResults);
  const total = useGameStore((state) => state.total);
  const remainingSeconds = useGameStore((state) => state.remainingSeconds);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const lastFeedbackEvent = useGameStore((state) => state.lastFeedbackEvent);
  const startQuiz = useGameStore((state) => state.startQuiz);
  const resetQuiz = useGameStore((state) => state.resetQuiz);
  const pauseQuiz = useGameStore((state) => state.pauseQuiz);
  const resumeQuiz = useGameStore((state) => state.resumeQuiz);
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
  const identifiedCount = isTargetQueueMode
    ? perfectCount + assistedCount
    : guessedCountryIds.length;
  const progressCount = isTargetQueueMode
    ? modeBResults.length
    : guessedCountryIds.length;
  const progress = total === 0 ? 0 : progressCount / total;
  const isIdle = gameStatus === "idle";
  const isExplore = isIdle && !regionPanelOpen;
  const isSetup = isIdle && regionPanelOpen;
  const isFinished =
    gameStatus === "completed" ||
    gameStatus === "failed" ||
    gameStatus === "gave-up";
  const showTimer = gameStatus !== "idle";
  const statusLabel = isSetup
    ? "Quiz setup"
    : isFinished
      ? gameStatus === "completed"
        ? "Complete"
        : gameStatus === "gave-up"
          ? "Ended"
          : "Time expired"
      : gameStatus === "paused"
        ? "Paused"
        : "Quiz active";
  const contextLabel = `${region.label} · ${modeLabels[selectedMode]}`;
  const feedbackTone = lastFeedbackEvent?.completed
    ? "complete"
    : lastFeedbackEvent?.kind === "correct" ||
        lastFeedbackEvent?.kind === "assisted" ||
        lastFeedbackEvent?.kind === "wrong" ||
        lastFeedbackEvent?.kind === "missed"
      ? lastFeedbackEvent.kind
      : null;

  useEffect(() => {
    if (gameStatus !== "running") {
      return;
    }

    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [gameStatus, tick]);

  const primaryAction =
    gameStatus === "running"
      ? { label: "Pause", action: pauseQuiz, tone: "sky" as const }
      : gameStatus === "paused"
        ? { label: "Resume", action: resumeQuiz, tone: "emerald" as const }
        : isFinished
          ? { label: "Try Again", action: resetQuiz, tone: "emerald" as const }
          : {
              label: "Start Quiz",
              action: startQuiz,
              tone: "emerald" as const,
            };

  const primaryToneClass =
    primaryAction.tone === "emerald"
      ? "border-emerald-100/30 bg-emerald-300/20 text-emerald-50 hover:bg-emerald-300/28"
      : "border-sky-100/24 bg-sky-300/14 text-sky-50 hover:bg-sky-300/22";
  const setupPrimaryClass =
    "border-emerald-100/80 bg-emerald-300 text-slate-950 shadow-[0_0_34px_rgba(52,211,153,0.26),inset_0_1px_0_rgba(255,255,255,0.38)] hover:bg-emerald-200";
  const primaryButtonClass = isSetup ? setupPrimaryClass : primaryToneClass;
  const setupPrimaryMotion =
    isSetup && !prefersReducedMotion
      ? {
          scale: [1, 1.015, 1],
          boxShadow: [
            "0 0 22px rgba(52,211,153,0.12)",
            "0 0 38px rgba(52,211,153,0.24)",
            "0 0 22px rgba(52,211,153,0.12)",
          ],
        }
      : { scale: 1 };
  const setupPrimaryTransition =
    isSetup && !prefersReducedMotion
      ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const }
      : { type: "spring" as const, stiffness: 260, damping: 28 };

  return (
    <>
      {isExplore ? (
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute left-1/2 top-[calc(0.75rem+env(safe-area-inset-top))] z-20 flex min-h-14 w-[min(24rem,calc(100vw-1rem))] -translate-x-1/2 items-center justify-between gap-2 rounded-2xl border border-white/12 bg-zinc-950/54 px-2.5 py-2 text-white shadow-lg shadow-black/24 backdrop-blur-xl sm:hidden"
        >
          <GeoMasterBrand onOpenLanding={onOpenLanding} compact />
          <button
            type="button"
            onClick={onOpenRegionPanel}
            className="min-h-10 shrink-0 rounded-full border border-white/12 bg-white/8 px-3 text-xs font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
          >
            Choose Quiz
          </button>
        </motion.header>
      ) : (
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute left-2 right-2 top-[calc(0.75rem+env(safe-area-inset-top))] z-20 flex min-h-14 items-center justify-between gap-2 overflow-hidden rounded-2xl border border-white/12 bg-zinc-950/58 px-2.5 py-2 text-white shadow-lg shadow-black/24 backdrop-blur-xl sm:hidden"
        >
          <AnimatePresence>
            {feedbackTone && lastFeedbackEvent && !prefersReducedMotion ? (
              <HudFeedbackFlash
                tone={feedbackTone}
                sequence={lastFeedbackEvent.sequence}
              />
            ) : null}
          </AnimatePresence>
          <GeoMasterBrand onOpenLanding={onOpenLanding} compact />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/60">
              {statusLabel}
            </p>
            <p className="truncate text-sm font-semibold text-white/86">
              {isSetup ? contextLabel : `${identifiedCount}/${total}`}
            </p>
          </div>
          {showTimer ? (
            <div className="rounded-xl border border-white/10 bg-white/7 px-2.5 py-1.5 text-center">
              <p className="font-mono text-sm font-semibold tabular-nums text-white">
                {formatTime(remainingSeconds)}
              </p>
            </div>
          ) : null}
          <motion.button
            type="button"
            onClick={primaryAction.action}
            animate={setupPrimaryMotion}
            transition={setupPrimaryTransition}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition ${primaryButtonClass}`}
          >
            {isSetup ? (
              <span
                className="h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-current"
                aria-hidden="true"
              />
            ) : null}
            <span>
              {isFinished ? "Again" : primaryAction.label.replace(" Quiz", "")}
            </span>
          </motion.button>
        </motion.header>
      )}

      {isExplore ? (
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute left-1/2 top-4 z-20 hidden min-h-[3.25rem] -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/12 bg-zinc-950/48 px-2.5 py-2 text-white shadow-lg shadow-black/22 backdrop-blur-xl sm:flex"
        >
          <GeoMasterBrand onOpenLanding={onOpenLanding} />
          <button
            type="button"
            onClick={onOpenRegionPanel}
            className="min-h-11 rounded-full border border-white/12 bg-white/7 px-4 text-sm font-semibold text-white/66 transition hover:bg-white/12 hover:text-white"
          >
            Choose Quiz
          </button>
        </motion.header>
      ) : (
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute left-1/2 top-4 z-20 hidden min-h-[3.25rem] w-[min(58rem,calc(100vw-2rem))] -translate-x-1/2 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-2xl border border-white/12 bg-zinc-950/50 px-3 py-2 text-white shadow-lg shadow-black/24 backdrop-blur-xl sm:grid"
        >
          <AnimatePresence>
            {feedbackTone && lastFeedbackEvent && !prefersReducedMotion ? (
              <HudFeedbackFlash
                tone={feedbackTone}
                sequence={lastFeedbackEvent.sequence}
              />
            ) : null}
          </AnimatePresence>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/60">
              {statusLabel}
            </p>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-white/84">
                {isSetup ? region.label : `${identifiedCount}/${total}`}
              </p>
              <span className="rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-xs font-semibold text-white/58">
                {modeLabels[selectedMode]}
              </span>
              {!isIdle && !isSetup ? (
                <span className="rounded-full border border-white/10 bg-white/7 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-white/72">
                  {identifiedCount}/{total}
                </span>
              ) : null}
            </div>
            {isTargetQueueMode && modeBResults.length > 0 && !isIdle ? (
              <p className="mt-1 text-[0.68rem] font-medium text-white/60">
                Perfect {perfectCount} · Hints {assistedCount} · Missed{" "}
                {missedCount}
              </p>
            ) : null}
          </div>

          <div className="flex justify-center">
            <GeoMasterBrand onOpenLanding={onOpenLanding} />
          </div>

          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2">
            {!isIdle ? (
              <div className="hidden w-28 items-center gap-2 lg:flex">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-200 to-sky-300"
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: "spring", stiffness: 180, damping: 26 }}
                  />
                </div>
              </div>
            ) : null}
            {isFinished ? (
              <button
                type="button"
                onClick={onOpenRegionPanel}
                className="min-h-11 rounded-full border border-white/12 bg-white/7 px-4 text-sm font-semibold text-white/66 transition hover:bg-white/12 hover:text-white"
              >
                Choose Quiz
              </button>
            ) : null}
            {showTimer ? (
              <div className="min-w-16 text-right">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/58">
                  Timer
                </p>
                <p className="font-mono text-base font-semibold tabular-nums text-white">
                  {formatTime(remainingSeconds)}
                </p>
              </div>
            ) : null}
            <motion.button
              type="button"
              onClick={primaryAction.action}
              animate={setupPrimaryMotion}
              transition={setupPrimaryTransition}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition ${primaryButtonClass}`}
            >
              {isSetup ? (
                <span
                  className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current"
                  aria-hidden="true"
                />
              ) : null}
              <span>{primaryAction.label}</span>
            </motion.button>
          </div>
        </motion.header>
      )}
    </>
  );
}
