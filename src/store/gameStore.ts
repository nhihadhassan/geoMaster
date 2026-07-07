import { create } from "zustand";
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

export type GameStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "gave-up";
export type GameMode =
  | "type-to-fill"
  | "identify-shaded"
  | "click-country"
  | "capital-challenge";
export type CountryResultStatus = "correct" | "assisted" | "missed";

export type CountryResult = {
  status: CountryResultStatus;
  attemptsUsed: number;
};

export type IdentifyGuessResult = {
  outcome: "correct" | "assisted" | "wrong" | "missed" | "ignored";
  country?: Country;
  clickedCountry?: Country | null;
};

export type QuizFeedbackEvent = {
  kind: GeoSoundEvent;
  sequence: number;
  countryId?: string;
  completed?: boolean;
  perfect?: boolean;
};

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
  quizCountries: Country[];
  guessedCountryIds: string[];
  countryResults: Record<string, CountryResult>;
  currentInput: string;
  currentTargetCountry: Country | null;
  targetQueue: string[];
  score: number;
  total: number;
  remainingSeconds: number;
  gameStatus: GameStatus;
  incorrectAttempts: Record<string, number>;
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
  recordFeedbackEvent: (
    kind: GeoSoundEvent,
    options?: Omit<QuizFeedbackEvent, "kind" | "sequence">,
  ) => void;
  clearCorrectCard: () => void;
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

const AUTO_HIDE_CORRECT_CARD_KEY = "geomaster-auto-hide-correct-card";
const SOUND_EFFECTS_ENABLED_KEY = "geomaster-sound-effects-enabled";
const QUIZ_PROGRESS_KEY = "geomaster-quiz-progress";
const QUIZ_PROGRESS_VERSION = 1;
const TIMER_MULTIPLIER_KEY = "geomaster-timer-multiplier";

export type QuizProgressSnapshot = {
  v: number;
  region: QuizRegion;
  mode: GameMode;
  status: "running" | "paused";
  guessedCountryIds: string[];
  countryResults: Record<string, CountryResult>;
  incorrectAttempts: Record<string, number>;
  score: number;
  total: number;
  remainingSeconds: number;
  targetQueue: string[];
  currentTargetIso: string | null;
  savedAt: number;
};

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
    savedAt: Date.now(),
  };
};

const writeQuizProgress = (snapshot: QuizProgressSnapshot) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable (private mode, quota). The quiz keeps
    // running; it just won't survive a reload.
  }
};

const clearQuizProgress = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(QUIZ_PROGRESS_KEY);
  } catch {
    // Same storage caveat as writeQuizProgress.
  }
};

export const readQuizProgress = (): QuizProgressSnapshot | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(QUIZ_PROGRESS_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as QuizProgressSnapshot;

    if (
      !parsed ||
      parsed.v !== QUIZ_PROGRESS_VERSION ||
      (parsed.status !== "running" && parsed.status !== "paused") ||
      getCountriesForRegion(parsed.region).length === 0
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const readInitialAutoHideCorrectCard = () => {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(AUTO_HIDE_CORRECT_CARD_KEY) !== "false";
};

const persistAutoHideCorrectCard = (enabled: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTO_HIDE_CORRECT_CARD_KEY, String(enabled));
};

const readInitialSoundEffectsEnabled = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SOUND_EFFECTS_ENABLED_KEY) === "true";
};

const persistSoundEffectsEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SOUND_EFFECTS_ENABLED_KEY, String(enabled));
};

// Timer multiplier lets players give themselves more time before starting.
// 1 = the region's standard timer; larger values scale it up.
export const TIMER_MULTIPLIER_OPTIONS = [1, 1.5, 2, 3] as const;

const DEFAULT_TIMER_MULTIPLIER = 1;

const normalizeTimerMultiplier = (value: number) =>
  (TIMER_MULTIPLIER_OPTIONS as readonly number[]).includes(value)
    ? value
    : DEFAULT_TIMER_MULTIPLIER;

const readInitialTimerMultiplier = () => {
  if (typeof window === "undefined") {
    return DEFAULT_TIMER_MULTIPLIER;
  }

  return normalizeTimerMultiplier(
    Number(window.localStorage.getItem(TIMER_MULTIPLIER_KEY)),
  );
};

const persistTimerMultiplier = (multiplier: number) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TIMER_MULTIPLIER_KEY, String(multiplier));
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

const createResetState = (
  selectedRegion: QuizRegion,
  selectedMode: GameMode,
  timerMultiplier: number,
) => {
  const quizCountries = getCountriesForRegion(selectedRegion);

  return {
    selectedRegion,
    selectedSpecialRegion: null,
    selectedMode,
    quizCountries,
    guessedCountryIds: [],
    countryResults: {},
    currentInput: "",
    currentTargetCountry: null,
    targetQueue: [],
    score: 0,
    total: quizCountries.length,
    remainingSeconds: getScaledTimerSeconds(
      selectedRegion,
      selectedMode,
      timerMultiplier,
    ),
    gameStatus: "idle" as GameStatus,
    incorrectAttempts: {},
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

export const useGameStore = create<GameState>((set, get) => ({
  ...createResetState("south-america", "type-to-fill", initialTimerMultiplier),
  autoHideCorrectCard: readInitialAutoHideCorrectCard(),
  soundEffectsEnabled: readInitialSoundEffectsEnabled(),
  timerMultiplier: initialTimerMultiplier,
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

    if (isTargetQueueMode(state.selectedMode)) {
      const [firstTargetId, ...targetQueue] = shuffleIds(state.quizCountries);

      set({
        gameStatus: "running",
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
  pauseQuiz: () => {
    const state = get();

    if (state.gameStatus !== "running") {
      return;
    }

    set({
      gameStatus: "paused",
      currentInput: "",
      smartHint: null,
    });
  },
  resumeQuiz: () => {
    const state = get();

    if (state.gameStatus !== "paused") {
      return;
    }

    set({ gameStatus: "running" });
  },
  resetQuiz: () => {
    const { selectedRegion, selectedMode, timerMultiplier } = get();

    set(createResetState(selectedRegion, selectedMode, timerMultiplier));
  },
  giveUp: () => {
    const state = get();

    if (state.gameStatus !== "running" && state.gameStatus !== "paused") {
      return;
    }

    set({
      gameStatus: "gave-up",
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

    const quizCountries = getCountriesForRegion(snapshot.region);

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
      ...createResetState(snapshot.region, snapshot.mode, get().timerMultiplier),
      guessedCountryIds: snapshot.guessedCountryIds,
      countryResults: snapshot.countryResults,
      incorrectAttempts: snapshot.incorrectAttempts,
      score: snapshot.score,
      remainingSeconds: snapshot.remainingSeconds,
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
  recordFeedbackEvent: (kind, options) => {
    set({
      ...buildFeedbackEvent(get(), kind, options),
    });
  },
  clearCorrectCard: () => set({ lastMatchedCountry: null }),
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

    const remainingSeconds = Math.max(state.remainingSeconds - 1, 0);

    set(
      remainingSeconds === 0
        ? {
            remainingSeconds,
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
