"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import type { Country } from "@/data/countries";

type CountryPopupProps = {
  country: Country | null;
  feedbackSequence: number;
};

export function CountryPopup({
  country,
  feedbackSequence,
}: CountryPopupProps) {
  return (
    <AnimatePresence>
      {country ? (
        <motion.aside
          key={`${country.iso_a3}-${feedbackSequence}`}
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [14, 0, 0, 10],
            scale: [0.96, 1, 1, 0.98],
          }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{
            duration: 7,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.05, 0.9, 1],
          }}
          className="pointer-events-none absolute inset-x-4 bottom-28 z-30 mx-auto w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-emerald-100/22 bg-black/52 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl"
        >
          <div className="flex items-center gap-4 p-4">
            <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 shadow-inner">
              <img
                src={country.flag}
                alt={`${country.name} flag`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
                Correct
              </p>
              <h2 className="truncate text-xl font-semibold text-white">
                {country.name}
              </h2>
              <p className="mt-1 text-sm text-white/64">
                Capital: {country.capital}
              </p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-lime-200 to-sky-300" />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
