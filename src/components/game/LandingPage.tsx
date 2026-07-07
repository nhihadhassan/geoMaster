"use client";

import { motion, useReducedMotion } from "framer-motion";
import { emeraldCtaClass } from "@/components/game/QuizCta";

import { Globe, type GlobeConfig } from "@/components/ui/globe";

type LandingPageProps = {
  onStartQuiz: () => void;
  onExploreMap: () => void;
  hasActiveQuiz?: boolean;
  onResumeQuiz?: () => void;
};

const HERO_GLOBE_CONFIG: GlobeConfig = {
  width: 1000,
  height: 1000,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0.16,
  theta: 0.24,
  dark: 1,
  diffuse: 0.9,
  mapSamples: 20000,
  mapBrightness: 5.8,
  baseColor: [0.1, 0.24, 0.38],
  markerColor: [0.2, 0.83, 0.68],
  glowColor: [0.08, 0.56, 0.68],
  markers: [
    { location: [43.6532, -79.3832], size: 0.08 },
    { location: [40.7128, -74.006], size: 0.09 },
    { location: [19.4326, -99.1332], size: 0.07 },
    { location: [-23.5505, -46.6333], size: 0.09 },
    { location: [51.5072, -0.1276], size: 0.08 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [28.6139, 77.209], size: 0.08 },
    { location: [35.6762, 139.6503], size: 0.08 },
    { location: [-33.8688, 151.2093], size: 0.07 },
    { location: [1.3521, 103.8198], size: 0.06 },
  ],
};

const heroStats = [
  "196 countries",
  "4 quiz modes",
  "Atlas exploration",
];

export function LandingPage({
  onStartQuiz,
  onExploreMap,
  hasActiveQuiz = false,
  onResumeQuiz,
}: LandingPageProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className="absolute inset-0 z-50 overflow-hidden bg-[#05080c] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.28 }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,8,12,0.98)_0%,rgba(5,8,12,0.8)_36%,rgba(5,8,12,0.36)_63%,rgba(5,8,12,0.82)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-cyan-200/28" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,rgba(5,8,12,0.96),rgba(5,8,12,0))]" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute left-1/2 top-1/2 h-[min(84vh,860px)] w-[min(84vh,860px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/10" />
        <div className="absolute left-1/2 top-1/2 h-[min(62vh,640px)] w-[min(62vh,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/10" />
      </motion.div>

      <Globe
        className="bottom-auto left-auto right-[-32vw] top-[6vh] z-0 max-w-none opacity-90 sm:right-[-18vw] sm:top-[-4vh] sm:w-[86vw] lg:right-[-10vw] lg:top-[-11vh] lg:w-[72vw] xl:right-[-6vw] xl:w-[68vw]"
        config={HERO_GLOBE_CONFIG}
      />

      <div className="relative z-10 flex h-full min-h-dvh overflow-y-auto px-4 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto grid min-h-full w-full max-w-7xl items-end gap-8 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-24 sm:items-center sm:pb-10 sm:pt-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(20rem,0.78fr)]">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/72">
              Living atlas console
            </p>
            <h1 className="mt-5 text-6xl font-semibold leading-none text-slate-50 sm:text-8xl lg:text-9xl">
              GeoMaster
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200/72 sm:text-lg">
              Spin the world, learn its patterns, then turn the atlas into a
              geography challenge with countries, capitals, landmarks, and
              local stories.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {hasActiveQuiz && onResumeQuiz ? (
                <button
                  type="button"
                  onClick={onResumeQuiz}
                  className={`min-h-11 rounded-full px-6 py-3 text-base font-semibold shadow-[0_0_34px_rgba(52,211,153,0.18)] focus:outline-none focus:ring-2 focus:ring-emerald-200/80 focus:ring-offset-2 focus:ring-offset-[#05080c] ${emeraldCtaClass}`}
                >
                  Resume Quiz
                </button>
              ) : null}
              <button
                type="button"
                onClick={onStartQuiz}
                className={`min-h-11 rounded-full px-6 py-3 text-base font-semibold shadow-[0_20px_25px_-5px_rgba(0,0,0,0.30)] focus:outline-none focus:ring-2 focus:ring-emerald-200/80 focus:ring-offset-2 focus:ring-offset-[#05080c] ${
                  hasActiveQuiz && onResumeQuiz
                    ? "border border-emerald-100/36 bg-emerald-300/18 text-emerald-50 transition hover:bg-emerald-300/28"
                    : emeraldCtaClass
                }`}
              >
                {hasActiveQuiz && onResumeQuiz ? "New Quiz" : "Choose a Quiz"}
              </button>
              <button
                type="button"
                onClick={onExploreMap}
                className="min-h-11 rounded-full border border-white/16 bg-white/8 px-6 py-3 text-base font-semibold text-slate-100/80 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.24)] transition hover:bg-white/14 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200/70 focus:ring-offset-2 focus:ring-offset-[#05080c]"
              >
                Explore Map
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.12,
              duration: 0.56,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mb-2 flex flex-wrap gap-2 self-end justify-self-start text-xs font-semibold text-slate-100/70 sm:mb-0 lg:justify-self-end"
          >
            {heroStats.map((stat) => (
              <span
                key={stat}
                className="rounded-full border border-white/12 bg-[#090f1a]/68 px-4 py-2 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.24)] backdrop-blur-md"
              >
                {stat}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-5 right-5 hidden max-w-xs text-right text-xs font-medium leading-5 text-cyan-50/48 sm:block"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.55,
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        Drag the globe, then enter the map.
      </motion.div>
    </motion.section>
  );
}
