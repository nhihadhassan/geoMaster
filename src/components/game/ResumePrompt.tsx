"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  emeraldCtaClass,
  emeraldCtaGlowClass,
} from "@/components/game/QuizCta";
import { getRegionConfig } from "@/data/countries";
import { modeLabels } from "@/data/gameModes";
import type { QuizProgressSnapshot } from "@/store/gameStore";
import { formatTime } from "@/utils/formatTime";

type ResumePromptProps = {
  snapshot: QuizProgressSnapshot;
  onResume: () => void;
  onDiscard: () => void;
};

export function ResumePrompt({
  snapshot,
  onResume,
  onDiscard,
}: ResumePromptProps) {
  const prefersReducedMotion = useReducedMotion();
  const regionLabel = getRegionConfig(snapshot.region).label;

  return (
    <motion.aside
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute left-1/2 top-[calc(5.25rem+env(safe-area-inset-top))] z-30 w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-3xl border border-emerald-100/22 bg-zinc-950/72 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl"
      role="dialog"
      aria-modal="false"
      aria-label="Resume saved quiz"
    >
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-emerald-100/64">
        Quiz in progress
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">
        Pick up where you left off?
      </h2>
      <p className="mt-1 text-sm leading-5 text-white/64">
        {regionLabel} · {modeLabels[snapshot.mode]} — found {snapshot.score} of{" "}
        {snapshot.total}, {formatTime(snapshot.remainingSeconds)} left.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onResume}
          className={`min-h-11 flex-1 rounded-full px-4 text-sm font-semibold ${emeraldCtaClass} ${emeraldCtaGlowClass}`}
        >
          Resume Quiz
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="min-h-11 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
        >
          Discard
        </button>
      </div>
    </motion.aside>
  );
}
