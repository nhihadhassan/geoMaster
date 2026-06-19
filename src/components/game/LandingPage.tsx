"use client";

import { motion, useReducedMotion } from "framer-motion";

type LandingPageProps = {
  onStartQuiz: () => void;
  onExploreMap: () => void;
  hasActiveQuiz?: boolean;
  onResumeQuiz?: () => void;
};

const modeCards = [
  {
    title: "Type countries",
    text: "Fill the map by naming every country in a region.",
  },
  {
    title: "Identify shapes",
    text: "Name the pulsing country with a three-attempt challenge.",
  },
  {
    title: "Map click",
    text: "Find the named country directly on the map.",
  },
  {
    title: "Capital challenge",
    text: "See a capital city and type the country it belongs to.",
  },
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
      className="absolute inset-0 z-50 overflow-y-auto bg-[radial-gradient(circle_at_50%_15%,rgba(34,211,238,0.18),transparent_32rem),linear-gradient(180deg,rgba(2,6,23,0.9),rgba(2,6,23,0.76))] px-4 py-5 text-white backdrop-blur-md sm:px-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.28 }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center gap-8 py-10">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-100/72">
            GeoMaster
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            Learn the world through the map.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/66 sm:text-lg">
            Fast geography quizzes meet an explorable atlas with capitals,
            flags, languages, population, GDP, landmarks, and local details.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {hasActiveQuiz && onResumeQuiz ? (
              <button
                type="button"
                onClick={onResumeQuiz}
                className="rounded-full border border-emerald-100/80 bg-emerald-300 px-6 py-3 text-base font-semibold text-slate-950 shadow-xl shadow-emerald-950/30 transition hover:bg-emerald-200"
              >
                Resume Quiz
              </button>
            ) : null}
            <button
              type="button"
              onClick={onStartQuiz}
              className={`rounded-full border px-6 py-3 text-base font-semibold shadow-xl transition ${
                hasActiveQuiz && onResumeQuiz
                  ? "border-white/16 bg-white/10 text-white/78 shadow-black/25 hover:bg-white/16 hover:text-white"
                  : "border-emerald-100/32 bg-emerald-300/20 text-emerald-50 shadow-emerald-950/30 hover:bg-emerald-300/28"
              }`}
            >
              {hasActiveQuiz && onResumeQuiz ? "New Quiz" : "Choose a Quiz"}
            </button>
            <button
              type="button"
              onClick={onExploreMap}
              className="rounded-full border border-white/16 bg-white/10 px-6 py-3 text-base font-semibold text-white/78 shadow-xl shadow-black/25 transition hover:bg-white/16 hover:text-white"
            >
              Explore Map
            </button>
          </div>
        </motion.div>

        <div className="grid gap-3 md:grid-cols-4">
          {modeCards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.08 + index * 0.045,
                type: "spring",
                stiffness: 220,
                damping: 28,
              }}
              className="rounded-2xl border border-white/12 bg-white/8 p-4 shadow-xl shadow-black/24 backdrop-blur-2xl transition hover:border-white/22 hover:bg-white/12"
            >
              <h2 className="text-sm font-semibold text-white">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-5 text-white/54">
                {card.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
