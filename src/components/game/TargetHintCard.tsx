"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Country } from "@/data/countries";

type TargetHintCardProps = {
  targetCountry: Country | null;
  smartHint: string | null;
  currentTargetHints: string[];
  capitalHintEnabled: boolean;
  onCapitalHintChange: (enabled: boolean) => void;
};

export function TargetHintCard({
  targetCountry,
  smartHint,
  currentTargetHints,
  capitalHintEnabled,
  onCapitalHintChange,
}: TargetHintCardProps) {
  if (!targetCountry) {
    return null;
  }

  return (
    <motion.aside
      key={targetCountry.iso_a3}
      initial={{ opacity: 0, x: -24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 30,
      }}
      className="absolute left-5 top-28 z-20 w-[min(20rem,calc(100vw-2.5rem))] rounded-3xl border border-cyan-200/18 bg-black/42 p-4 text-white shadow-2xl shadow-cyan-950/35 backdrop-blur-2xl"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cyan-100/60">
        Identify
      </p>
      <p className="mt-3 text-lg font-semibold leading-tight text-white">
        Name the highlighted country.
      </p>
      <p className="mt-2 text-sm leading-5 text-white/58">
        Use the pulsing shape on the map as your prompt.
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={capitalHintEnabled}
        onClick={() => onCapitalHintChange(!capitalHintEnabled)}
        className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/12 bg-white/8 px-3 py-2 text-left transition hover:bg-white/12"
      >
        <span>
          <span className="block text-sm font-semibold text-white/84">
            Show capital hint
          </span>
          <span className="block text-xs text-white/46">
            Optional helper, not the answer
          </span>
        </span>
        <span
          className={`relative h-6 w-11 rounded-full border transition ${
            capitalHintEnabled
              ? "border-cyan-200/40 bg-cyan-300/28"
              : "border-white/14 bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
              capitalHintEnabled ? "left-6" : "left-1"
            }`}
          />
        </span>
      </button>
      <AnimatePresence>
        {capitalHintEnabled ? (
          <motion.p
            key={`${targetCountry.iso_a3}-capital`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="mt-3 rounded-2xl border border-cyan-100/18 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-50"
          >
            Capital: {targetCountry.capital}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {currentTargetHints.length > 0 ? (
          <motion.div
            key={targetCountry.iso_a3}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="mt-4 space-y-2 rounded-2xl border border-amber-200/20 bg-amber-300/10 px-3 py-3 text-sm font-medium text-amber-100"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-amber-100/54">
              Hints
            </p>
            <ul className="space-y-1.5">
              {currentTargetHints.map((hint) => (
                <li key={hint} className="flex gap-2">
                  <span className="text-amber-100/44">-</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : smartHint ? (
          <motion.p
            key={smartHint}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100"
          >
            {smartHint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.aside>
  );
}
