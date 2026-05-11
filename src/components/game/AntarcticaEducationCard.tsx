"use client";

import { motion } from "framer-motion";

type AntarcticaEducationCardProps = {
  onBack: () => void;
};

const facts = [
  "Antarctica has no sovereign countries.",
  "It is governed through the Antarctic Treaty System.",
  "It is the coldest, driest, and windiest continent.",
  "It contains most of the world's freshwater ice.",
  "It is used mainly for scientific research.",
  "Research stations are operated by many countries.",
  "It has no permanent civilian population.",
];

export function AntarcticaEducationCard({
  onBack,
}: AntarcticaEducationCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="absolute left-1/2 top-1/2 z-30 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-cyan-100/18 bg-black/58 text-white shadow-2xl shadow-cyan-950/35 backdrop-blur-3xl"
    >
      <div className="border-b border-white/10 bg-white/7 px-6 py-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/64">
          Educational Region
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Antarctica
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/62">
          A continent for learning, not a sovereign-country quiz.
        </p>
      </div>
      <div className="space-y-3 px-6 py-5">
        {facts.map((fact) => (
          <div
            key={fact}
            className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-sm leading-5 text-white/74"
          >
            {fact}
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-white/10 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-cyan-100/24 bg-cyan-200/14 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/22"
        >
          Back to Regions
        </button>
      </div>
    </motion.section>
  );
}
