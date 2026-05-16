"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

export function PauseOverlay() {
  const resumeQuiz = useGameStore((state) => state.resumeQuiz);
  const resetQuiz = useGameStore((state) => state.resetQuiz);
  const backToRegionSelect = useGameStore((state) => state.backToRegionSelect);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-slate-950/42 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="pointer-events-auto w-[min(28rem,calc(100vw-2rem))] rounded-[2rem] border border-white/16 bg-black/62 p-5 text-center text-white shadow-2xl shadow-black/45 backdrop-blur-3xl"
      >
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-sky-100/64">
          Paused
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Take your time.
        </h2>
        <p className="mt-2 text-sm leading-5 text-white/58">
          The timer is stopped and answers are disabled until you resume.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={resumeQuiz}
            className="rounded-full border border-emerald-100/30 bg-emerald-300/20 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/28"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={resetQuiz}
            className="rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={backToRegionSelect}
            className="rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
          >
            Regions
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
