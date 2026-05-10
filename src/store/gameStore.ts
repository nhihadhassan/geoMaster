import { create } from "zustand";
import {
  getCountriesForRegion,
  getRegionConfig,
  type Country,
  type QuizRegion,
} from "@/data/countries";

export type GameStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "gave-up";
export type GameMode = "type-to-fill" | "identify-shaded";
export type CountryResultStatus = "correct" | "assisted" | "missed";

export type CountryResult = {
  status: CountryResultStatus;
  attemptsUsed: number;
};

export type IdentifyGuessResult = {
  outcome: "correct" | "assisted" | "wrong" | "missed" | "ignored";
  country?: Country;
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
  insetMissedCount: number;
};

type GameState = {
  selectedRegion: QuizRegion;
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
  currentTargetHints: string[];
  smartHint: string | null;
  capitalHintEnabled: boolean;
  debug: DebugState;
  selectRegion: (region: QuizRegion) => void;
  selectMode: (mode: GameMode) => void;
  startQuiz: () => void;
  giveUp: () => void;
  resetQuiz: () => void;
  backToRegionSelect: () => void;
  setCurrentInput: (value: string) => void;
  setCapitalHintEnabled: (enabled: boolean) => void;
  submitTypeGuess: (country: Country) => boolean;
  submitIdentifyGuess: (country: Country | null) => IdentifyGuessResult;
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

const createResetState = (
  selectedRegion: QuizRegion,
  selectedMode: GameMode,
) => {
  const quizCountries = getCountriesForRegion(selectedRegion);
  const regionConfig = getRegionConfig(selectedRegion);

  return {
    selectedRegion,
    selectedMode,
    quizCountries,
    guessedCountryIds: [],
    countryResults: {},
    currentInput: "",
    currentTargetCountry: null,
    targetQueue: [],
    score: 0,
    total: quizCountries.length,
    remainingSeconds: regionConfig.timerSeconds,
    gameStatus: "idle" as GameStatus,
    incorrectAttempts: {},
    lastMatchedCountry: null,
    lastMatchSequence: 0,
    currentTargetHints: [],
    smartHint: null,
    capitalHintEnabled: false,
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  ...createResetState("south-america", "type-to-fill"),
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
    insetMissedCount: 0,
  },
  selectRegion: (selectedRegion) => {
    const { selectedMode } = get();

    set(createResetState(selectedRegion, selectedMode));
  },
  selectMode: (selectedMode) => {
    const { selectedRegion } = get();

    set(createResetState(selectedRegion, selectedMode));
  },
  startQuiz: () => {
    const state = get();

    if (state.gameStatus === "running") {
      return;
    }

    if (state.selectedMode === "identify-shaded") {
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
        currentTargetHints: [],
        smartHint: null,
        incorrectAttempts: {},
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
      currentTargetHints: [],
      smartHint: null,
      incorrectAttempts: {},
    });
  },
  resetQuiz: () => {
    const { selectedRegion, selectedMode } = get();

    set(createResetState(selectedRegion, selectedMode));
  },
  giveUp: () => {
    const state = get();

    if (state.gameStatus !== "running") {
      return;
    }

    set({
      gameStatus: "gave-up",
      currentInput: "",
      currentTargetCountry: null,
      targetQueue: [],
      currentTargetHints: [],
      smartHint: null,
    });
  },
  backToRegionSelect: () => {
    const { selectedRegion, selectedMode } = get();

    set(createResetState(selectedRegion, selectedMode));
  },
  setCurrentInput: (value) => set({ currentInput: value }),
  setCapitalHintEnabled: (enabled) => set({ capitalHintEnabled: enabled }),
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

    set({
      guessedCountryIds,
      currentInput: "",
      lastMatchedCountry: country,
      lastMatchSequence: state.lastMatchSequence + 1,
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

      return {
        currentTargetCountry: nextTarget,
        targetQueue,
        score,
        gameStatus: isComplete ? ("completed" as GameStatus) : state.gameStatus,
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

      const currentTargetHints =
        attempts === 1
          ? [`Starts with ${target.name.charAt(0).toUpperCase()}`]
          : [
              `Starts with ${target.name.charAt(0).toUpperCase()}`,
              state.capitalHintEnabled
                ? `Starts with ${target.name.charAt(0).toUpperCase()}, ends with ${target.name.charAt(target.name.length - 1).toUpperCase()}`
                : `Capital: ${target.capital}`,
            ];

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
