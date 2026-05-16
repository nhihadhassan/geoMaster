"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getRegionConfig,
  regionSelectorConfigs,
  type QuizRegion,
} from "@/data/countries";
import { useGameStore } from "@/store/gameStore";

export function PremiumControls() {
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedSpecialRegion = useGameStore(
    (state) => state.selectedSpecialRegion,
  );
  const gameStatus = useGameStore((state) => state.gameStatus);
  const autoHideCorrectCard = useGameStore(
    (state) => state.autoHideCorrectCard,
  );
  const selectRegion = useGameStore((state) => state.selectRegion);
  const selectSpecialRegion = useGameStore((state) => state.selectSpecialRegion);
  const setAutoHideCorrectCard = useGameStore(
    (state) => state.setAutoHideCorrectCard,
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const isCompact = gameStatus !== "idle" && !selectedSpecialRegion && !panelOpen;
  const selectedLabel = selectedSpecialRegion
    ? "Antarctica"
    : getRegionConfig(selectedRegion).label;

  useEffect(() => {
    if (gameStatus === "running" || gameStatus === "paused") {
      const timeoutId = window.setTimeout(() => setPanelOpen(false), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [gameStatus]);

  if (isCompact) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -14, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onClick={() => setPanelOpen(true)}
      className="absolute bottom-24 left-3 z-20 rounded-full border border-white/14 bg-black/42 px-4 py-2 text-sm font-semibold text-white/72 shadow-2xl shadow-black/35 backdrop-blur-2xl transition hover:bg-black/52 hover:text-white sm:bottom-28 sm:left-5"
      >
        Regions · {selectedLabel}
      </motion.button>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -18, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute inset-x-3 bottom-24 z-20 max-h-[min(68dvh,32rem)] overflow-y-auto rounded-3xl border border-white/14 bg-black/38 p-3 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl sm:inset-x-auto sm:bottom-28 sm:left-5 sm:w-[min(21rem,calc(100vw-2.5rem))] sm:max-h-[calc(100vh-12rem)]"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/44">
            Region
          </p>
          {gameStatus !== "idle" ? (
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="rounded-full border border-white/10 bg-white/7 px-2.5 py-1 text-xs font-semibold text-white/52 transition hover:bg-white/12 hover:text-white"
            >
              Minimize
            </button>
          ) : null}
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {regionSelectorConfigs.map((region) => {
            const config =
              region.id === "antarctica" ? null : getRegionConfig(region.id);
            const isSelected =
              region.id !== "antarctica" && selectedRegion === region.id;

            return (
              <button
                key={region.id}
                type="button"
                onClick={() => {
                  if (!region.enabled) {
                    return;
                  }

                  if (region.id === "antarctica") {
                    selectSpecialRegion("antarctica");
                  } else {
                    selectRegion(region.id as QuizRegion);
                  }
                }}
                disabled={
                  gameStatus === "running" ||
                  gameStatus === "paused" ||
                  !region.enabled
                }
                className={`rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${
                  isSelected || selectedSpecialRegion === region.id
                    ? "border-emerald-100/40 bg-emerald-200/18 text-emerald-50"
                    : region.enabled
                      ? "border-white/10 bg-white/7 text-white/58 hover:text-white"
                      : "border-white/7 bg-white/[0.03] text-white/30"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <span>{config?.label ?? region.label}</span>
                <span className="ml-2 text-xs font-medium text-white/44">
                  {region.count > 0 ? `${region.count} countries` : region.note}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-3 border-t border-white/10 pt-3">
        <button
          type="button"
          role="switch"
          aria-checked={autoHideCorrectCard}
          onClick={() => setAutoHideCorrectCard(!autoHideCorrectCard)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/7 px-3 py-2 text-left transition hover:bg-white/12"
        >
          <span>
            <span className="block text-sm font-semibold text-white/72">
              Auto-hide info card
            </span>
            <span className="block text-xs text-white/40">
              Keep country facts visible when off
            </span>
          </span>
          <span
            className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
              autoHideCorrectCard
                ? "border-emerald-200/40 bg-emerald-300/28"
                : "border-white/14 bg-white/10"
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
                autoHideCorrectCard ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>
      </div>
    </motion.aside>
  );
}
