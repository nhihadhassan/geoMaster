"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Country } from "@/data/countries";
import type { GameMode } from "@/store/gameStore";

type TargetHintCardProps = {
  mode: Extract<
    GameMode,
    "identify-shaded" | "click-country" | "capital-challenge"
  >;
  targetCountry: Country | null;
  smartHint: string | null;
  currentTargetHints: string[];
  attemptCount: number;
  capitalHintEnabled: boolean;
  onCapitalHintChange: (enabled: boolean) => void;
};

export function TargetHintCard({
  mode,
  targetCountry,
  smartHint,
  currentTargetHints,
  attemptCount,
  capitalHintEnabled,
  onCapitalHintChange,
}: TargetHintCardProps) {
  const [mobilePanel, setMobilePanel] = useState<{
    countryId: string | null;
    expanded: boolean;
  }>({ countryId: null, expanded: false });

  if (!targetCountry) {
    return null;
  }

  const mobileExpanded =
    mobilePanel.countryId === targetCountry.iso_a3 && mobilePanel.expanded;
  const prompt =
    mode === "click-country"
      ? `Find ${targetCountry.name}`
      : mode === "capital-challenge"
        ? `Capital: ${targetCountry.capital}`
        : "Name the highlighted country.";
  const instructions =
    mode === "click-country"
      ? "Tap the country on the map."
      : mode === "capital-challenge"
        ? "Type the country that uses this capital."
        : "Use the pulsing shape on the map as your prompt.";
  const hasHints =
    mode === "identify-shaded" || currentTargetHints.length > 0 || smartHint;

  return (
    <>
      <motion.aside
        key={`${targetCountry.iso_a3}-mobile`}
        initial={{ opacity: 0, y: -10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 30,
        }}
        className="absolute inset-x-3 top-[calc(5.1rem+env(safe-area-inset-top))] z-20 rounded-3xl border border-cyan-200/16 bg-zinc-950/62 p-2.5 text-white shadow-xl shadow-cyan-950/24 backdrop-blur-xl sm:hidden"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-cyan-100/60">
              {mode === "click-country"
                ? "Map Click"
                : mode === "capital-challenge"
                  ? "Capital"
                  : "Identify"}
            </p>
            <p className="mt-1 truncate text-sm font-semibold leading-tight text-white">
              {prompt}
            </p>
          </div>
          {hasHints ? (
            <button
              type="button"
              onClick={() =>
                setMobilePanel((panel) => ({
                  countryId: targetCountry.iso_a3,
                  expanded:
                    panel.countryId === targetCountry.iso_a3
                      ? !panel.expanded
                      : true,
                }))
              }
              className="min-h-11 shrink-0 rounded-full border border-white/12 bg-white/8 px-4 text-xs font-semibold text-white/74 transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200/70"
              aria-expanded={mobileExpanded}
            >
              {mobileExpanded ? "Close" : "Hints"}
            </button>
          ) : null}
        </div>
        <AnimatePresence>
          {mobileExpanded ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="mt-3 space-y-3 border-t border-white/10 pt-3"
            >
              <p className="text-sm leading-5 text-white/62">{instructions}</p>
              <p className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white/64">
                Attempt {Math.min(attemptCount + 1, 3)} / 3
              </p>
              {mode === "identify-shaded" ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={capitalHintEnabled}
                  onClick={() => onCapitalHintChange(!capitalHintEnabled)}
                  className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-white/12 bg-white/8 px-3 py-2 text-left transition hover:bg-white/12"
                >
                  <span>
                    <span className="block text-sm font-semibold text-white/84">
                      Show capital hint
                    </span>
                    <span className="block text-xs text-white/58">
                      Optional helper
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
              ) : null}
              {mode === "identify-shaded" && capitalHintEnabled ? (
                <p className="rounded-2xl border border-cyan-100/18 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-50">
                  Capital: {targetCountry.capital}
                </p>
              ) : null}
              {currentTargetHints.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-amber-200/20 bg-amber-300/10 px-3 py-3 text-sm font-medium text-amber-100">
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
                </div>
              ) : smartHint ? (
                <p className="rounded-2xl border border-amber-200/20 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100">
                  {smartHint}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.aside>

      <motion.aside
        key={`${targetCountry.iso_a3}-desktop`}
        initial={{ opacity: 0, x: -24, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 30,
        }}
        className="absolute left-5 top-28 z-20 hidden w-[min(20rem,calc(100vw-2.5rem))] rounded-3xl border border-cyan-200/16 bg-zinc-950/58 p-4 text-white shadow-xl shadow-cyan-950/24 backdrop-blur-xl sm:block"
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cyan-100/60">
          {mode === "click-country"
            ? "Map Click"
            : mode === "capital-challenge"
              ? "Capital Challenge"
              : "Identify"}
        </p>
        <p className="mt-3 text-lg font-semibold leading-tight text-white">
          {prompt}
        </p>
        <p className="mt-2 text-sm leading-5 text-white/58">{instructions}</p>
        <p className="mt-3 inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white/64">
          Attempt {Math.min(attemptCount + 1, 3)} / 3
        </p>
        {mode === "identify-shaded" ? (
          <button
            type="button"
            role="switch"
            aria-checked={capitalHintEnabled}
            onClick={() => onCapitalHintChange(!capitalHintEnabled)}
            className="mt-4 flex min-h-11 w-full items-center justify-between rounded-2xl border border-white/12 bg-white/8 px-3 py-2 text-left transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200/70"
          >
            <span>
              <span className="block text-sm font-semibold text-white/84">
                Show capital hint
              </span>
              <span className="block text-xs text-white/58">
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
        ) : null}
        <AnimatePresence>
          {mode === "identify-shaded" && capitalHintEnabled ? (
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
    </>
  );
}
