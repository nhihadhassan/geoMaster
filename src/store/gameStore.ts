import { create } from "zustand";
import { features } from "@/config/features";
import {
  countries as allCountries,
  getCountriesForRegion,
  getTimerSeconds,
  type Country,
  type QuizRegion,
} from "@/data/countries";
import {
  getCapitalChallengeHints,
  getClickCountryHints,
  getIdentifyHints,
} from "@/utils/countryHints";
import type { LearningFeature } from "@/data/learningFeatures";
import type { GeoSoundEvent } from "@/utils/soundEffects";
import {
  persistAutoHideCorrectCard,
  persistSoundEffectsEnabled,
  persistTimerMultiplier,
  readInitialAutoHideCorrectCard,
  readInitialSoundEffectsEnabled,
  readInitialTimerMultiplier,
  normalizeTimerMultiplier,
  persistLastSetup,
  persistTimerMode,
  readLastSetup,
  readInitialTimerMode,
  type TimerMode,
} from "@/store/preferences";
import {
  clearQuizProgress,
  QUIZ_PROGRESS_VERSION,
  readQuizProgress,
  writeQuizProgress,
  type QuizProgressSnapshot,
} from "@/store/quizPersistence";
import type {
  CountryResult,
  CountryResultStatus,
  GameMode,
  GameStatus,
  IdentifyGuessResult,
  QuizFeedbackEvent,
} from "@/store/gameTypes";

export type {
  CountryResult,
  CountryResultStatus,
  GameMode,
  GameStatus,
  IdentifyGuessResult,
  QuizFeedbackEvent,
} from "@/store/gameTypes";
export { readQuizProgress, type QuizProgressSnapshot } from "@/store/quizPersistence";
export { TIMER_MULTIPLIER_OPTIONS } from "@/store/preferences";

type FeatureStateDebug = {
  source: string;
  id: string;
  state: Record<string, boolean | number>;
  ok: boolean;
  isoExists: boolean;
  error?: string;
};

type DebugState = {
  mapLoaded: boolean;
  countrySourceLoaded: boolean;
  countryFeatureCount: number;
  labelSourceLoaded: boolean;
  labelLayerLoaded: boolean;
  leaderSourceLoaded: boolean;
  leaderLayerLoaded: boolean;
  insetLabelLayerLoaded: boolean;
  labelFeatureCount: number;
  leaderFeatureCount: number;
  lastLabelLayerError: string | null;
  guessedIsoExists: boolean | null;
  lastFeatureStateCall: FeatureStateDebug | null;
  sourceIds: string[];
  layerIds: string[];
  projection: string;
  currentTargetHints: string[];
  lastRawInput: string | null;
  lastNormalizedInput: string | null;
  lastMatchedIso: string | null;
  lastMatchedName: string | null;
  lastMatchMethod: "exact" | "alias" | "fuzzy" | null;
  lastMatchAccepted: boolean | null;
  lastPopupIso: string | null;
  lastShadedIso: string | null;
  lastClickedIso: string | null;
  lastClickedName: string | null;
  lastClickSource: "main" | "inset" | null;
  insetMissedCount: number;
};

type GameState = {
  selectedRegion: QuizRegion;
  selectedSpecialRegion: "antarctica" | null;
  selectedMode: GameMode;
  customQuizSet: CustomQuizSet | null;
  quizCountries: Country[];
  guessedCountryIds: string[];
  countryResults: Record<string, CountryResult>;
  currentInput: string;
  currentTargetCountry: Country | null;
  targetQueue: string[];
  score: number;
  total: number;
  remainingSeconds: number;
  // Wall-clock instant the running quiz expires. The timer is derived from this
  // rather than decremented, so a backgrounded tab or a sleeping phone cannot
  // silently freeze or slow the clock. Null while idle, paused, or untimed.
  deadlineAt: number | null;
  timerMode: TimerMode;
  gameStatus: GameStatus;
  incorrectAttempts: Record<string, number>;
  /** A wrong map pick worth showing on the map itself: the country tapped, and
   *  the right answer once it has been revealed. Cleared by the map effect. */
  lastMissFeedback: {
    wrongIso: string;
    correctIso: string | null;
    sequence: number;
  } | null;
  lastMatchedCountry: Country | null;
  lastMatchSequence: number;
  feedbackSequence: number;
  lastFeedbackEvent: QuizFeedbackEvent | null;
  isPerfectRun: boolean;
  perfectRunSequence: number;
  currentTargetHints: string[];
  smartHint: string | null;
  capitalHintEnabled: boolean;
  autoHideCorrectCard: boolean;
  soundEffectsEnabled: boolean;
  timerMultiplier: number;
  learningCountry: Country | null;
  selectedLearningFeature: LearningFeature | null;
  debug: DebugState;
  selectRegion: (region: QuizRegion) => void;
  selectSpecialRegion: (region: "antarctica") => void;
  clearSpecialRegion: () => void;
  selectMode: (mode: GameMode) => void;
  startQuiz: () => void;
  startCustomQuiz: (
    countryIds: string[],
    options?: { mode?: GameMode; label?: string; region?: QuizRegion },
  ) => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  giveUp: () => void;
  resetQuiz: () => void;
  backToRegionSelect: () => void;
  resumeSavedQuiz: (snapshot?: QuizProgressSnapshot) => void;
  discardSavedQuiz: () => void;
  setCurrentInput: (value: string) => void;
  setCapitalHintEnabled: (enabled: boolean) => void;
  setAutoHideCorrectCard: (enabled: boolean) => void;
  setSoundEffectsEnabled: (enabled: boolean) => void;
  setTimerMultiplier: (multiplier: number) => void;
  setTimerMode: (mode: TimerMode) => void;
  recordFeedbackEvent: (
    kind: GeoSoundEvent,
    options?: Omit<QuizFeedbackEvent, "kind" | "sequence">,
  ) => void;
  clearCorrectCard: () => void;
  clearMissFeedback: () => void;
  selectLearningCountry: (iso: string | null) => void;
  selectLearningFeature: (feature: LearningFeature | null) => void;
  clearLearningCountry: () => void;
  clearLearningFeature: () => void;
  submitTypeGuess: (country: Country) => boolean;
  submitIdentifyGuess: (country: Country | null) => IdentifyGuessResult;
  submitCapitalGuess: (country: Country | null) => IdentifyGuessResult;
  submitMapClickGuess: (
    clickedIso: string | null,
    source: "main" | "inset",
  ) => IdentifyGuessResult;
  tick: () => void;
  restoreMapFeatureState: () => void;
  setMapDebug: (debug: Partial<DebugState>) => void;
};

const shuffleIds = (countries: Country[]) =>
  [...countries]
    .map((country) => ({ country, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ country }) => country.iso_a3);

const getCountryById = (countries: Country[], id: string | undefined) =>
  countries.find((country) => country.iso_a3 === id) ?? null;

const QUIZ_MODES: GameMode[] = [
  "type-to-fill",
  "identify-shaded",
  "click-country",
  "capital-challenge",
];

const isTargetQueueMode = (mode: GameMode) =>
  mode === "identify-shaded" ||
  mode === "click-country" ||
  mode === "capital-challenge";

const isPerfectCountryResultSet = (
  countryResults: Record<string, CountryResult>,
  total: number,
) =>
  Object.values(countryResults).length === total &&
  Object.values(countryResults).every((result) => result.status === "correct");

const isResumableStatus = (
  status: GameStatus,
): status is "running" | "paused" =>
  status === "running" || status === "paused";

const buildQuizProgressSnapshot = (
  state: GameState,
): QuizProgressSnapshot | null => {
  if (!isResumableStatus(state.gameStatus)) {
    return null;
  }

  return {
    v: QUIZ_PROGRESS_VERSION,
    region: state.selectedRegion,
    mode: state.selectedMode,
    status: state.gameStatus,
    guessedCountryIds: state.guessedCountryIds,
    countryResults: state.countryResults,
    incorrectAttempts: state.incorrectAttempts,
    score: state.score,
    total: state.total,
    remainingSeconds: state.remainingSeconds,
    targetQueue: state.targetQueue,
    currentTargetIso: state.currentTargetCountry?.iso_a3 ?? null,
    customCountryIds: state.customQuizSet?.countryIds,
    customLabel: state.customQuizSet?.label,
    savedAt: Date.now(),
  };
};

export const getScaledTimerSeconds = (
  region: QuizRegion,
  mode: GameMode,
  timerMultiplier: number,
) => Math.round(getTimerSeconds(region, mode) * timerMultiplier);

const buildFeedbackEvent = (
  state: Pick<GameState, "feedbackSequence">,
  kind: GeoSoundEvent,
  options: Omit<QuizFeedbackEvent, "kind" | "sequence"> = {},
) => {
  const sequence = state.feedbackSequence + 1;

  return {
    feedbackSequence: sequence,
    lastFeedbackEvent: {
      kind,
      sequence,
      ...options,
    },
  };
};

// An explicit country list overriding the region roster: how "practice the
// ones you missed" and the daily challenge reuse the whole quiz engine without
// a parallel implementation.
export type CustomQuizSet = {
  countryIds: string[];
  label: string;
};

const CUSTOM_SECONDS_PER_COUNTRY = 20;
const CUSTOM_MINIMUM_SECONDS = 60;

const resolveCustomCountries = (countryIds: string[]) =>
  countryIds
    .map((iso) => allCountries.find((country) => country.iso_a3 === iso))
    .filter((country): country is Country => Boolean(country));

const getCustomTimerSeconds = (count: number, timerMultiplier: number) =>
  Math.round(
    Math.max(count * CUSTOM_SECONDS_PER_COUNTRY, CUSTOM_MINIMUM_SECONDS) *
      timerMultiplier,
  );

const createResetState = (
  selectedRegion: QuizRegion,
  selectedMode: GameMode,
  timerMultiplier: number,
  customQuizSet: CustomQuizSet | null = null,
) => {
  const quizCountries = customQuizSet
    ? resolveCustomCountries(customQuizSet.countryIds)
    : getCountriesForRegion(selectedRegion);

  return {
    selectedRegion,
    selectedSpecialRegion: null,
    selectedMode,
    customQuizSet,
    quizCountries,
    guessedCountryIds: [],
    countryResults: {},
    currentInput: "",
    currentTargetCountry: null,
    targetQueue: [],
    score: 0,
    total: quizCountries.length,
    remainingSeconds: customQuizSet
      ? getCustomTimerSeconds(quizCountries.length, timerMultiplier)
      : getScaledTimerSeconds(selectedRegion, selectedMode, timerMultiplier),
    deadlineAt: null,
    gameStatus: "idle" as GameStatus,
    incorrectAttempts: {},
    lastMissFeedback: null,
    lastMatchedCountry: null,
    lastMatchSequence: 0,
    feedbackSequence: 0,
    lastFeedbackEvent: null,
    isPerfectRun: false,
    perfectRunSequence: 0,
    currentTargetHints: [],
    smartHint: null,
    capitalHintEnabled: false,
    learningCountry: null,
    selectedLearningFeature: null,
  };
};

const initialTimerMultiplier = readInitialTimerMultiplier();
const initialTimerMode = readInitialTimerMode();

// A returning player resumes their last region and mode rather than the
// hard-coded default, so the setup panel opens already configured.
const initialSetup = (() => {
  const fallback = {
    region: "south-america" as QuizRegion,
    mode: "type-to-fill" as GameMode,
  };

  if (!features.quickStart) {
    return fallback;
  }

  const stored = readLastSetup();

  if (!stored) {
    return fallback;
  }

  const region = getCountriesForRegion(stored.region as QuizRegion).length
    ? (stored.region as QuizRegion)
    : fallback.region;
  const mode = QUIZ_MODES.includes(stored.mode as GameMode)
    ? (stored.mode as GameMode)
    : fallback.mode;

  return { region, mode };
})();

// A running quiz expires at a wall-clock instant; `remainingSeconds` is a
// derived view of it that each tick refreshes.
const deadlineFor = (remainingSeconds: number, timerMode: TimerMode) =>
  timerMode === "untimed" ? null : Date.now() + remainingSeconds * 1000;

const remainingSecondsFrom = (deadlineAt: number | null) =>
  deadlineAt === null ? null : Math.max(Math.ceil((deadlineAt - Date.now()) / 1000), 0);

export const useGameStore = create<GameState>((set, get) => ({
  ...createResetState(
    initialSetup.region,
    initialSetup.mode,
    initialTimerMultiplier,
  ),
  autoHideCorrectCard: readInitialAutoHideCorrectCard(),
  soundEffectsEnabled: readInitialSoundEffectsEnabled(),
  timerMultiplier: initialTimerMultiplier,
  timerMode: initialTimerMode,
  debug: {
    mapLoaded: false,
    countrySourceLoaded: false,
    countryFeatureCount: 0,
    labelSourceLoaded: false,
    labelLayerLoaded: false,
    leaderSourceLoaded: false,
    leaderLayerLoaded: false,
    insetLabelLayerLoaded: false,
    labelFeatureCount: 0,
    leaderFeatureCount: 0,
    lastLabelLayerError: null,
    guessedIsoExists: null,
    lastFeatureStateCall: null,
    sourceIds: [],
    layerIds: [],
    projection: "unknown",
    currentTargetHints: [],
    lastRawInput: null,
    lastNormalizedInput: null,
    lastMatchedIso: null,
    lastMatchedName: null,
    lastMatchMethod: null,
    lastMatchAccepted: null,
    lastPopupIso: null,
    lastShadedIso: null,
    lastClickedIso: null,
    lastClickedName: null,
    lastClickSource: null,
    insetMissedCount: 0,
  },
  selectRegion: (selectedRegion) => {
    const { selectedMode, timerMultiplier } = get();

    set(createResetState(selectedRegion, selectedMode, timerMultiplier));
  },
  selectSpecialRegion: (selectedSpecialRegion) => {
    const { selectedRegion, selectedMode, timerMultiplier } = get();

    set({
      ...createResetState(selectedRegion, selectedMode, timerMultiplier),
      selectedSpecialRegion,
      lastMatchedCountry: null,
      learningCountry: null,
      selectedLearningFeature: null,
    });
  },
  clearSpecialRegion: () => {
    const { selectedRegion, selectedMode, timerMultiplier } = get();

    set(createResetState(selectedRegion, selectedMode, timerMultiplier));
  },
  selectMode: (selectedMode) => {
    const { selectedRegion, timerMultiplier } = get();

    set(createResetState(selectedRegion, selectedMode, timerMultiplier));
  },
  startQuiz: () => {
    const state = get();

    if (state.gameStatus === "running" || state.gameStatus === "paused") {
      return;
    }

    // Start from a full clock even if the previous run ended on an expired
    // timer, then arm the wall-clock deadline the tick derives from.
    const remainingSeconds = state.customQuizSet
      ? getCustomTimerSeconds(state.quizCountries.length, state.timerMultiplier)
      : getScaledTimerSeconds(
          state.selectedRegion,
          state.selectedMode,
          state.timerMultiplier,
        );
    const deadlineAt = deadlineFor(remainingSeconds, state.timerMode);

    if (features.quickStart && !state.customQuizSet) {
      persistLastSetup({
        region: state.selectedRegion,
        mode: state.selectedMode,
      });
    }

    if (isTargetQueueMode(state.selectedMode)) {
      const [firstTargetId, ...targetQueue] = shuffleIds(state.quizCountries);

      set({
        gameStatus: "running",
        remainingSeconds,
        deadlineAt,
        currentInput: "",
        guessedCountryIds: [],
        countryResults: {},
        score: 0,
        targetQueue,
        currentTargetCountry: getCountryById(state.quizCountries, firstTargetId),
        lastMatchedCountry: null,
        isPerfectRun: false,
        currentTargetHints: [],
        smartHint: null,
        incorrectAttempts: {},
        learningCountry: null,
        selectedLearningFeature: null,
        ...buildFeedbackEvent(state, "quiz-start"),
      });

      return;
    }

    set({
      gameStatus: "running",
      remainingSeconds,
      deadlineAt,
      currentInput: "",
      guessedCountryIds: [],
      countryResults: {},
      score: 0,
      currentTargetCountry: null,
      targetQueue: [],
      lastMatchedCountry: null,
      isPerfectRun: false,
      currentTargetHints: [],
      smartHint: null,
      incorrectAttempts: {},
      learningCountry: null,
      selectedLearningFeature: null,
      ...buildFeedbackEvent(state, "quiz-start"),
    });
  },
  startCustomQuiz: (countryIds, options) => {
    const state = get();
    const mode = options?.mode ?? state.selectedMode;
    const region = options?.region ?? state.selectedRegion;
    const label = options?.label ?? "Focused practice";
    const customQuizSet = { countryIds: [...new Set(countryIds)], label };

    if (customQuizSet.countryIds.length === 0) {
      return;
    }

    // Reset onto the explicit roster, then hand off to the normal start path so
    // the target queue, hints, scoring, and feedback events are all shared.
    set(createResetState(region, mode, state.timerMultiplier, customQuizSet));
    get().startQuiz();
  },
  pauseQuiz: () => {
    const state = get();

    if (state.gameStatus !== "running") {
      return;
    }

    set({
      gameStatus: "paused",
      remainingSeconds:
        remainingSecondsFrom(state.deadlineAt) ?? state.remainingSeconds,
      deadlineAt: null,
      currentInput: "",
      smartHint: null,
    });
  },
  resumeQuiz: () => {
    const state = get();

    if (state.gameStatus !== "paused") {
      return;
    }

    set({
      gameStatus: "running",
      deadlineAt: deadlineFor(state.remainingSeconds, state.timerMode),
    });
  },
  resetQuiz: () => {
    const { selectedRegion, selectedMode, timerMultiplier, customQuizSet } =
      get();

    // Try Again on a focused practice run replays the same roster.
    set(
      createResetState(
        selectedRegion,
        selectedMode,
        timerMultiplier,
        customQuizSet,
      ),
    );
  },
  giveUp: () => {
    const state = get();

    if (state.gameStatus !== "running" && state.gameStatus !== "paused") {
      return;
    }

    set({
      gameStatus: "gave-up",
      deadlineAt: null,
      currentInput: "",
      currentTargetCountry: null,
      targetQueue: [],
      currentTargetHints: [],
      smartHint: null,
      lastMatchedCountry: null,
      isPerfectRun: false,
      learningCountry: null,
      selectedLearningFeature: null,
      ...buildFeedbackEvent(state, "give-up"),
    });
  },
  backToRegionSelect: () => {
    const { selectedRegion, selectedMode, timerMultiplier } = get();

    set(createResetState(selectedRegion, selectedMode, timerMultiplier));
  },
  resumeSavedQuiz: (providedSnapshot) => {
    const snapshot = providedSnapshot ?? readQuizProgress();

    if (!snapshot) {
      return;
    }

    const customQuizSet = snapshot.customCountryIds?.length
      ? {
          countryIds: snapshot.customCountryIds,
          label: snapshot.customLabel ?? "Focused practice",
        }
      : null;
    const quizCountries = customQuizSet
      ? resolveCustomCountries(customQuizSet.countryIds)
      : getCountriesForRegion(snapshot.region);

    if (quizCountries.length === 0) {
      clearQuizProgress();

      return;
    }

    const currentTargetCountry = getCountryById(
      quizCountries,
      snapshot.currentTargetIso ?? undefined,
    );

    set({
      // remainingSeconds is overridden below with the saved value; the
      // multiplier here only feeds createResetState's default computation.
      ...createResetState(
        snapshot.region,
        snapshot.mode,
        get().timerMultiplier,
        customQuizSet,
      ),
      guessedCountryIds: snapshot.guessedCountryIds,
      countryResults: snapshot.countryResults,
      incorrectAttempts: snapshot.incorrectAttempts,
      score: snapshot.score,
      remainingSeconds: snapshot.remainingSeconds,
      deadlineAt:
        snapshot.status === "running"
          ? deadlineFor(snapshot.remainingSeconds, get().timerMode)
          : null,
      targetQueue: snapshot.targetQueue,
      currentTargetCountry,
      gameStatus: snapshot.status,
    });
  },
  discardSavedQuiz: () => {
    clearQuizProgress();
  },
  setCurrentInput: (value) => set({ currentInput: value }),
  setCapitalHintEnabled: (enabled) => set({ capitalHintEnabled: enabled }),
  setAutoHideCorrectCard: (enabled) => {
    persistAutoHideCorrectCard(enabled);
    set({ autoHideCorrectCard: enabled });
  },
  setSoundEffectsEnabled: (enabled) => {
    persistSoundEffectsEnabled(enabled);
    set({ soundEffectsEnabled: enabled });
  },
  setTimerMultiplier: (multiplier) => {
    const timerMultiplier = normalizeTimerMultiplier(multiplier);

    persistTimerMultiplier(timerMultiplier);

    const state = get();

    // While setting up (idle), reflect the new timer in the starting clock
    // immediately. Never change an in-progress quiz's remaining time.
    set({
      timerMultiplier,
      ...(state.gameStatus === "idle"
        ? {
            remainingSeconds: getScaledTimerSeconds(
              state.selectedRegion,
              state.selectedMode,
              timerMultiplier,
            ),
          }
        : {}),
    });
  },
  setTimerMode: (mode) => {
    persistTimerMode(mode);

    const state = get();

    // Switching while a quiz is live re-arms (or disarms) the clock in place
    // rather than restarting the run.
    set({
      timerMode: mode,
      deadlineAt:
        state.gameStatus === "running"
          ? deadlineFor(
              remainingSecondsFrom(state.deadlineAt) ?? state.remainingSeconds,
              mode,
            )
          : null,
    });
  },
  recordFeedbackEvent: (kind, options) => {
    set({
      ...buildFeedbackEvent(get(), kind, options),
    });
  },
  clearCorrectCard: () => set({ lastMatchedCountry: null }),
  clearMissFeedback: () => set({ lastMissFeedback: null }),
  selectLearningCountry: (iso) => {
    const state = get();

    if (state.gameStatus !== "idle" || state.selectedSpecialRegion) {
      return;
    }

    const country =
      allCountries.find((country) => country.iso_a3 === iso) ?? null;

    set({
      learningCountry: country,
      selectedLearningFeature: country ? { kind: "country", country } : null,
    });
  },
  selectLearningFeature: (feature) => {
    const state = get();

    if (state.gameStatus !== "idle" || state.selectedSpecialRegion) {
      return;
    }

    set({
      selectedLearningFeature: feature,
      learningCountry: feature?.kind === "country" ? feature.country : null,
    });
  },
  clearLearningCountry: () =>
    set({ learningCountry: null, selectedLearningFeature: null }),
  clearLearningFeature: () =>
    set({ learningCountry: null, selectedLearningFeature: null }),
  submitTypeGuess: (country) => {
    const state = get();

    if (
      state.gameStatus !== "running" ||
      state.selectedMode !== "type-to-fill" ||
      !state.quizCountries.some((quizCountry) => quizCountry.iso_a3 === country.iso_a3) ||
      state.guessedCountryIds.includes(country.iso_a3)
    ) {
      return false;
    }

    const guessedCountryIds = [...state.guessedCountryIds, country.iso_a3];
    const isComplete = guessedCountryIds.length === state.quizCountries.length;
    const perfectRunSequence = isComplete
      ? state.perfectRunSequence + 1
      : state.perfectRunSequence;

    set({
      guessedCountryIds,
      currentInput: "",
      lastMatchedCountry: country,
      lastMatchSequence: state.lastMatchSequence + 1,
      isPerfectRun: isComplete,
      perfectRunSequence,
      score: guessedCountryIds.length,
      gameStatus: isComplete ? "completed" : "running",
      smartHint: null,
      ...buildFeedbackEvent(state, "correct", {
        countryId: country.iso_a3,
        completed: isComplete,
        perfect: isComplete,
      }),
    });

    return true;
  },
  submitIdentifyGuess: (country) => {
    const state = get();
    const target = state.currentTargetCountry;

    if (
      state.gameStatus !== "running" ||
      state.selectedMode !== "identify-shaded" ||
      !target
    ) {
      return { outcome: "ignored" };
    }

    const advanceTarget = (
      countryResults: Record<string, CountryResult>,
    ) => {
      const [nextTargetId, ...targetQueue] = state.targetQueue;
      const nextTarget = getCountryById(state.quizCountries, nextTargetId);
      const isComplete = !nextTarget;
      const score = Object.values(countryResults).filter(
        (result) => result.status === "correct" || result.status === "assisted",
      ).length;
      const isPerfectRun =
        isComplete &&
        isPerfectCountryResultSet(countryResults, state.quizCountries.length);

      return {
        currentTargetCountry: nextTarget,
        targetQueue,
        score,
        gameStatus: isComplete ? ("completed" as GameStatus) : state.gameStatus,
        isPerfectRun,
        perfectRunSequence: isPerfectRun
          ? state.perfectRunSequence + 1
          : state.perfectRunSequence,
      };
    };

    if (!country || country.iso_a3 !== target.iso_a3) {
      const attempts = (state.incorrectAttempts[target.iso_a3] ?? 0) + 1;
      const incorrectAttempts = {
        ...state.incorrectAttempts,
        [target.iso_a3]: attempts,
      };

      if (attempts >= 3) {
        const countryResults = {
          ...state.countryResults,
          [target.iso_a3]: {
            status: "missed" as CountryResultStatus,
            attemptsUsed: 3,
          },
        };
        const nextState = advanceTarget(countryResults);

        set({
          ...nextState,
          countryResults,
          incorrectAttempts,
          currentInput: "",
          currentTargetHints: [],
          smartHint: null,
          ...buildFeedbackEvent(state, "missed", {
            countryId: target.iso_a3,
            completed: nextState.gameStatus === "completed",
            perfect: false,
          }),
        });

        return { outcome: "missed", country: target };
      }

      const currentTargetHints = getIdentifyHints(
        target,
        attempts,
        state.capitalHintEnabled,
      );

      set({
        incorrectAttempts,
        currentTargetHints,
        smartHint: currentTargetHints.at(-1) ?? null,
        ...buildFeedbackEvent(state, "wrong", {
          countryId: target.iso_a3,
        }),
      });

      return { outcome: "wrong", country: target };
    }

    const attemptsUsed = state.incorrectAttempts[target.iso_a3] ?? 0;
    const resultStatus: CountryResultStatus =
      attemptsUsed === 0 ? "correct" : "assisted";
    const guessedCountryIds = [...state.guessedCountryIds, target.iso_a3];
    const countryResults = {
      ...state.countryResults,
      [target.iso_a3]: {
        status: resultStatus,
        attemptsUsed: attemptsUsed + 1,
      },
    };
    const nextState = advanceTarget(countryResults);

    set({
      ...nextState,
      guessedCountryIds,
      countryResults,
      currentInput: "",
      lastMatchedCountry: target,
      lastMatchSequence: state.lastMatchSequence + 1,
      currentTargetHints: [],
      smartHint: null,
      ...buildFeedbackEvent(state, resultStatus, {
        countryId: target.iso_a3,
        completed: nextState.gameStatus === "completed",
        perfect: nextState.isPerfectRun,
      }),
    });

    return { outcome: resultStatus, country: target };
  },
  submitCapitalGuess: (country) => {
    const state = get();
    const target = state.currentTargetCountry;

    if (
      state.gameStatus !== "running" ||
      state.selectedMode !== "capital-challenge" ||
      !target
    ) {
      return { outcome: "ignored" };
    }

    const advanceTarget = (
      countryResults: Record<string, CountryResult>,
    ) => {
      const [nextTargetId, ...targetQueue] = state.targetQueue;
      const nextTarget = getCountryById(state.quizCountries, nextTargetId);
      const isComplete = !nextTarget;
      const score = Object.values(countryResults).filter(
        (result) => result.status === "correct" || result.status === "assisted",
      ).length;
      const isPerfectRun =
        isComplete &&
        isPerfectCountryResultSet(countryResults, state.quizCountries.length);

      return {
        currentTargetCountry: nextTarget,
        targetQueue,
        score,
        gameStatus: isComplete ? ("completed" as GameStatus) : state.gameStatus,
        isPerfectRun,
        perfectRunSequence: isPerfectRun
          ? state.perfectRunSequence + 1
          : state.perfectRunSequence,
      };
    };

    if (!country || country.iso_a3 !== target.iso_a3) {
      const attempts = (state.incorrectAttempts[target.iso_a3] ?? 0) + 1;
      const incorrectAttempts = {
        ...state.incorrectAttempts,
        [target.iso_a3]: attempts,
      };

      if (attempts >= 3) {
        const countryResults = {
          ...state.countryResults,
          [target.iso_a3]: {
            status: "missed" as CountryResultStatus,
            attemptsUsed: 3,
          },
        };
        const nextState = advanceTarget(countryResults);

        set({
          ...nextState,
          countryResults,
          incorrectAttempts,
          currentInput: "",
          currentTargetHints: [],
          smartHint: null,
          ...buildFeedbackEvent(state, "missed", {
            countryId: target.iso_a3,
            completed: nextState.gameStatus === "completed",
            perfect: false,
          }),
        });

        return { outcome: "missed", country: target };
      }

      const currentTargetHints = getCapitalChallengeHints(
        target,
        attempts,
        state.selectedRegion,
      );

      set({
        incorrectAttempts,
        currentTargetHints,
        smartHint: currentTargetHints.at(-1) ?? null,
        ...buildFeedbackEvent(state, "wrong", {
          countryId: target.iso_a3,
        }),
      });

      return { outcome: "wrong", country: target };
    }

    const attemptsUsed = state.incorrectAttempts[target.iso_a3] ?? 0;
    const resultStatus: CountryResultStatus =
      attemptsUsed === 0 ? "correct" : "assisted";
    const guessedCountryIds = [...state.guessedCountryIds, target.iso_a3];
    const countryResults = {
      ...state.countryResults,
      [target.iso_a3]: {
        status: resultStatus,
        attemptsUsed: attemptsUsed + 1,
      },
    };
    const nextState = advanceTarget(countryResults);

    set({
      ...nextState,
      guessedCountryIds,
      countryResults,
      currentInput: "",
      lastMatchedCountry: target,
      lastMatchSequence: state.lastMatchSequence + 1,
      currentTargetHints: [],
      smartHint: null,
      ...buildFeedbackEvent(state, resultStatus, {
        countryId: target.iso_a3,
        completed: nextState.gameStatus === "completed",
        perfect: nextState.isPerfectRun,
      }),
    });

    return { outcome: resultStatus, country: target };
  },
  submitMapClickGuess: (clickedIso, source) => {
    const state = get();
    const target = state.currentTargetCountry;
    const clickedCountry = clickedIso
      ? getCountryById(state.quizCountries, clickedIso)
      : null;

    set({
      debug: {
        ...state.debug,
        lastClickedIso: clickedCountry?.iso_a3 ?? clickedIso,
        lastClickedName: clickedCountry?.name ?? null,
        lastClickSource: source,
      },
    });

    if (
      state.gameStatus !== "running" ||
      state.selectedMode !== "click-country" ||
      !target
    ) {
      return { outcome: "ignored", clickedCountry };
    }

    if (!clickedCountry) {
      return { outcome: "ignored", country: target, clickedCountry };
    }

    const advanceTarget = (
      countryResults: Record<string, CountryResult>,
    ) => {
      const [nextTargetId, ...targetQueue] = state.targetQueue;
      const nextTarget = getCountryById(state.quizCountries, nextTargetId);
      const isComplete = !nextTarget;
      const score = Object.values(countryResults).filter(
        (result) => result.status === "correct" || result.status === "assisted",
      ).length;
      const isPerfectRun =
        isComplete &&
        isPerfectCountryResultSet(countryResults, state.quizCountries.length);

      return {
        currentTargetCountry: nextTarget,
        targetQueue,
        score,
        gameStatus: isComplete ? ("completed" as GameStatus) : state.gameStatus,
        isPerfectRun,
        perfectRunSequence: isPerfectRun
          ? state.perfectRunSequence + 1
          : state.perfectRunSequence,
      };
    };

    if (clickedCountry.iso_a3 !== target.iso_a3) {
      const attempts = (state.incorrectAttempts[target.iso_a3] ?? 0) + 1;
      const incorrectAttempts = {
        ...state.incorrectAttempts,
        [target.iso_a3]: attempts,
      };

      if (attempts >= 3) {
        const countryResults = {
          ...state.countryResults,
          [target.iso_a3]: {
            status: "missed" as CountryResultStatus,
            attemptsUsed: 3,
          },
        };
        const nextState = advanceTarget(countryResults);

        set({
          ...nextState,
          countryResults,
          incorrectAttempts,
          // Last attempt: the answer is revealed, so show the wrong pick and
          // the right country together.
          lastMissFeedback: {
            wrongIso: clickedCountry.iso_a3,
            correctIso: target.iso_a3,
            sequence: state.feedbackSequence + 1,
          },
          currentInput: "",
          currentTargetHints: [],
          smartHint: null,
          ...buildFeedbackEvent(state, "missed", {
            countryId: target.iso_a3,
            completed: nextState.gameStatus === "completed",
            perfect: false,
          }),
        });

        return { outcome: "missed", country: target, clickedCountry };
      }

      const currentTargetHints = getClickCountryHints(
        target,
        attempts,
        state.selectedRegion,
      );

      set({
        incorrectAttempts,
        currentTargetHints,
        smartHint: currentTargetHints.at(-1) ?? null,
        // Earlier attempts only mark the mistake; revealing the target here
        // would hand over the answer.
        lastMissFeedback: {
          wrongIso: clickedCountry.iso_a3,
          correctIso: null,
          sequence: state.feedbackSequence + 1,
        },
        ...buildFeedbackEvent(state, "wrong", {
          countryId: target.iso_a3,
        }),
      });

      return { outcome: "wrong", country: target, clickedCountry };
    }

    const attemptsUsed = state.incorrectAttempts[target.iso_a3] ?? 0;
    const resultStatus: CountryResultStatus =
      attemptsUsed === 0 ? "correct" : "assisted";
    const guessedCountryIds = [...state.guessedCountryIds, target.iso_a3];
    const countryResults = {
      ...state.countryResults,
      [target.iso_a3]: {
        status: resultStatus,
        attemptsUsed: attemptsUsed + 1,
      },
    };
    const nextState = advanceTarget(countryResults);

    set({
      ...nextState,
      guessedCountryIds,
      countryResults,
      currentInput: "",
      lastMatchedCountry: target,
      lastMatchSequence: state.lastMatchSequence + 1,
      currentTargetHints: [],
      smartHint: null,
      ...buildFeedbackEvent(state, resultStatus, {
        countryId: target.iso_a3,
        completed: nextState.gameStatus === "completed",
        perfect: nextState.isPerfectRun,
      }),
    });

    return { outcome: resultStatus, country: target, clickedCountry };
  },
  tick: () => {
    const state = get();

    if (state.gameStatus !== "running") {
      return;
    }

    // Untimed runs have no deadline; there is nothing to count down.
    const remainingSeconds = remainingSecondsFrom(state.deadlineAt);

    if (remainingSeconds === null || remainingSeconds === state.remainingSeconds) {
      return;
    }

    set(
      remainingSeconds === 0
        ? {
            remainingSeconds,
            deadlineAt: null,
            gameStatus: "failed",
            isPerfectRun: false,
            currentInput: "",
            currentTargetCountry: null,
            targetQueue: [],
            currentTargetHints: [],
            smartHint: null,
          }
        : {
            remainingSeconds,
            gameStatus: state.gameStatus,
          },
    );
  },
  restoreMapFeatureState: () => undefined,
  setMapDebug: (debug) =>
    set((state) => ({
      debug: {
        ...state.debug,
        ...debug,
      },
    })),
}));

// Persist in-progress quizzes so a reload can offer to resume them. A fresh,
// never-started session stays idle on load, so we leave any saved quiz intact
// (idle → idle) and only clear once a quiz actually ends or is abandoned.
const persistedSlicesEqual = (state: GameState, previousState: GameState) =>
  state.gameStatus === previousState.gameStatus &&
  state.selectedRegion === previousState.selectedRegion &&
  state.selectedMode === previousState.selectedMode &&
  state.guessedCountryIds === previousState.guessedCountryIds &&
  state.countryResults === previousState.countryResults &&
  state.incorrectAttempts === previousState.incorrectAttempts &&
  state.score === previousState.score &&
  state.remainingSeconds === previousState.remainingSeconds &&
  state.targetQueue === previousState.targetQueue &&
  state.currentTargetCountry === previousState.currentTargetCountry;

if (typeof window !== "undefined") {
  useGameStore.subscribe((state, previousState) => {
    if (isResumableStatus(state.gameStatus)) {
      // The subscriber fires on every set() (keystrokes, map debug updates);
      // only serialize and write when a persisted slice actually changed.
      if (persistedSlicesEqual(state, previousState)) {
        return;
      }

      const snapshot = buildQuizProgressSnapshot(state);

      if (snapshot) {
        writeQuizProgress(snapshot);
      }

      return;
    }

    if (
      state.gameStatus === "idle" &&
      previousState.gameStatus === "idle"
    ) {
      return;
    }

    clearQuizProgress();
  });
}
