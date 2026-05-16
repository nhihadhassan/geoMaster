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
  isPerfectRun: boolean;
  perfectRunSequence: number;
  currentTargetHints: string[];
  smartHint: string | null;
  capitalHintEnabled: boolean;
  autoHideCorrectCard: boolean;
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
  setCurrentInput: (value: string) => void;
  setCapitalHintEnabled: (enabled: boolean) => void;
  setAutoHideCorrectCard: (enabled: boolean) => void;
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

const createResetState = (
  selectedRegion: QuizRegion,
  selectedMode: GameMode,
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
    remainingSeconds: getTimerSeconds(selectedRegion, selectedMode),
    gameStatus: "idle" as GameStatus,
    incorrectAttempts: {},
    lastMatchedCountry: null,
    lastMatchSequence: 0,
    isPerfectRun: false,
    perfectRunSequence: 0,
    currentTargetHints: [],
    smartHint: null,
    capitalHintEnabled: false,
    learningCountry: null,
    selectedLearningFeature: null,
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  ...createResetState("south-america", "type-to-fill"),
  autoHideCorrectCard: readInitialAutoHideCorrectCard(),
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
    const { selectedMode } = get();

    set(createResetState(selectedRegion, selectedMode));
  },
  selectSpecialRegion: (selectedSpecialRegion) => {
    const { selectedRegion, selectedMode } = get();

    set({
      ...createResetState(selectedRegion, selectedMode),
      selectedSpecialRegion,
      lastMatchedCountry: null,
      learningCountry: null,
      selectedLearningFeature: null,
    });
  },
  clearSpecialRegion: () => {
    const { selectedRegion, selectedMode } = get();

    set(createResetState(selectedRegion, selectedMode));
  },
  selectMode: (selectedMode) => {
    const { selectedRegion } = get();

    set(createResetState(selectedRegion, selectedMode));
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
    const { selectedRegion, selectedMode } = get();

    set(createResetState(selectedRegion, selectedMode));
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
    });
  },
  backToRegionSelect: () => {
    const { selectedRegion, selectedMode } = get();

    set(createResetState(selectedRegion, selectedMode));
  },
  setCurrentInput: (value) => set({ currentInput: value }),
  setCapitalHintEnabled: (enabled) => set({ capitalHintEnabled: enabled }),
  setAutoHideCorrectCard: (enabled) => {
    persistAutoHideCorrectCard(enabled);
    set({ autoHideCorrectCard: enabled });
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
