"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CountryEducationCard } from "@/components/game/CountryEducationCard";
import { ShareResultCard } from "@/components/game/ShareResultCard";
import { features } from "@/config/features";
import { getRegionConfig, type Country } from "@/data/countries";
import { modeLabels } from "@/data/gameModes";
import { useGameStore } from "@/store/gameStore";
import { useProgressStore } from "@/store/progressStore";
import { getMasteryLevel, type MasteryLevel } from "@/utils/countryMastery";

type ReviewGroup = {
  label: string;
  tone: "emerald" | "amber" | "rose";
  countries: Country[];
};

type ReviewFilter = "missed" | "found";

const masteryDotClasses: Record<MasteryLevel, string> = {
  mastered: "bg-emerald-300",
  learning: "bg-cyan-300/80",
  shaky: "bg-rose-300",
  unseen: "bg-white/25",
};

const masteryLabels: Record<MasteryLevel, string> = {
  mastered: "mastered over time",
  learning: "still learning",
  shaky: "often missed",
  unseen: "first time seen",
};

type ResultsDashboardProps = {
  onChangeRegion?: () => void;
  onContinueLearning?: () => void;
  onReviewCountrySelect?: (country: Country | null) => void;
};

export function ResultsDashboard({
  onChangeRegion,
  onContinueLearning,
  onReviewCountrySelect,
}: ResultsDashboardProps = {}) {
  const prefersReducedMotion = useReducedMotion();
  const gameStatus = useGameStore((state) => state.gameStatus);
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const quizCountries = useGameStore((state) => state.quizCountries);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const countryResults = useGameStore((state) => state.countryResults);
  const score = useGameStore((state) => state.score);
  const total = useGameStore((state) => state.total);
  const retryQuiz = useGameStore((state) => state.retryQuiz);
  const startCustomQuiz = useGameStore((state) => state.startCustomQuiz);
  const backToRegionSelect = useGameStore((state) => state.backToRegionSelect);
  const lastFeedbackEvent = useGameStore((state) => state.lastFeedbackEvent);
  const customQuizSet = useGameStore((state) => state.customQuizSet);
  const countryProgress = useProgressStore((state) => state.countries);
  const progressHydrated = useProgressStore((state) => state.hydrated);
  const showMastery = features.progressTracking && progressHydrated;
  const region = getRegionConfig(selectedRegion);
  const quizLabel = customQuizSet?.label ?? region.label;
  const statusLabel =
    gameStatus === "completed"
      ? "Quiz complete"
      : gameStatus === "gave-up"
        ? "Quiz ended"
        : "Time expired";
  const isTargetQueueMode =
    selectedMode === "identify-shaded" ||
    selectedMode === "click-country" ||
    selectedMode === "capital-challenge";
  const reviewKey = `${gameStatus}-${selectedRegion}-${selectedMode}-${quizLabel}`;
  const [reviewState, setReviewState] = useState<{
    key: string;
    open: boolean;
    filter: ReviewFilter;
    selectedCountryId: string | null;
  }>({ key: reviewKey, open: false, filter: "missed", selectedCountryId: null });
  const reviewOpen = reviewState.key === reviewKey && reviewState.open;
  const reviewFilter = reviewState.key === reviewKey ? reviewState.filter : "missed";
  const selectedCountryId = reviewState.key === reviewKey ? reviewState.selectedCountryId : null;
  const resultsPanelRef = useRef<HTMLElement>(null);
  const reviewContentRef = useRef<HTMLDivElement>(null);
  const countryById = useMemo(
    () => new Map(quizCountries.map((country) => [country.iso_a3, country])),
    [quizCountries],
  );
  const modeResults = Object.values(countryResults);
  const perfectCount = modeResults.filter((result) => result.status === "correct").length;
  const assistedCount = modeResults.filter((result) => result.status === "assisted").length;

  const reviewGroups = useMemo<ReviewGroup[]>(() => {
    if (isTargetQueueMode) {
      const perfect = quizCountries.filter((country) => countryResults[country.iso_a3]?.status === "correct");
      const assisted = quizCountries.filter((country) => countryResults[country.iso_a3]?.status === "assisted");
      const missed = quizCountries.filter((country) => {
        const result = countryResults[country.iso_a3];
        return result?.status === "missed" || ((gameStatus === "failed" || gameStatus === "gave-up") && !result);
      });
      return [
        { label: "Perfect", tone: "emerald", countries: perfect },
        { label: "With hints", tone: "amber", countries: assisted },
        { label: "Missed", tone: "rose", countries: missed },
      ];
    }
    const guessed = new Set(guessedCountryIds);
    const correct = quizCountries.filter((country) => guessed.has(country.iso_a3));
    const missed = gameStatus === "failed" || gameStatus === "gave-up"
      ? quizCountries.filter((country) => !guessed.has(country.iso_a3))
      : [];
    return [
      { label: "Found", tone: "emerald", countries: correct },
      { label: "Missed", tone: "rose", countries: missed },
    ];
  }, [countryResults, gameStatus, guessedCountryIds, isTargetQueueMode, quizCountries]);
  const missedCount = reviewGroups.find((group) => group.tone === "rose")?.countries.length ?? 0;
  const reviewCountries = useMemo(
    () => reviewGroups.filter((group) => reviewFilter === "missed" ? group.tone === "rose" : group.tone !== "rose").flatMap((group) => group.countries),
    [reviewFilter, reviewGroups],
  );
  const selectedCountry = selectedCountryId ? countryById.get(selectedCountryId) ?? null : null;

  useEffect(() => {
    resultsPanelRef.current?.scrollTo({ top: 0 });
    reviewContentRef.current?.scrollTo({ top: 0 });
  }, [reviewFilter, reviewOpen, selectedCountryId]);

  // Include hinted answers as useful practice, and include every unresolved country
  // in a timed or manually ended target queue.
  const practiceCountryIds = useMemo(() => {
    if (isTargetQueueMode) {
      return quizCountries.filter((country) => {
        const result = countryResults[country.iso_a3];
        return result?.status === "missed" || result?.status === "assisted" ||
          ((gameStatus === "failed" || gameStatus === "gave-up") && !result);
      }).map((country) => country.iso_a3);
    }
    const guessed = new Set(guessedCountryIds);
    return quizCountries.filter((country) => !guessed.has(country.iso_a3)).map((country) => country.iso_a3);
  }, [countryResults, gameStatus, guessedCountryIds, isTargetQueueMode, quizCountries]);
  const canPractice = features.practiceMistakes && practiceCountryIds.length > 0;
  const completionPulse = Boolean(lastFeedbackEvent?.completed) && gameStatus === "completed";
  const foundCount = Math.max(0, total - missedCount);
  const correctCount = isTargetQueueMode ? perfectCount : score;
  const initialFilter: ReviewFilter = missedCount > 0 ? "missed" : "found";

  if (gameStatus !== "completed" && gameStatus !== "failed" && gameStatus !== "gave-up") return null;

  const openReview = () => setReviewState({
    key: reviewKey,
    open: true,
    filter: initialFilter,
    selectedCountryId: null,
  });
  const chooseFilter = (filter: ReviewFilter) => setReviewState({
    key: reviewKey,
    open: true,
    filter,
    selectedCountryId: null,
  });
  const finishResults = (action?: () => void) => {
    onReviewCountrySelect?.(null);
    backToRegionSelect();
    action?.();
  };
  const retryCurrentQuiz = () => {
    onReviewCountrySelect?.(null);
    retryQuiz();
  };
  const startPractice = () => {
    onReviewCountrySelect?.(null);
    startCustomQuiz(practiceCountryIds, { label: `Practice · ${quizLabel}` });
  };

  return (
    <motion.section
      ref={resultsPanelRef}
      initial={{ opacity: 0, y: 18, scale: 0.99 }}
      animate={completionPulse && !prefersReducedMotion
        ? { opacity: 1, y: 0, scale: [1, 1.01, 1], boxShadow: ["0 18px 48px rgba(0,0,0,0.34)", "0 22px 72px rgba(16,185,129,0.22)", "0 18px 48px rgba(0,0,0,0.34)"] }
        : { opacity: 1, y: 0, scale: 1 }}
      transition={completionPulse && !prefersReducedMotion ? { duration: 0.7 } : { type: "spring", stiffness: 240, damping: 28 }}
      aria-label={reviewOpen ? "Review quiz answers" : "Quiz results"}
      className={`absolute inset-x-2 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 rounded-3xl border border-white/14 bg-[#111a20]/95 text-white shadow-xl shadow-black/34 backdrop-blur-2xl lg:bottom-5 lg:left-5 lg:right-auto lg:w-[min(29rem,calc(100vw-2.5rem))] ${reviewOpen ? "flex max-h-[70dvh] flex-col overflow-hidden lg:max-h-[min(76vh,48rem)]" : "max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto"}`}
    >
      {!reviewOpen ? (
        <>
          <div className="px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
            <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-white/50">{statusLabel}</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.19em] text-white/65">
                {quizLabel} · {modeLabels[selectedMode]}
              </p>
              <span className="text-sm font-semibold tabular-nums text-white/70">{total ? Math.round((score / total) * 100) : 0}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h2 aria-label={`${score} of ${total}`} className="text-[2.65rem] font-semibold leading-none tracking-[-0.06em]">
                {score}<span aria-hidden="true" className="ml-1 text-2xl font-medium tracking-[-0.04em] text-white/65">/{total}</span>
              </h2>
            </div>
            <p className="mt-2 text-sm text-white/82">
              {missedCount > 0 ? `${missedCount} ${missedCount === 1 ? "country" : "countries"} left to learn.` : "Every country found."}
            </p>
            <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-rose-200/80" role="img" aria-label={`${score} of ${total} countries found`}>
              <span className="bg-emerald-300 transition-[width]" style={{ width: `${total ? Math.min(100, (correctCount / total) * 100) : 0}%` }} />
              {assistedCount > 0 ? <span className="bg-amber-300 transition-[width]" style={{ width: `${total ? Math.min(100, (assistedCount / total) * 100) : 0}%` }} /> : null}
            </div>
            <div className="mt-2 flex justify-between text-[0.7rem] font-medium text-white/70">
              <span><i className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-300" />{correctCount} found{assistedCount > 0 ? <span className="ml-2 text-amber-200"><i className="mr-1.5 inline-block size-1.5 rounded-full bg-amber-300" />{assistedCount} with hints</span> : null}</span>
              <span><i className="mr-1.5 inline-block size-1.5 rounded-full bg-rose-200" />{missedCount} missed</span>
            </div>
            <button type="button" onClick={openReview} className="mt-4 flex min-h-16 w-full items-center gap-3 border-y border-white/12 py-3 text-left transition hover:bg-white/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200/70">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-200/10 text-rose-100">≡</span>
              <span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">See the countries you {missedCount ? "missed" : "found"}</strong><small className="mt-1 block text-xs text-white/65">Review their names and capitals</small></span>
              <span aria-hidden="true" className="text-2xl leading-none text-white/65">›</span>
            </button>
          </div>
          <div className="px-5 pb-3 pt-4 sm:px-6">
            {canPractice ? (
              <>
                <button type="button" onClick={startPractice} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-emerald-100/50 bg-emerald-200 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100">
                  Practice {practiceCountryIds.length} {assistedCount ? "countries to revisit" : "missed countries"}<span aria-hidden="true" className="text-lg font-normal">→</span>
                </button>
                <p className="mt-2 text-center text-[0.7rem] leading-5 text-white/65">A shorter quiz focused on what needs another look.</p>
              </>
            ) : (
              <button type="button" onClick={retryCurrentQuiz} className="min-h-12 w-full rounded-xl border border-emerald-100/50 bg-emerald-200 px-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100">Retry {quizLabel}</button>
            )}
            <div className={`mt-3 grid gap-2 ${canPractice && onChangeRegion ? "grid-cols-2" : "grid-cols-1"}`}>
              {canPractice ? <button type="button" onClick={retryCurrentQuiz} className="min-h-11 rounded-xl border border-white/16 bg-white/[0.035] px-3 text-sm font-medium text-white/85 transition hover:bg-white/10">Retry {quizLabel}</button> : null}
              {onChangeRegion ? <button type="button" onClick={() => finishResults(onChangeRegion)} className="min-h-11 rounded-xl border border-white/16 bg-white/[0.035] px-3 text-sm font-medium text-white/85 transition hover:bg-white/10">Choose another quiz</button> : null}
            </div>
            {onContinueLearning ? <button type="button" onClick={() => finishResults(onContinueLearning)} className="min-h-11 w-full text-xs font-medium text-white/65 transition hover:text-white">Explore the map <span aria-hidden="true">↗</span></button> : null}
          </div>
        </>
      ) : (
        <>
          <div className="z-10 shrink-0 border-b border-white/12 bg-[#111a20]/96 px-5 pb-4 pt-4 backdrop-blur-2xl sm:px-6">
            <button type="button" onClick={() => { onReviewCountrySelect?.(null); setReviewState({ ...reviewState, key: reviewKey, open: false }); }} className="mb-3 min-h-11 text-xs font-medium text-cyan-100/85 hover:text-white">← Results</button>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/65">{quizLabel} · Review answers</p>
            <h2 className="mt-1 text-xl font-semibold">{reviewFilter === "missed" ? `${missedCount} countries to learn` : `${foundCount} countries found`}</h2>
            <p className="mt-1 text-xs text-white/65">Choose a country to see its capital and map location.</p>
            <div className="mt-3 flex gap-2" role="group" aria-label="Filter reviewed countries">
              {(["missed", "found"] as const).map((filter) => {
                const count = filter === "missed" ? missedCount : foundCount;
                return <button key={filter} type="button" aria-pressed={reviewFilter === filter} onClick={() => { onReviewCountrySelect?.(null); chooseFilter(filter); }} className={`min-h-11 rounded-lg border px-3 text-xs font-medium capitalize transition ${reviewFilter === filter ? filter === "missed" ? "border-rose-200/30 bg-rose-200/10 text-rose-100" : "border-emerald-200/30 bg-emerald-200/10 text-emerald-100" : "border-white/12 text-white/65 hover:bg-white/8"}`}>{filter} <span className="ml-1 tabular-nums">{count}</span></button>;
              })}
            </div>
          </div>
          <div ref={reviewContentRef} className="min-h-0 flex-1 overflow-y-auto px-5 lg:px-6">
            {selectedCountry ? <>
              <button type="button" onClick={() => { onReviewCountrySelect?.(null); setReviewState({ ...reviewState, key: reviewKey, selectedCountryId: null }); }} className="my-3 min-h-11 text-xs font-medium text-cyan-100/85 hover:text-white">← Back to {reviewFilter}</button>
              <CountryEducationCard country={selectedCountry} variant="review" />
            </> : reviewGroups.filter((group) => reviewFilter === "missed" ? group.tone === "rose" : group.tone !== "rose").map((group) => group.countries.length ? (
              <section key={group.label}>
                {isTargetQueueMode ? <h3 className="sticky top-0 bg-[#111a20]/96 py-2 text-[0.63rem] font-semibold uppercase tracking-[0.18em] text-white/60">{group.label} · {group.countries.length}</h3> : null}
                {group.countries.map((country) => <button key={country.iso_a3} type="button" onClick={() => { setReviewState({ ...reviewState, key: reviewKey, selectedCountryId: country.iso_a3 }); onReviewCountrySelect?.(country); }} className="flex min-h-14 w-full items-center gap-3 border-b border-white/[0.08] py-2.5 text-left text-white/90 transition hover:text-cyan-100">
                  <span className="w-8 text-center text-lg" aria-hidden="true">{country.flagEmoji ?? "◉"}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{country.name}</span><span className="mt-0.5 block text-xs text-white/60">{country.capital}</span></span>
                  {showMastery ? <span title={masteryLabels[getMasteryLevel(countryProgress[country.iso_a3])]} className={`size-1.5 rounded-full ${masteryDotClasses[getMasteryLevel(countryProgress[country.iso_a3])]}`} /> : null}
                  <span aria-hidden="true" className="text-xl text-white/55">›</span>
                </button>)}
              </section>
            ) : null)}
            {!selectedCountry && reviewCountries.length === 0 ? <p className="py-8 text-center text-sm text-white/65">No countries in this group.</p> : null}
            {features.shareResultCard ? <div className="flex justify-end py-3"><ShareResultCard quizLabel={quizLabel} modeLabel={modeLabels[selectedMode]} score={score} total={total} statusLabel={statusLabel} /></div> : null}
          </div>
          <div className="shrink-0 border-t border-white/12 px-5 py-3 sm:px-6">
            {canPractice ? <button type="button" onClick={startPractice} className="min-h-11 w-full rounded-xl border border-emerald-100/50 bg-emerald-200 px-4 text-sm font-semibold text-emerald-950">Practice {practiceCountryIds.length} countries</button> : <button type="button" onClick={retryCurrentQuiz} className="min-h-11 w-full rounded-xl border border-emerald-100/50 bg-emerald-200 px-4 text-sm font-semibold text-emerald-950">Retry {quizLabel}</button>}
          </div>
        </>
      )}
    </motion.section>
  );
}
