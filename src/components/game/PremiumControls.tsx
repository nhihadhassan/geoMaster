"use client";

import { motion } from "framer-motion";
import { getRegionConfig, type QuizRegion } from "@/data/countries";
import { useGameStore } from "@/store/gameStore";

const regions: QuizRegion[] = ["south-america", "north-america"];

export function PremiumControls() {
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const selectRegion = useGameStore((state) => state.selectRegion);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -18, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute bottom-28 left-5 z-20 w-[min(21rem,calc(100vw-2.5rem))] rounded-3xl border border-white/14 bg-black/38 p-3 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl"
    >
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/44">
          Region
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {regions.map((region) => {
            const config = getRegionConfig(region);

            return (
              <button
                key={region}
                type="button"
                onClick={() => selectRegion(region)}
                disabled={gameStatus === "running"}
                className={`rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${
                  selectedRegion === region
                    ? "border-emerald-100/40 bg-emerald-200/18 text-emerald-50"
                    : "border-white/10 bg-white/7 text-white/58 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <span>{config.label}</span>
                <span className="ml-2 text-xs font-medium text-white/44">
                  {region === "south-america" ? "12" : "23"} countries
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
