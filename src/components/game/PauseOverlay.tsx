"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useGameStore } from "@/store/gameStore";

export function PauseOverlay() {
  const resumeQuiz = useGameStore((state) => state.resumeQuiz);
  const resetQuiz = useGameStore((state) => state.resetQuiz);
  const giveUp = useGameStore((state) => state.giveUp);
  const backToRegionSelect = useGameStore((state) => state.backToRegionSelect);
  const [confirmingExit, setConfirmingExit] = useState(false);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 grid items-end bg-slate-950/38 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:place-items-center sm:px-4 sm:pb-0"
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
        className="pointer-events-auto w-full rounded-3xl border border-white/16 bg-zinc-950/76 p-4 text-center text-white shadow-xl shadow-black/36 backdrop-blur-2xl sm:w-[min(32rem,calc(100vw-2rem))] sm:p-5"
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
        {confirmingExit ? (
          <div className="mt-5">
            <p className="text-sm font-medium leading-5 text-white/74">
              Leave this quiz and choose another? Your current progress will be
              lost.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setConfirmingExit(false)}
                className="min-h-11 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
              >
                Keep Playing
              </button>
              <button
                type="button"
                onClick={backToRegionSelect}
                className="min-h-11 rounded-full border border-rose-200/24 bg-rose-300/14 px-4 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/22"
              >
                Discard &amp; Exit
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={resumeQuiz}
              className="min-h-11 rounded-full border border-emerald-100/30 bg-emerald-300/20 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/28"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={resetQuiz}
              className="min-h-11 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
            >
              Restart
            </button>
            <button
              type="button"
              onClick={giveUp}
              className="min-h-11 rounded-full border border-rose-200/24 bg-rose-300/14 px-4 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/22"
            >
              End Quiz
            </button>
            <button
              type="button"
              onClick={() => setConfirmingExit(true)}
              className="min-h-11 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
            >
              Exit Quiz
            </button>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
