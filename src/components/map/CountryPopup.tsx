"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { CountryEducationCard } from "@/components/game/CountryEducationCard";
import type { Country } from "@/data/countries";
import { getCountryFlagDisplay } from "@/utils/countryFlags";

type CountryPopupProps = {
  country: Country | null;
  feedbackSequence: number;
  autoHide: boolean;
  onClose: () => void;
};

export function CountryPopup({
  country,
  feedbackSequence,
  autoHide,
  onClose,
}: CountryPopupProps) {
  if (!country) {
    return null;
  }

  const flag = getCountryFlagDisplay(country);

  return (
    <motion.aside
      key={`${country.iso_a3}-${feedbackSequence}`}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={
        autoHide
          ? {
              opacity: [0, 1, 1, 0],
              y: [14, 0, 0, 10],
              scale: [0.96, 1, 1, 0.98],
            }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={
        autoHide
          ? {
              duration: 8,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.05, 0.9, 1],
            }
          : { type: "spring", stiffness: 260, damping: 28 }
      }
      onAnimationComplete={() => {
        if (autoHide) {
          onClose();
        }
      }}
      className="pointer-events-none absolute inset-x-4 top-24 z-30 mx-auto max-h-[calc(100vh-8rem)] w-[min(31rem,calc(100vw-2rem))] overflow-y-auto overflow-x-hidden rounded-3xl border border-emerald-100/20 bg-zinc-950/68 shadow-xl shadow-emerald-950/28 backdrop-blur-2xl md:inset-x-auto md:right-5 md:top-28 md:mx-0 md:w-[24rem]"
    >
      <div className="flex items-center gap-4 px-4 pt-4">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 text-3xl shadow-inner">
          {flag.src ? (
            <img
              src={flag.src}
              alt={`${country.name} flag`}
              className="col-start-1 row-start-1 z-10 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <span className="col-start-1 row-start-1" aria-hidden="true">
            {flag.fallback}
          </span>
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
        {!autoHide ? (
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto ml-auto grid size-8 shrink-0 place-items-center rounded-full border border-white/12 bg-white/8 text-lg leading-none text-white/62 transition hover:bg-white/14 hover:text-white"
            aria-label="Close country info card"
          >
            ×
          </button>
        ) : null}
      </div>
      <div className="px-4 pb-4">
        <CountryEducationCard country={country} variant="popup" />
      </div>
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-lime-200 to-sky-300" />
    </motion.aside>
  );
}
