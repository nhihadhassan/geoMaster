"use client";

import { motion, useReducedMotion } from "framer-motion";
import { emeraldCtaClass } from "@/components/game/QuizCta";

import {
  Globe,
  type GlobeCityLabel,
  type GlobeConfig,
} from "@/components/ui/globe";

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
  phi: -0.18,
  theta: 0.3,
  dark: 1,
  diffuse: 0.85,
  mapSamples: 20000,
  mapBrightness: 5.6,
  baseColor: [0.06, 0.2, 0.34],
  markerColor: [0.2, 0.83, 0.68],
  glowColor: [0.08, 0.58, 0.76],
  markers: [
    { location: [43.6532, -79.3832], size: 0.055 },
    { location: [40.7128, -74.006], size: 0.065 },
    { location: [19.4326, -99.1332], size: 0.065 },
    { location: [-23.5505, -46.6333], size: 0.075 },
    { location: [51.5072, -0.1276], size: 0.06 },
    { location: [30.0444, 31.2357], size: 0.055 },
    { location: [19.076, 72.8777], size: 0.07 },
    { location: [35.6762, 139.6503], size: 0.06 },
    { location: [-33.8688, 151.2093], size: 0.055 },
  ],
};

const HERO_CITY_LABELS: GlobeCityLabel[] = [
  { id: "toronto", name: "Toronto", location: [43.6532, -79.3832] },
  { id: "new-york", name: "New York", location: [40.7128, -74.006] },
  { id: "mexico-city", name: "Mexico City", location: [19.4326, -99.1332] },
  { id: "sao-paulo", name: "Sao Paulo", location: [-23.5505, -46.6333] },
  { id: "london", name: "London", location: [51.5072, -0.1276] },
  { id: "cairo", name: "Cairo", location: [30.0444, 31.2357] },
  { id: "mumbai", name: "Mumbai", location: [19.076, 72.8777] },
  { id: "tokyo", name: "Tokyo", location: [35.6762, 139.6503] },
  { id: "sydney", name: "Sydney", location: [-33.8688, 151.2093] },
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(34,211,238,0.2),transparent_27rem),radial-gradient(circle_at_50%_92%,rgba(52,211,153,0.12),transparent_18rem),linear-gradient(180deg,#071018_0%,#05080c_48%,#05080c_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-[linear-gradient(0deg,rgba(5,8,12,0.96),rgba(5,8,12,0))]" />

      <Globe
        className="bottom-[-20vh] left-1/2 right-auto top-auto z-0 max-w-none w-[150vw] -translate-x-1/2 opacity-100 sm:bottom-[-58vh] sm:w-[120vw] lg:bottom-[-76vh] lg:w-[96vw] xl:bottom-[-70vh] xl:w-[88vw]"
        config={HERO_GLOBE_CONFIG}
        cityLabels={HERO_CITY_LABELS}
        maxVisibleLabels={3}
      />

      <div className="relative z-10 flex h-full min-h-dvh px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col items-center text-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-col items-center pt-[8vh] sm:pt-[7vh]"
          >
            <h1 className="bg-[linear-gradient(180deg,#e7fbff_0%,#8ddfed_36%,#246275_72%,#101922_100%)] bg-clip-text text-[clamp(3.55rem,14.5vw,9rem)] font-bold leading-[0.84] text-transparent drop-shadow-[0_24px_32px_rgba(0,0,0,0.82)] sm:leading-[0.82]">
              GeoMaster
            </h1>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.12,
              duration: 0.56,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-20 mt-auto flex w-full max-w-md flex-col justify-center gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:max-w-none sm:flex-row sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
              {hasActiveQuiz && onResumeQuiz ? (
                <button
                  type="button"
                  onClick={onResumeQuiz}
                  className={`min-h-11 rounded-full px-6 py-3 text-base font-semibold shadow-[0_0_34px_rgba(52,211,153,0.22)] focus:outline-none focus:ring-2 focus:ring-emerald-200/80 focus:ring-offset-2 focus:ring-offset-[#05080c] ${emeraldCtaClass}`}
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
                    : "border border-emerald-100/70 bg-emerald-300/88 text-slate-950 transition hover:bg-emerald-200"
                }`}
              >
                {hasActiveQuiz && onResumeQuiz ? "New Quiz" : "Choose a Quiz"}
              </button>
              <button
                type="button"
                onClick={onExploreMap}
                className="min-h-11 rounded-full border border-cyan-100/24 bg-[#071018]/92 px-6 py-3 text-base font-semibold text-cyan-50 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(186,230,253,0.16)] transition hover:border-cyan-100/36 hover:bg-[#0b1822] focus:outline-none focus:ring-2 focus:ring-cyan-200/70 focus:ring-offset-2 focus:ring-offset-[#05080c]"
              >
                Explore Map
              </button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
