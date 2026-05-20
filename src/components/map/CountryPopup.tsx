"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import { useState } from "react";
import { CountryEducationCard } from "@/components/game/CountryEducationCard";
import type { Country } from "@/data/countries";
import { formatCountryEducation } from "@/utils/countryEducation";
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
  const popupKey = country ? `${country.iso_a3}-${feedbackSequence}` : "empty";
  const [mobileDetailsState, setMobileDetailsState] = useState({
    key: popupKey,
    open: false,
  });

  if (!country) {
    return null;
  }

  const mobileDetailsOpen =
    mobileDetailsState.key === popupKey && mobileDetailsState.open;
  const pointerClass =
    autoHide && !mobileDetailsOpen ? "pointer-events-none" : "pointer-events-auto";
  const flag = getCountryFlagDisplay(country);
  const education = formatCountryEducation(country);

  return (
    <motion.aside
      key={popupKey}
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
              duration: 6.5,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.06, 0.88, 1],
            }
          : { type: "spring", stiffness: 260, damping: 28 }
      }
      onAnimationComplete={() => {
        if (autoHide) {
          onClose();
        }
      }}
      className={`${pointerClass} absolute inset-x-2 top-[calc(4.9rem+env(safe-area-inset-top))] z-30 mx-auto w-[min(26rem,calc(100vw-1rem))] rounded-2xl border border-emerald-100/20 bg-zinc-950/70 text-white shadow-xl shadow-emerald-950/28 backdrop-blur-2xl sm:inset-x-auto sm:right-5 sm:top-28 sm:mx-0 sm:max-h-[calc(100vh-8rem)] sm:w-[24rem] sm:overflow-y-auto sm:rounded-3xl ${
        mobileDetailsOpen ? "max-h-[70dvh] overflow-y-auto" : "max-h-32 overflow-hidden"
      }`}
    >
      <div className="sm:hidden">
        <div className="flex min-h-[6.25rem] items-center gap-3 px-3 py-3">
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 text-2xl shadow-inner">
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
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-emerald-200/78">
              Correct
            </p>
            <h2 className="truncate text-lg font-semibold leading-6 text-white">
              {country.name}
            </h2>
            <p className="truncate text-sm text-white/62">
              Capital: {country.capital}
            </p>
            {mobileDetailsOpen ? null : (
              <p className="mt-1 truncate text-xs leading-4 text-white/46">
                {education.featuredFunFact}
              </p>
            )}
          </div>
          {!autoHide ? (
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  setMobileDetailsState((state) => ({
                    key: popupKey,
                    open: state.key === popupKey ? !state.open : true,
                  }))
                }
                className="pointer-events-auto min-h-9 rounded-full border border-white/12 bg-white/8 px-3 text-xs font-semibold text-white/68 transition hover:bg-white/14 hover:text-white"
              >
                {mobileDetailsOpen ? "Less" : "Details"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="pointer-events-auto grid size-9 place-items-center rounded-full border border-white/12 bg-white/8 text-lg leading-none text-white/62 transition hover:bg-white/14 hover:text-white"
                aria-label="Close country info card"
              >
                ×
              </button>
            </div>
          ) : null}
        </div>
        {mobileDetailsOpen ? (
          <div className="pointer-events-auto border-t border-white/10 px-3 pb-3">
            <CountryEducationCard country={country} variant="popup" />
          </div>
        ) : null}
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-lime-200 to-sky-300" />
      </div>

      <div className="hidden sm:block">
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
        <div className="pointer-events-auto px-4 pb-4">
          <CountryEducationCard country={country} variant="popup" />
        </div>
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-lime-200 to-sky-300" />
      </div>
    </motion.aside>
  );
}
