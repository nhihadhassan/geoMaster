"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { CountryEducationCard } from "@/components/game/CountryEducationCard";
import type { Country } from "@/data/countries";
import { useOverlayFocus } from "@/hooks/useOverlayFocus";
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
  const mobileDetailsRef = useRef<HTMLElement | null>(null);
  const mobileDetailsOpen =
    mobileDetailsState.key === popupKey && mobileDetailsState.open;
  const closeMobileDetails = useCallback(() => {
    setMobileDetailsState({ key: popupKey, open: false });
  }, [popupKey]);

  useOverlayFocus(
    mobileDetailsOpen && !autoHide,
    mobileDetailsRef,
    closeMobileDetails,
  );

  if (!country) {
    return null;
  }

  const pointerClass =
    autoHide && !mobileDetailsOpen
      ? "pointer-events-none"
      : "pointer-events-auto";
  const flag = getCountryFlagDisplay(country);
  const capitalLabel = country.capital
    ? `Capital: ${country.capital}`
    : "Capital unavailable";

  return (
    <>
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
                duration: 4.2,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.08, 0.86, 1],
              }
            : { type: "spring", stiffness: 260, damping: 28 }
        }
        onAnimationComplete={() => {
          if (autoHide) {
            onClose();
          }
        }}
        className={`${pointerClass} absolute inset-x-2 top-[calc(4.65rem+env(safe-area-inset-top))] z-30 mx-auto max-h-24 w-[min(25rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-emerald-100/20 bg-zinc-950/70 text-white shadow-xl shadow-emerald-950/28 backdrop-blur-2xl sm:inset-x-auto sm:right-5 sm:top-28 sm:mx-0 sm:max-h-[calc(100vh-8rem)] sm:w-[24rem] sm:overflow-y-auto sm:rounded-3xl`}
        role={autoHide ? "status" : "region"}
        aria-live="polite"
        aria-label={
          autoHide ? undefined : `${country.name} correct answer feedback`
        }
      >
        <div className="sm:hidden">
          <div className="flex min-h-20 items-center gap-3 px-3 py-2.5">
            <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/15 bg-white/8 text-xl shadow-inner">
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
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-emerald-200/78">
                Correct
              </p>
              <h2 className="truncate text-base font-semibold leading-5 text-white">
                {country.name}
              </h2>
              <p className="truncate text-xs text-white/62">{capitalLabel}</p>
            </div>
            {!autoHide ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobileDetailsState((state) => ({
                      key: popupKey,
                      open: state.key === popupKey ? !state.open : true,
                    }))
                  }
                  className="pointer-events-auto min-h-11 rounded-full border border-white/12 bg-white/8 px-4 text-xs font-semibold text-white/72 transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200/70"
                  aria-expanded={mobileDetailsOpen}
                  aria-controls={`${popupKey}-mobile-details`}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/12 bg-white/8 text-lg leading-none text-white/70 transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200/70"
                  aria-label="Close country info card"
                >
                  ×
                </button>
              </div>
            ) : null}
          </div>
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
              <p className="mt-1 text-sm text-white/64">{capitalLabel}</p>
            </div>
            {!autoHide ? (
              <button
                type="button"
                onClick={onClose}
                className="pointer-events-auto ml-auto grid size-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/8 text-lg leading-none text-white/70 transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200/70"
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

      <AnimatePresence>
        {mobileDetailsOpen && !autoHide ? (
          <motion.aside
            key={`${popupKey}-mobile-details`}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="pointer-events-auto absolute inset-x-2 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-40 max-h-[62dvh] overflow-hidden rounded-3xl border border-white/12 bg-zinc-950/82 text-white shadow-2xl shadow-black/36 backdrop-blur-2xl sm:hidden"
            id={`${popupKey}-mobile-details`}
            role="dialog"
            ref={mobileDetailsRef}
            aria-modal="true"
            aria-label={`${country.name} details`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/88 px-3 py-3 backdrop-blur-2xl">
              <div className="min-w-0">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-emerald-100/68">
                  Country details
                </p>
                <p className="truncate text-sm font-semibold text-white/82">
                  {country.name}
                </p>
              </div>
              <button
                type="button"
                onClick={closeMobileDetails}
                className="min-h-11 rounded-full border border-white/12 bg-white/8 px-4 text-xs font-semibold text-white/74 transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200/70"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(62dvh-4rem)] overflow-y-auto px-3 pb-3 pt-2">
              <CountryEducationCard country={country} variant="popup" />
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
