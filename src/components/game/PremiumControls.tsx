"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getRegionConfig,
  regionSelectorConfigs,
  type QuizRegion,
} from "@/data/countries";
import { useGameStore, type GameMode } from "@/store/gameStore";

const modeLabels: Record<GameMode, string> = {
  "type-to-fill": "Type",
  "identify-shaded": "Identify",
  "click-country": "Map Click",
  "capital-challenge": "Capital",
};

const modeDescriptions: Record<GameMode, string> = {
  "type-to-fill": "Name countries to fill the map.",
  "identify-shaded": "Name the highlighted country.",
  "click-country": "Tap the prompted country.",
  "capital-challenge": "Answer from the capital.",
};

export function PremiumControls() {
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedSpecialRegion = useGameStore(
    (state) => state.selectedSpecialRegion,
  );
  const selectedMode = useGameStore((state) => state.selectedMode);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const autoHideCorrectCard = useGameStore(
    (state) => state.autoHideCorrectCard,
  );
  const selectRegion = useGameStore((state) => state.selectRegion);
  const selectSpecialRegion = useGameStore((state) => state.selectSpecialRegion);
  const selectMode = useGameStore((state) => state.selectMode);
  const setAutoHideCorrectCard = useGameStore(
    (state) => state.setAutoHideCorrectCard,
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"region" | "mode">(
    "region",
  );
  const isQuizLocked = gameStatus === "running" || gameStatus === "paused";
  const isCompact = gameStatus !== "idle" && !selectedSpecialRegion && !panelOpen;
  const selectedLabel = selectedSpecialRegion
    ? "Antarctica"
    : getRegionConfig(selectedRegion).label;

  useEffect(() => {
    if (isQuizLocked) {
      const timeoutId = window.setTimeout(() => setPanelOpen(false), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isQuizLocked]);

  const compactChip = (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      onClick={() => {
        if (!isQuizLocked) {
          setPanelOpen(true);
        }
      }}
      disabled={isQuizLocked}
      className="absolute bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-20 min-h-11 max-w-[calc(100vw-1.5rem)] rounded-full border border-white/12 bg-zinc-950/58 px-4 py-2 text-sm font-semibold text-white/76 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:bg-zinc-950/68 hover:text-white disabled:cursor-default disabled:opacity-78 sm:bottom-28 sm:left-5"
      aria-label={
        isQuizLocked
          ? `Region locked during quiz: ${selectedLabel}`
          : "Open region and mode menu"
      }
    >
      <span className="block truncate">
        Region · {selectedLabel}
        <span className="ml-2 text-white/42">
          Mode · {modeLabels[selectedMode]}
        </span>
      </span>
    </motion.button>
  );

  const regionOptions = (
    <div className="grid grid-cols-1 gap-2">
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
            disabled={isQuizLocked || !region.enabled}
            className={`min-h-11 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${
              isSelected || selectedSpecialRegion === region.id
                ? "border-emerald-100/36 bg-emerald-300/16 text-emerald-50"
                : region.enabled
                  ? "border-white/10 bg-white/[0.055] text-white/64 hover:bg-white/10 hover:text-white"
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
  );

  const modeOptions = (
    <div className="grid gap-2">
      {(Object.keys(modeLabels) as GameMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => selectMode(mode)}
          disabled={isQuizLocked}
          className={`min-h-12 rounded-2xl border px-3 py-2 text-left transition ${
            selectedMode === mode
              ? "border-cyan-100/34 bg-cyan-300/16 text-cyan-50"
              : "border-white/10 bg-white/[0.055] text-white/66 hover:bg-white/10 hover:text-white"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          <span className="block text-sm font-semibold">{modeLabels[mode]}</span>
          <span className="mt-0.5 block text-xs text-white/44">
            {modeDescriptions[mode]}
          </span>
        </button>
      ))}
    </div>
  );

  const autoHideToggle = (
    <button
      type="button"
      role="switch"
      aria-checked={autoHideCorrectCard}
      onClick={() => setAutoHideCorrectCard(!autoHideCorrectCard)}
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/7 px-3 py-2 text-left transition hover:bg-white/12"
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
  );

  if (isCompact) {
    return (
      <>
        <span className="sm:hidden">{compactChip}</span>
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -14, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          onClick={() => setPanelOpen(true)}
          className="absolute bottom-28 left-5 z-20 hidden rounded-full border border-white/12 bg-zinc-950/52 px-4 py-2 text-sm font-semibold text-white/70 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:bg-zinc-950/64 hover:text-white sm:block"
        >
          Regions · {selectedLabel}
        </motion.button>
      </>
    );
  }

  return (
    <>
      {!panelOpen ? <span className="sm:hidden">{compactChip}</span> : null}
      {panelOpen ? (
        <motion.aside
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute inset-x-2 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 max-h-[55dvh] overflow-hidden rounded-3xl border border-white/12 bg-zinc-950/72 text-white shadow-2xl shadow-black/36 backdrop-blur-2xl sm:hidden"
          role="dialog"
          aria-label="Region and mode menu"
        >
          <div className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/82 px-3 pb-3 pt-2 backdrop-blur-2xl">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/22" />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/44">
                  Setup
                </p>
                <p className="truncate text-sm font-semibold text-white/76">
                  {selectedLabel} · {modeLabels[selectedMode]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="min-h-11 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
              >
                Done
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/6 p-1">
              {(["region", "mode"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveMobileTab(tab)}
                  className={`min-h-10 rounded-full px-3 text-sm font-semibold capitalize transition ${
                    activeMobileTab === tab
                      ? "bg-white text-slate-950"
                      : "text-white/58 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[calc(55dvh-7.75rem)] overflow-y-auto px-3 py-3">
            {activeMobileTab === "region" ? regionOptions : modeOptions}
            <div className="mt-3 border-t border-white/10 pt-3">
              {autoHideToggle}
            </div>
          </div>
        </motion.aside>
      ) : null}

      <motion.aside
        initial={{ opacity: 0, x: -18, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="absolute bottom-28 left-5 z-20 hidden max-h-[calc(100vh-12rem)] w-[min(20rem,calc(100vw-2.5rem))] overflow-y-auto rounded-3xl border border-white/12 bg-zinc-950/56 p-3 text-white shadow-xl shadow-black/30 backdrop-blur-xl sm:block"
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
          <div className="mt-2">{regionOptions}</div>
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          {autoHideToggle}
        </div>
      </motion.aside>
    </>
  );
}
