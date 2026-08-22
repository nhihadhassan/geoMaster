"use client";

import type {
  GeoJSONSource,
  Map,
  MapMouseEvent,
} from "mapbox-gl";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FeatureCollection, Geometry } from "geojson";
import { AntarcticaEducationCard } from "@/components/game/AntarcticaEducationCard";
import { GameHud } from "@/components/game/GameHud";
import { LandingPage } from "@/components/game/LandingPage";
import { LearningModeCard } from "@/components/game/LearningModeCard";
import { PauseOverlay } from "@/components/game/PauseOverlay";
import { PerfectRunCelebration } from "@/components/game/PerfectRunCelebration";
import { PremiumControls } from "@/components/game/PremiumControls";
import { ResultsDashboard } from "@/components/game/ResultsDashboard";
import { ResumePrompt } from "@/components/game/ResumePrompt";
import { TargetHintCard } from "@/components/game/TargetHintCard";
import { TypeToFillInput } from "@/components/game/TypeToFillInput";
import { features } from "@/config/features";
import { caribbeanCountryIds } from "@/data/caribbean";

const CaribbeanInsetMap = dynamic(
  () =>
    import("@/components/map/CaribbeanInsetMap").then(
      (mapModule) => mapModule.CaribbeanInsetMap,
    ),
  { ssr: false },
);
import { CountryPopup } from "@/components/map/CountryPopup";
import { ExploreSearch } from "@/components/map/ExploreSearch";
import { IdlePromptToast } from "@/components/map/IdlePromptToast";
import { MapControls } from "@/components/map/MapControls";
import {
  breathe,
  easeOutCubic,
  FEEDBACK_FLASH_MS,
  MISS_MARK_MS,
  MISS_REVEAL_MS,
  MOTION_EPSILON,
  mix,
  REMAINING_BREATH_PERIOD_MS,
  TARGET_BREATH_PERIOD_MS,
} from "@/components/map/mapMotion";
import { useMapMotion } from "@/components/map/useMapMotion";
import { useIdleGlobeRotation } from "@/components/map/useIdleGlobeRotation";
import { MapDebugPanel } from "@/components/map/MapDebugPanel";
import { MapErrorBoundary } from "@/components/map/MapErrorBoundary";
import { MapUnavailable } from "@/components/map/MapUnavailable";
import {
  CITY_CIRCLE_LAYER_ID,
  CITY_LABEL_LAYER_ID,
  CITY_SOURCE_ID,
  DEBUG_LABEL_LAYER_ID,
  DEBUG_LABEL_SOURCE_ID,
  DEBUG_LEADER_LAYER_ID,
  DEBUG_LEADER_SOURCE_ID,
  FILL_LAYER_ID,
  GUIDE_CIRCLE_LAYER_ID,
  GUIDE_CIRCLE_SOURCE_ID,
  GUIDE_LINE_LAYER_ID,
  GUIDE_LINE_SOURCE_ID,
  LABEL_ANCHORS,
  LABEL_KINDS,
  LABEL_LAYER_IDS,
  LABEL_LAYER_PREFIX,
  LABEL_SOURCE_ID,
  LANDMARK_CIRCLE_LAYER_ID,
  LANDMARK_LABEL_LAYER_ID,
  LANDMARK_SOURCE_ID,
  LEADER_LAYER_ID,
  LEADER_SOURCE_ID,
  LEARNING_LABEL_LAYER_IDS,
  LEARNING_LABEL_LAYER_PREFIX,
  LEARNING_LABEL_SOURCE_ID,
  LEARNING_LEADER_LAYER_ID,
  LEARNING_LEADER_SOURCE_ID,
  LINE_LAYER_ID,
  MAP_STYLE,
  PHYSICAL_LABEL_LAYER_ID,
  PHYSICAL_SOURCE_ID,
  REMAINING_PULSE_FILL_LAYER_ID,
  REMAINING_PULSE_LINE_LAYER_ID,
  SOURCE_ID,
  SUBDIVISION_LABEL_LAYER_ID,
  SUBDIVISION_SOURCE_ID,
  TARGET_GLOW_LAYER_ID,
  addTerrainAndFog,
  buildFillColorExpression,
  buildFillOpacityExpression,
  buildRemainingPulseFilter,
  getMapDebugSnapshot,
  getPulseReason,
  hideMapLabelsAndRoads,
  setCountryFeatureState,
  setLearningLayerVisibility,
} from "@/components/map/mapLayers";
import {
  countries,
  getRegionConfig,
  quizCountryIds,
  type Country,
} from "@/data/countries";
import {
  buildLabelCollections,
  buildLearningLabelCollections,
} from "@/data/labelPlacements";
import {
  cityFeatureCollection,
  findLearningFeature,
  landmarkFeatureCollection,
  physicalFeatureCollection,
  subdivisionFeatureCollection,
} from "@/data/learningFeatures";
import { buildSmallCountryGuideCollections } from "@/data/smallCountryGuides";
import {
  useWorldTopology,
  type CountryProperties,
} from "@/hooks/useWorldTopology";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import { useRecordQuizProgress } from "@/hooks/useRecordQuizProgress";
import { useProgressStore } from "@/store/progressStore";
import { getWeakestCountryIds } from "@/utils/countryMastery";
import {
  useDocumentVisible,
  useMobilePerformanceMode,
  usePrefersReducedMotion,
} from "@/hooks/useMapEnvironment";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  readQuizProgress,
  useGameStore,
  type CountryResult,
  type QuizProgressSnapshot,
} from "@/store/gameStore";
import { getCountryFunFacts } from "@/utils/countryEducation";
import type { ExploreSearchResult } from "@/utils/exploreSearch";
import { isWebglAvailable } from "@/utils/webglSupport";

const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
const IDLE_ROTATION_INITIAL_DELAY_MS = 8_000;
const IDLE_ROTATION_RESUME_DELAY_MS = 60_000;
const IDLE_PROMPT_INITIAL_DELAY_MS = 16_000;
const IDLE_PROMPT_INTERVAL_MS = 48_000;
const IDLE_PROMPT_VISIBLE_MS = 6_500;
const IDLE_PROMPT_COUNTRY_IDS = [
  "CAN",
  "USA",
  "BRA",
  "FRA",
  "JPN",
  "EGY",
  "AUS",
  "IND",
];
const GENERIC_IDLE_PROMPTS = [
  "Click any country to learn its capital, languages, and story.",
  "Zoom in to discover states, cities, landmarks, and natural features.",
  "Choose a region when you are ready to turn exploration into a quiz.",
  "Try dragging the globe, then click a country that catches your eye.",
];




export function MapContainer() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const previousGuessedIdsRef = useRef<string[]>([]);
  const previousTargetIdRef = useRef<string | null>(null);
  const framingKeyboardInsetRef = useRef(0);
  const feedbackGlowTimeoutRef = useRef<number | null>(null);
  const missFeedbackTimeoutRef = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  // A fatal failure means the canvas will never render (no WebGL, or the Map
  // constructor threw). Transient tile/style errors keep using the toast.
  const [mapFatalError, setMapFatalError] = useState<string | null>(null);
  const [mapRetryKey, setMapRetryKey] = useState(0);
  // Mapbox is the heaviest thing on the page and the landing screen renders its
  // own cobe globe on top of it, so hold initialization until the browser is
  // idle (or the user leaves the landing, whichever comes first). The warm-up
  // means the map is normally ready by the time the landing is dismissed.
  const [mapInitAllowed, setMapInitAllowed] = useState(!features.lazyMapInit);
  const [insetLabelSourceLoaded, setInsetLabelSourceLoaded] = useState(false);
  const [debugLabelIds, setDebugLabelIds] = useState<string[]>([]);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [landingOpen, setLandingOpen] = useState(true);
  const [resumableQuiz, setResumableQuiz] =
    useState<QuizProgressSnapshot | null>(null);
  const [regionPanelOpen, setRegionPanelOpen] = useState(false);
  const [idleInteractionKey, setIdleInteractionKey] = useState(0);
  const [hasMapInteraction, setHasMapInteraction] = useState(false);
  const [idlePrompt, setIdlePrompt] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(1.7);
  const [caribbeanInsetExpanded, setCaribbeanInsetExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const documentVisible = useDocumentVisible();
  const mobilePerformanceMode = useMobilePerformanceMode(prefersReducedMotion);
  const keyboardInset = useKeyboardInset();
  const initialMapPerformanceModeRef = useRef(mobilePerformanceMode);
  const mapAnimationsEnabled =
    documentVisible && !prefersReducedMotion && !mobilePerformanceMode;
  // One clock for every map effect below, so they share a timebase and a
  // single on/off switch.
  const subscribeMotion = useMapMotion(mapAnimationsEnabled);
  const [debugUiEnabled] = useState(() => {
    if (!IS_DEVELOPMENT || typeof window === "undefined") {
      return false;
    }

    const params = new URLSearchParams(window.location.search);

    return (
      params.has("debug") ||
      window.localStorage.getItem("geomaster-debug") === "1"
    );
  });
  const { data: topologyData, error: topologyError } = useWorldTopology();
  const selectedRegion = useGameStore((state) => state.selectedRegion);
  const selectedSpecialRegion = useGameStore(
    (state) => state.selectedSpecialRegion,
  );
  const selectedMode = useGameStore((state) => state.selectedMode);
  const quizCountries = useGameStore((state) => state.quizCountries);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const countryResults = useGameStore((state) => state.countryResults);
  const lastMatchedCountry = useGameStore((state) => state.lastMatchedCountry);
  const lastMissFeedback = useGameStore((state) => state.lastMissFeedback);
  const lastMatchSequence = useGameStore((state) => state.lastMatchSequence);
  const lastFeedbackEvent = useGameStore((state) => state.lastFeedbackEvent);
  const currentTargetCountry = useGameStore(
    (state) => state.currentTargetCountry,
  );
  const currentTargetHints = useGameStore((state) => state.currentTargetHints);
  const incorrectAttempts = useGameStore((state) => state.incorrectAttempts);
  const smartHint = useGameStore((state) => state.smartHint);
  const capitalHintEnabled = useGameStore(
    (state) => state.capitalHintEnabled,
  );
  const gameStatus = useGameStore((state) => state.gameStatus);
  const pauseQuiz = useGameStore((state) => state.pauseQuiz);
  const resumeQuiz = useGameStore((state) => state.resumeQuiz);
  const resumeSavedQuiz = useGameStore((state) => state.resumeSavedQuiz);
  const discardSavedQuiz = useGameStore((state) => state.discardSavedQuiz);
  const backToRegionSelect = useGameStore((state) => state.backToRegionSelect);
  const remainingSeconds = useGameStore((state) => state.remainingSeconds);
  const setCapitalHintEnabled = useGameStore(
    (state) => state.setCapitalHintEnabled,
  );
  const clearSpecialRegion = useGameStore((state) => state.clearSpecialRegion);
  const autoHideCorrectCard = useGameStore(
    (state) => state.autoHideCorrectCard,
  );
  const isPerfectRun = useGameStore((state) => state.isPerfectRun);
  const perfectRunSequence = useGameStore(
    (state) => state.perfectRunSequence,
  );
  const clearCorrectCard = useGameStore((state) => state.clearCorrectCard);
  const clearMissFeedback = useGameStore((state) => state.clearMissFeedback);
  const selectedLearningFeature = useGameStore(
    (state) => state.selectedLearningFeature,
  );
  const selectLearningCountry = useGameStore(
    (state) => state.selectLearningCountry,
  );
  const selectLearningFeature = useGameStore(
    (state) => state.selectLearningFeature,
  );
  const clearLearningFeature = useGameStore(
    (state) => state.clearLearningFeature,
  );
  const submitMapClickGuess = useGameStore(
    (state) => state.submitMapClickGuess,
  );
  const setMapDebug = useGameStore((state) => state.setMapDebug);
  const startCustomQuiz = useGameStore((state) => state.startCustomQuiz);
  const startQuiz = useGameStore((state) => state.startQuiz);
  const progressHydrated = useProgressStore((state) => state.hydrated);
  const countryProgress = useProgressStore((state) => state.countries);

  useSoundEffects(lastFeedbackEvent, { documentVisible });
  useRecordQuizProgress();
  const daily = useDailyChallenge();

  useEffect(() => {
    if (mapInitAllowed) {
      return;
    }

    if (!landingOpen) {
      const timeoutId = window.setTimeout(() => setMapInitAllowed(true), 0);

      return () => window.clearTimeout(timeoutId);
    }

    const allow = () => setMapInitAllowed(true);
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(allow, { timeout: 1500 });

      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const timeoutId = window.setTimeout(allow, 900);

    return () => window.clearTimeout(timeoutId);
  }, [landingOpen, mapInitAllowed]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setResumableQuiz(readQuizProgress());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Once any quiz starts, the snapshot read at mount is dead — the store
    // subscriber has overwritten or cleared it — so drop it rather than let
    // the resume prompt reappear with a stale save after that quiz ends.
    if (gameStatus === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => setResumableQuiz(null), 0);

    return () => window.clearTimeout(timeoutId);
  }, [gameStatus]);

  const quizCountryIdList = useMemo(
    () => quizCountries.map((country) => country.iso_a3),
    [quizCountries],
  );
  const topologyCountryIds = useMemo(
    () =>
      new Set(
        topologyData?.features.map((feature) => feature.properties.iso_a3) ??
          [],
      ),
    [topologyData],
  );
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";
  const resultEntries = useMemo(
    () => Object.entries(countryResults) as Array<[string, CountryResult]>,
    [countryResults],
  );
  const resolvedCountryIds = useMemo(
    () => resultEntries.map(([iso]) => iso),
    [resultEntries],
  );
  const assistedCountryIds = useMemo(
    () =>
      resultEntries
        .filter(([, result]) => result.status === "assisted")
        .map(([iso]) => iso),
    [resultEntries],
  );
  const modeBMissedCountryIds = useMemo(
    () =>
      resultEntries
        .filter(([, result]) => result.status === "missed")
        .map(([iso]) => iso),
    [resultEntries],
  );
  const isTargetQueueMode =
    selectedMode === "identify-shaded" ||
    selectedMode === "click-country" ||
    selectedMode === "capital-challenge";
  const learningModeActive = gameStatus === "idle" && !selectedSpecialRegion;
  const isFinished =
    gameStatus === "completed" ||
    gameStatus === "failed" ||
    gameStatus === "gave-up";
  const idlePrompts = useMemo(() => {
    const countryPrompts = IDLE_PROMPT_COUNTRY_IDS.flatMap((iso) => {
      const country = countries.find((item) => item.iso_a3 === iso);

      if (!country) {
        return [];
      }

      const [fact] = getCountryFunFacts(country);

      return fact ? [`Did you know? ${fact}`] : [];
    });

    return [...GENERIC_IDLE_PROMPTS, ...countryPrompts];
  }, []);
  const missTeachingNote = useMemo(() => {
    if (!features.mapMissTeaching || !lastMissFeedback) {
      return null;
    }

    const wrongCountry = countries.find(
      (country) => country.iso_a3 === lastMissFeedback.wrongIso,
    );

    if (!wrongCountry) {
      return null;
    }

    const correctCountry = lastMissFeedback.correctIso
      ? countries.find(
          (country) => country.iso_a3 === lastMissFeedback.correctIso,
        )
      : null;

    return {
      sequence: lastMissFeedback.sequence,
      text: correctCountry
        ? `That's ${wrongCountry.name} — ${correctCountry.name} is highlighted.`
        : `That's ${wrongCountry.name}. Try again.`,
    };
  }, [lastMissFeedback]);
  // Landing orientation. Until the stored progress has been read the copy stays
  // on the first-time line, so the server render and the first client render
  // agree and nothing flashes.
  const weakCountryIds = useMemo(
    () =>
      progressHydrated
        ? getWeakestCountryIds(countryProgress, { limit: 12 })
        : [],
    [countryProgress, progressHydrated],
  );
  const hasPlayedBefore =
    progressHydrated && Object.keys(countryProgress).length > 0;
  const registerMapInteraction = useCallback(() => {
    setHasMapInteraction(true);
    setIdleInteractionKey((key) => key + 1);
  }, []);
  const openRegionPanel = useCallback(() => {
    setRegionPanelOpen(true);
    registerMapInteraction();
  }, [registerMapInteraction]);
  const closeRegionPanel = useCallback(
    (open: boolean) => {
      setRegionPanelOpen(open);

      if (open) {
        registerMapInteraction();
      }
    },
    [registerMapInteraction],
  );
  const idleAtmosphereEnabled =
    learningModeActive &&
    mapLoaded &&
    documentVisible &&
    !landingOpen &&
    !selectedLearningFeature &&
    !regionPanelOpen &&
    !isFinished;
  const idleRotationEnabled =
    idleAtmosphereEnabled && !prefersReducedMotion && !mobilePerformanceMode;
  const idlePromptEnabled = idleAtmosphereEnabled && idlePrompts.length > 0;

  useIdleGlobeRotation({
    enabled: idleRotationEnabled,
    idleDelayMs: hasMapInteraction
      ? IDLE_ROTATION_RESUME_DELAY_MS
      : IDLE_ROTATION_INITIAL_DELAY_MS,
    mapRef,
    onInteraction: registerMapInteraction,
    interactionKey: idleInteractionKey,
    documentVisible,
  });

  useEffect(() => {
    if (!idlePromptEnabled) {
      const resetTimeoutId = window.setTimeout(() => setIdlePrompt(null), 0);

      return () => window.clearTimeout(resetTimeoutId);
    }

    let promptIndex = 0;
    let showTimeoutId: number | null = null;
    let hideTimeoutId: number | null = null;

    const clearTimers = () => {
      if (showTimeoutId) {
        window.clearTimeout(showTimeoutId);
        showTimeoutId = null;
      }

      if (hideTimeoutId) {
        window.clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
      }
    };

    const schedulePrompt = (delay: number) => {
      showTimeoutId = window.setTimeout(() => {
        setIdlePrompt(idlePrompts[promptIndex % idlePrompts.length]);
        promptIndex += 1;
        hideTimeoutId = window.setTimeout(() => {
          setIdlePrompt(null);
          schedulePrompt(IDLE_PROMPT_INTERVAL_MS);
        }, IDLE_PROMPT_VISIBLE_MS);
      }, delay);
    };

    schedulePrompt(
      hasMapInteraction ? IDLE_PROMPT_INTERVAL_MS : IDLE_PROMPT_INITIAL_DELAY_MS,
    );

    return () => {
      clearTimers();
    };
  }, [hasMapInteraction, idleInteractionKey, idlePromptEnabled, idlePrompts]);
  const remainingCountryIds = useMemo(
    () => {
      const completedIds = isTargetQueueMode
        ? resolvedCountryIds
        : guessedCountryIds;

      return quizCountries
        .map((country) => country.iso_a3)
        .filter((iso) => !completedIds.includes(iso));
    },
    [guessedCountryIds, isTargetQueueMode, quizCountries, resolvedCountryIds],
  );
  const remainingCount = remainingCountryIds.length;
  const missedCountryIds = useMemo(
    () => {
      if (isTargetQueueMode) {
        return [
          ...new Set([
            ...modeBMissedCountryIds,
            ...((gameStatus === "failed" || gameStatus === "gave-up")
              ? remainingCountryIds
              : []),
          ]),
        ];
      }

      return gameStatus === "failed" || gameStatus === "gave-up"
        ? remainingCountryIds
        : [];
    },
    [
      gameStatus,
      modeBMissedCountryIds,
      remainingCountryIds,
      isTargetQueueMode,
    ],
  );
  const visibleLabelIds = useMemo(
    () => {
      if (gameStatus === "failed" || gameStatus === "gave-up") {
        return quizCountryIdList;
      }

      if (isTargetQueueMode) {
        return resolvedCountryIds;
      }

      return guessedCountryIds;
    },
    [
      gameStatus,
      guessedCountryIds,
      isTargetQueueMode,
      quizCountryIdList,
      resolvedCountryIds,
    ],
  );
  const caribbeanInsetMounted =
    Boolean(topologyData) &&
    selectedRegion === "north-america" &&
    (selectedMode === "type-to-fill" ||
      selectedMode === "identify-shaded" ||
      selectedMode === "click-country" ||
      selectedMode === "capital-challenge") &&
    gameStatus !== "idle";
  const correctPopupVisible =
    Boolean(lastMatchedCountry) && !landingOpen && !selectedSpecialRegion;

  useEffect(() => {
    if (!correctPopupVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCaribbeanInsetExpanded(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [correctPopupVisible]);

  const labelCollections = useMemo(
    () =>
      buildLabelCollections(quizCountries, visibleLabelIds, "main", {
        hideMainInsetLabels: caribbeanInsetMounted,
      }),
    [caribbeanInsetMounted, quizCountries, visibleLabelIds],
  );
  const learningLabelCollections = useMemo(
    () =>
      learningModeActive
        ? buildLearningLabelCollections(countries, mapZoom, "main", {
            hideMainInsetLabels: false,
          })
        : buildLabelCollections(countries, [], "main"),
    [learningModeActive, mapZoom],
  );
  const guideCountryIds = useMemo(() => {
    if (gameStatus !== "running") {
      return [];
    }

    const labeledIds = new Set(visibleLabelIds);

    return quizCountryIdList.filter((countryId) => !labeledIds.has(countryId));
  }, [gameStatus, quizCountryIdList, visibleLabelIds]);
  const guideCollections = useMemo(
    () =>
      buildSmallCountryGuideCollections(quizCountries, guideCountryIds, "main"),
    [guideCountryIds, quizCountries],
  );
  const debugLabelCollections = useMemo(
    () =>
      buildLabelCollections(
        countries,
        gameStatus === "idle" ? [] : debugLabelIds,
        "main",
      ),
    [debugLabelIds, gameStatus],
  );
  const labelCount =
    labelCollections.labels.features.length +
    learningLabelCollections.labels.features.length;
  const leaderLineCount =
    labelCollections.leaders.features.length +
    learningLabelCollections.leaders.features.length;
  const isRunningTypeMode =
    selectedMode === "type-to-fill" && gameStatus === "running";
  const pulseReason = getPulseReason(
    remainingCount,
    remainingSeconds,
    isRunningTypeMode,
  );
  const pulseActive = pulseReason !== "none";
  const targetHighlightActive =
    selectedMode === "identify-shaded" &&
    gameStatus === "running" &&
    Boolean(currentTargetCountry);
  const currentTargetAttemptCount = currentTargetCountry
    ? incorrectAttempts[currentTargetCountry.iso_a3] ?? 0
    : 0;
  const insetTargetHighlightActive =
    caribbeanInsetMounted &&
    targetHighlightActive &&
    Boolean(
      currentTargetCountry &&
        caribbeanCountryIds.has(currentTargetCountry.iso_a3),
    );

  const syncPaintExpressions = useCallback(
    (
      map: Map,
      guessedIds = guessedCountryIds,
      assistedIds = assistedCountryIds,
    ) => {
      if (!map.getLayer(FILL_LAYER_ID)) {
        return;
      }

      map.setPaintProperty(
        FILL_LAYER_ID,
        "fill-color",
        buildFillColorExpression(
          quizCountryIdList,
          guessedIds,
          assistedIds,
          missedCountryIds,
        ),
      );
      map.setPaintProperty(
        FILL_LAYER_ID,
        "fill-opacity",
        buildFillOpacityExpression(
          quizCountryIdList,
          guessedIds,
          assistedIds,
          missedCountryIds,
        ),
      );
    },
    [assistedCountryIds, guessedCountryIds, missedCountryIds, quizCountryIdList],
  );

  const recordFeatureStateDebug = useCallback(
    (
      countryId: string,
      result: ReturnType<typeof setCountryFeatureState>,
    ) => {
      const isoExists = topologyCountryIds.has(countryId);

      setMapDebug({
        guessedIsoExists: isoExists,
        lastFeatureStateCall: {
          ...result,
          isoExists,
        },
      });
    },
    [setMapDebug, topologyCountryIds],
  );

  const applyCountryFeatureState = useCallback(
    (
      map: Map,
      countryId: string,
      state: Record<string, boolean | number>,
    ) => {
      const result = setCountryFeatureState(map, countryId, state);

      recordFeatureStateDebug(countryId, result);

      return result;
    },
    [recordFeatureStateDebug],
  );

  useEffect(() => {
    const map = mapRef.current;
    const countryId = lastFeedbackEvent?.countryId;
    const shouldGlow =
      lastFeedbackEvent?.kind === "correct" ||
      lastFeedbackEvent?.kind === "assisted";

    if (
      !mapLoaded ||
      !map ||
      !countryId ||
      !shouldGlow ||
      !mapAnimationsEnabled
    ) {
      return;
    }

    // Fades out on the shared clock rather than snapping off on a timeout, so
    // a confirmation decays with the same easing the breath uses.
    const peak = lastFeedbackEvent.kind === "assisted" ? 0.62 : 0.9;
    const startedAt = performance.now();
    let lastWritten = -1;

    setCountryFeatureState(map, countryId, { target: true, targetPulse: peak });

    const clear = () => {
      if (mapRef.current === map) {
        setCountryFeatureState(map, countryId, {
          target: false,
          targetPulse: 0,
        });
      }
    };

    const unsubscribe = subscribeMotion(true, () => {
      if (mapRef.current !== map) {
        return;
      }

      const progress = (performance.now() - startedAt) / FEEDBACK_FLASH_MS;

      if (progress >= 1) {
        clear();
        return;
      }

      const targetPulse = mix(peak, 0, easeOutCubic(progress));

      if (Math.abs(targetPulse - lastWritten) < MOTION_EPSILON) {
        return;
      }

      lastWritten = targetPulse;
      setCountryFeatureState(map, countryId, { target: true, targetPulse });
    });

    return () => {
      unsubscribe?.();
      clear();
    };
  }, [lastFeedbackEvent, mapAnimationsEnabled, mapLoaded, subscribeMotion]);

  // Show a wrong map pick where it happened, and - once the answer has been
  // revealed - the country that was actually being asked for, so the mistake
  // teaches the spatial relationship instead of only reporting an error.
  useEffect(() => {
    const map = mapRef.current;

    if (
      !features.mapMissTeaching ||
      !mapLoaded ||
      !map ||
      !lastMissFeedback ||
      mobilePerformanceMode
    ) {
      return;
    }

    const { wrongIso, correctIso } = lastMissFeedback;

    setCountryFeatureState(map, wrongIso, { wrong: true });

    if (correctIso) {
      setCountryFeatureState(map, correctIso, { target: true, targetPulse: 0 });
    }

    const clear = () => {
      if (mapRef.current !== map) {
        return;
      }

      setCountryFeatureState(map, wrongIso, { wrong: false });

      if (correctIso) {
        setCountryFeatureState(map, correctIso, {
          target: false,
          targetPulse: 0,
        });
      }
    };

    // Ease the revealed country up to full glow instead of snapping it on.
    const revealStartedAt = performance.now();
    const unsubscribeReveal = correctIso
      ? subscribeMotion(true, () => {
          if (mapRef.current !== map) {
            return;
          }

          const progress = Math.min(
            (performance.now() - revealStartedAt) / FEEDBACK_FLASH_MS,
            1,
          );

          setCountryFeatureState(map, correctIso, {
            target: true,
            targetPulse: mix(0, 0.9, easeOutCubic(progress)),
          });
        })
      : undefined;

    // Same duration scale and easing as the correct-answer flash, so a wrong
    // pick and a right one feel like two ends of one language.
    missFeedbackTimeoutRef.current = window.setTimeout(
      () => {
        clear();
        clearMissFeedback();
        missFeedbackTimeoutRef.current = null;
      },
      correctIso ? MISS_REVEAL_MS : MISS_MARK_MS,
    );

    return () => {
      if (missFeedbackTimeoutRef.current) {
        window.clearTimeout(missFeedbackTimeoutRef.current);
        missFeedbackTimeoutRef.current = null;
      }

      unsubscribeReveal?.();
      clear();
    };
  }, [
    clearMissFeedback,
    lastMissFeedback,
    mapLoaded,
    mobilePerformanceMode,
    subscribeMotion,
  ]);

  const addCountryLayers = useCallback(
    (
      map: Map,
      countriesData: FeatureCollection<Geometry, CountryProperties>,
    ) => {
      if (!map.isStyleLoaded()) {
        return;
      }

      const existingSource = map.getSource(SOURCE_ID) as
        | GeoJSONSource
        | undefined;

      if (existingSource) {
        existingSource.setData(countriesData);
      } else {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: countriesData,
          promoteId: "iso_a3",
        });
      }

      const existingLeaderSource = map.getSource(LEADER_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const existingLabelSource = map.getSource(LABEL_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const existingLearningLeaderSource = map.getSource(
        LEARNING_LEADER_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingLearningLabelSource = map.getSource(
        LEARNING_LABEL_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingGuideCircleSource = map.getSource(
        GUIDE_CIRCLE_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingGuideLineSource = map.getSource(
        GUIDE_LINE_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingSubdivisionSource = map.getSource(
        SUBDIVISION_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingCitySource = map.getSource(CITY_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const existingPhysicalSource = map.getSource(
        PHYSICAL_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingLandmarkSource = map.getSource(
        LANDMARK_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingDebugLeaderSource = map.getSource(
        DEBUG_LEADER_SOURCE_ID,
      ) as GeoJSONSource | undefined;
      const existingDebugLabelSource = map.getSource(
        DEBUG_LABEL_SOURCE_ID,
      ) as GeoJSONSource | undefined;

      if (existingLeaderSource) {
        existingLeaderSource.setData(labelCollections.leaders);
      } else {
        map.addSource(LEADER_SOURCE_ID, {
          type: "geojson",
          data: labelCollections.leaders,
        });
      }

      if (existingLabelSource) {
        existingLabelSource.setData(labelCollections.labels);
      } else {
        map.addSource(LABEL_SOURCE_ID, {
          type: "geojson",
          data: labelCollections.labels,
        });
      }

      if (existingLearningLeaderSource) {
        existingLearningLeaderSource.setData(learningLabelCollections.leaders);
      } else {
        map.addSource(LEARNING_LEADER_SOURCE_ID, {
          type: "geojson",
          data: learningLabelCollections.leaders,
        });
      }

      if (existingLearningLabelSource) {
        existingLearningLabelSource.setData(learningLabelCollections.labels);
      } else {
        map.addSource(LEARNING_LABEL_SOURCE_ID, {
          type: "geojson",
          data: learningLabelCollections.labels,
        });
      }

      if (existingGuideCircleSource) {
        existingGuideCircleSource.setData(guideCollections.circles);
      } else {
        map.addSource(GUIDE_CIRCLE_SOURCE_ID, {
          type: "geojson",
          data: guideCollections.circles,
        });
      }

      if (existingGuideLineSource) {
        existingGuideLineSource.setData(guideCollections.leaders);
      } else {
        map.addSource(GUIDE_LINE_SOURCE_ID, {
          type: "geojson",
          data: guideCollections.leaders,
        });
      }

      if (existingSubdivisionSource) {
        existingSubdivisionSource.setData(subdivisionFeatureCollection);
      } else {
        map.addSource(SUBDIVISION_SOURCE_ID, {
          type: "geojson",
          data: subdivisionFeatureCollection,
        });
      }

      if (existingCitySource) {
        existingCitySource.setData(cityFeatureCollection);
      } else {
        map.addSource(CITY_SOURCE_ID, {
          type: "geojson",
          data: cityFeatureCollection,
        });
      }

      if (existingPhysicalSource) {
        existingPhysicalSource.setData(physicalFeatureCollection);
      } else {
        map.addSource(PHYSICAL_SOURCE_ID, {
          type: "geojson",
          data: physicalFeatureCollection,
        });
      }

      if (existingLandmarkSource) {
        existingLandmarkSource.setData(landmarkFeatureCollection);
      } else {
        map.addSource(LANDMARK_SOURCE_ID, {
          type: "geojson",
          data: landmarkFeatureCollection,
        });
      }

      if (existingDebugLeaderSource) {
        existingDebugLeaderSource.setData(debugLabelCollections.leaders);
      } else {
        map.addSource(DEBUG_LEADER_SOURCE_ID, {
          type: "geojson",
          data: debugLabelCollections.leaders,
        });
      }

      if (existingDebugLabelSource) {
        existingDebugLabelSource.setData(debugLabelCollections.labels);
      } else {
        map.addSource(DEBUG_LABEL_SOURCE_ID, {
          type: "geojson",
          data: debugLabelCollections.labels,
        });
      }

      if (!map.getLayer(FILL_LAYER_ID)) {
        map.addLayer({
          id: FILL_LAYER_ID,
          type: "fill",
          source: SOURCE_ID,
          paint: {
            "fill-color": buildFillColorExpression(
              quizCountryIdList,
              guessedCountryIds,
              assistedCountryIds,
              missedCountryIds,
            ),
            "fill-opacity": buildFillOpacityExpression(
              quizCountryIdList,
              guessedCountryIds,
              assistedCountryIds,
              missedCountryIds,
            ),
          },
        });
      }

      if (!map.getLayer(LINE_LAYER_ID)) {
        map.addLayer({
          id: LINE_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          paint: {
            "line-color": "#f8fafc",
            "line-opacity": [
              "case",
              ["in", ["get", "iso_a3"], ["literal", Array.from(quizCountryIds)]],
              0.62,
              0.24,
            ],
            "line-width": [
              "case",
              ["in", ["get", "iso_a3"], ["literal", Array.from(quizCountryIds)]],
              1.1,
              0.55,
            ],
          },
        });
      }

      if (!map.getLayer(TARGET_GLOW_LAYER_ID)) {
        map.addLayer({
          id: TARGET_GLOW_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          paint: {
            "line-color": "#22d3ee",
            "line-blur": 1.6,
            // Narrow ranges on purpose: a wide line-width swing reads as
            // chunky stepping, and a near-zero opacity floor makes the glow
            // blink out. The breath should stay continuously visible.
            "line-opacity": [
              "case",
              ["boolean", ["feature-state", "target"], false],
              [
                "interpolate",
                ["linear"],
                ["coalesce", ["feature-state", "targetPulse"], 0],
                0,
                0.55,
                1,
                0.85,
              ],
              0,
            ],
            "line-width": [
              "case",
              ["boolean", ["feature-state", "target"], false],
              [
                "interpolate",
                ["linear"],
                ["coalesce", ["feature-state", "targetPulse"], 0],
                0,
                3,
                1,
                5,
              ],
              0,
            ],
          },
        });
      }

      if (!map.getLayer(REMAINING_PULSE_FILL_LAYER_ID)) {
        map.addLayer({
          id: REMAINING_PULSE_FILL_LAYER_ID,
          type: "fill",
          source: SOURCE_ID,
          filter: buildRemainingPulseFilter(remainingCountryIds, pulseActive),
          paint: {
            "fill-color": "#f8fafc",
            "fill-opacity": 0,
          },
        });
      }

      if (!map.getLayer(REMAINING_PULSE_LINE_LAYER_ID)) {
        map.addLayer({
          id: REMAINING_PULSE_LINE_LAYER_ID,
          type: "line",
          source: SOURCE_ID,
          filter: buildRemainingPulseFilter(remainingCountryIds, pulseActive),
          paint: {
            "line-color": "#ffffff",
            "line-opacity": 0,
            "line-width": 2.4,
            "line-blur": 1.5,
          },
        });
      }

      if (!map.getLayer(GUIDE_LINE_LAYER_ID)) {
        map.addLayer({
          id: GUIDE_LINE_LAYER_ID,
          type: "line",
          source: GUIDE_LINE_SOURCE_ID,
          paint: {
            "line-color": "#0f172a",
            "line-opacity": 0.28,
            "line-width": 0.85,
            "line-dasharray": [1.4, 1.4],
          },
        });
      }

      if (!map.getLayer(GUIDE_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: GUIDE_CIRCLE_LAYER_ID,
          type: "circle",
          source: GUIDE_CIRCLE_SOURCE_ID,
          paint: {
            "circle-radius": ["get", "radiusPx"],
            "circle-color": "rgba(15,23,42,0)",
            "circle-stroke-color": "#0f172a",
            "circle-stroke-opacity": 0.42,
            "circle-stroke-width": 1.4,
            "circle-opacity": 0.2,
          },
        });
      }

      if (!map.getLayer(PHYSICAL_LABEL_LAYER_ID)) {
        map.addLayer({
          id: PHYSICAL_LABEL_LAYER_ID,
          type: "symbol",
          source: PHYSICAL_SOURCE_ID,
          minzoom: 3.2,
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3.2,
              10,
              5.5,
              13,
            ],
            "text-anchor": "center",
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            visibility: learningModeActive ? "visible" : "none",
          },
          paint: {
            "text-color": "#1e3a5f",
            "text-halo-color": "rgba(241,245,249,0.92)",
            "text-halo-width": 1.35,
            "text-halo-blur": 0.16,
            "text-opacity": 0.82,
          },
        });
      }

      if (!map.getLayer(SUBDIVISION_LABEL_LAYER_ID)) {
        map.addLayer({
          id: SUBDIVISION_LABEL_LAYER_ID,
          type: "symbol",
          source: SUBDIVISION_SOURCE_ID,
          minzoom: 3.8,
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3.8,
              9.5,
              6,
              12,
            ],
            "text-anchor": "center",
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            visibility: learningModeActive ? "visible" : "none",
          },
          paint: {
            "text-color": "#263449",
            "text-halo-color": "rgba(248,250,252,0.92)",
            "text-halo-width": 1.25,
            "text-halo-blur": 0.16,
            "text-opacity": 0.78,
          },
        });
      }

      if (!map.getLayer(CITY_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: CITY_CIRCLE_LAYER_ID,
          type: "circle",
          source: CITY_SOURCE_ID,
          minzoom: 4.8,
          layout: {
            visibility: learningModeActive ? "visible" : "none",
          },
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4.8,
              2.6,
              8,
              4.8,
            ],
            "circle-color": "#0f172a",
            "circle-opacity": 0.58,
            "circle-stroke-color": "#f8fafc",
            "circle-stroke-opacity": 0.82,
            "circle-stroke-width": 1.15,
          },
        });
      }

      if (!map.getLayer(CITY_LABEL_LAYER_ID)) {
        map.addLayer({
          id: CITY_LABEL_LAYER_ID,
          type: "symbol",
          source: CITY_SOURCE_ID,
          minzoom: 4.8,
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4.8,
              10,
              8,
              13,
            ],
            "text-offset": [0, 1],
            "text-anchor": "top",
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            visibility: learningModeActive ? "visible" : "none",
          },
          paint: {
            "text-color": "#122033",
            "text-halo-color": "rgba(248,250,252,0.94)",
            "text-halo-width": 1.45,
            "text-halo-blur": 0.16,
            "text-opacity": 0.88,
          },
        });
      }

      if (!map.getLayer(LANDMARK_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: LANDMARK_CIRCLE_LAYER_ID,
          type: "circle",
          source: LANDMARK_SOURCE_ID,
          minzoom: 4.8,
          layout: {
            visibility: learningModeActive ? "visible" : "none",
          },
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4.8,
              3.5,
              7,
              5.5,
            ],
            "circle-color": "#f8fafc",
            "circle-opacity": 0.92,
            "circle-stroke-color": "#0369a1",
            "circle-stroke-opacity": 0.76,
            "circle-stroke-width": 1.4,
          },
        });
      }

      if (!map.getLayer(LANDMARK_LABEL_LAYER_ID)) {
        map.addLayer({
          id: LANDMARK_LABEL_LAYER_ID,
          type: "symbol",
          source: LANDMARK_SOURCE_ID,
          minzoom: 4.8,
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4.8,
              10.5,
              7,
              13,
            ],
            "text-offset": [0, 1.1],
            "text-anchor": "top",
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            visibility: learningModeActive ? "visible" : "none",
          },
          paint: {
            "text-color": "#172033",
            "text-halo-color": "rgba(248,250,252,0.94)",
            "text-halo-width": 1.55,
            "text-halo-blur": 0.16,
            "text-opacity": 0.9,
          },
        });
      }

      if (!map.getLayer(LEADER_LAYER_ID)) {
        map.addLayer({
          id: LEADER_LAYER_ID,
          type: "line",
          source: LEADER_SOURCE_ID,
          paint: {
            "line-color": "#334155",
            "line-opacity": 0.42,
            "line-width": 0.9,
            "line-blur": 0.1,
          },
        });
      }

      LABEL_KINDS.forEach((kind) => {
        LABEL_ANCHORS.forEach((anchor) => {
          const isManual = kind === "manual";
          const layerId = `${LABEL_LAYER_PREFIX}-${kind}-${anchor}`;

          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: "symbol",
              source: LABEL_SOURCE_ID,
              filter: [
                "all",
                ["==", ["get", "textAnchor"], anchor],
                ["==", ["get", "placementKind"], kind],
              ],
              layout: {
                "text-field": ["get", "label"],
                "text-font": [
                  "DIN Offc Pro Medium",
                  "Arial Unicode MS Regular",
                ],
                "text-size": [
                  "match",
                  ["get", "labelSize"],
                  "small",
                  isManual ? 10.5 : 9.5,
                  "large",
                  isManual ? 13 : 12,
                  isManual ? 11.5 : 10.5,
                ],
                "text-anchor": anchor,
                "text-line-height": 0.95,
                "text-letter-spacing": 0,
                "text-allow-overlap": isManual,
                "text-ignore-placement": isManual,
                "symbol-sort-key": isManual ? 2 : 1,
              },
              paint: {
                "text-color": isManual ? "#172033" : "#243145",
                "text-halo-color": "rgba(248,250,252,0.94)",
                "text-halo-width": isManual ? 1.75 : 1.45,
                "text-halo-blur": 0.18,
                "text-opacity": isManual ? 0.96 : 0.88,
              },
            });
          }
        });
      });

      if (!map.getLayer(LEARNING_LEADER_LAYER_ID)) {
        map.addLayer({
          id: LEARNING_LEADER_LAYER_ID,
          type: "line",
          source: LEARNING_LEADER_SOURCE_ID,
          layout: {
            visibility: learningModeActive ? "visible" : "none",
          },
          paint: {
            "line-color": "#334155",
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3.7,
              0,
              4.4,
              0.34,
            ],
            "line-width": 0.85,
            "line-blur": 0.1,
          },
        });
      }

      LABEL_KINDS.forEach((kind) => {
        LABEL_ANCHORS.forEach((anchor) => {
          const isManual = kind === "manual";
          const layerId = `${LEARNING_LABEL_LAYER_PREFIX}-${kind}-${anchor}`;

          if (!map.getLayer(layerId)) {
            map.addLayer({
              id: layerId,
              type: "symbol",
              source: LEARNING_LABEL_SOURCE_ID,
              filter: [
                "all",
                ["==", ["get", "textAnchor"], anchor],
                ["==", ["get", "placementKind"], kind],
              ],
              layout: {
                "text-field": ["get", "label"],
                "text-font": [
                  "DIN Offc Pro Medium",
                  "Arial Unicode MS Regular",
                ],
                "text-size": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  1.45,
                  [
                    "match",
                    ["get", "labelSize"],
                    "small",
                    7.5,
                    "large",
                    10,
                    9,
                  ],
                  4.4,
                  [
                    "match",
                    ["get", "labelSize"],
                    "small",
                    isManual ? 10.25 : 9.5,
                    "large",
                    13,
                    isManual ? 11.25 : 10.5,
                  ],
                ],
                "text-anchor": anchor,
                "text-line-height": 0.95,
                "text-letter-spacing": 0,
                "text-allow-overlap": false,
                "text-ignore-placement": false,
                "symbol-sort-key": [
                  "-",
                  5,
                  ["coalesce", ["get", "labelPriority"], 3],
                ],
                visibility: learningModeActive ? "visible" : "none",
              },
              paint: {
                "text-color": isManual ? "#172033" : "#263449",
                "text-halo-color": "rgba(248,250,252,0.94)",
                "text-halo-width": isManual ? 1.65 : 1.35,
                "text-halo-blur": 0.18,
                "text-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  1.35,
                  0.7,
                  2.4,
                  0.86,
                  4.4,
                  0.94,
                ],
              },
            });
          }
        });
      });

      if (!map.getLayer(DEBUG_LEADER_LAYER_ID)) {
        map.addLayer({
          id: DEBUG_LEADER_LAYER_ID,
          type: "line",
          source: DEBUG_LEADER_SOURCE_ID,
          paint: {
            "line-color": "#fde68a",
            "line-opacity": 0.95,
            "line-width": 2.2,
            "line-blur": 0.1,
          },
        });
      }

      if (!map.getLayer(DEBUG_LABEL_LAYER_ID)) {
        map.addLayer({
          id: DEBUG_LABEL_LAYER_ID,
          type: "symbol",
          source: DEBUG_LABEL_SOURCE_ID,
          layout: {
            "text-field": ["concat", "TEST: ", ["get", "name"]],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 22,
            "text-anchor": "center",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#020617",
            "text-halo-width": 4,
            "text-halo-blur": 0,
            "text-opacity": 1,
          },
        });
      }

      [
        PHYSICAL_LABEL_LAYER_ID,
        SUBDIVISION_LABEL_LAYER_ID,
        CITY_CIRCLE_LAYER_ID,
        CITY_LABEL_LAYER_ID,
        LANDMARK_CIRCLE_LAYER_ID,
        LANDMARK_LABEL_LAYER_ID,
        LEADER_LAYER_ID,
        ...LABEL_LAYER_IDS,
        LEARNING_LEADER_LAYER_ID,
        ...LEARNING_LABEL_LAYER_IDS,
        DEBUG_LEADER_LAYER_ID,
        DEBUG_LABEL_LAYER_ID,
      ].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.moveLayer(layerId);
        }
      });

      guessedCountryIds.forEach((iso) => {
        setCountryFeatureState(map, iso, { guessed: true, fillProgress: 1 });
      });

      if (
        selectedMode === "identify-shaded" &&
        gameStatus === "running" &&
        currentTargetCountry
      ) {
        setCountryFeatureState(map, currentTargetCountry.iso_a3, {
          target: true,
          targetPulse: 0,
        });
      }

      syncPaintExpressions(map);
      map.setFilter(
        REMAINING_PULSE_FILL_LAYER_ID,
        buildRemainingPulseFilter(remainingCountryIds, pulseActive),
      );
      map.setFilter(
        REMAINING_PULSE_LINE_LAYER_ID,
        buildRemainingPulseFilter(remainingCountryIds, pulseActive),
      );

      const labelSource = map.getSource(LABEL_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const leaderSource = map.getSource(LEADER_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const learningLabelSource = map.getSource(LEARNING_LABEL_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const learningLeaderSource = map.getSource(LEARNING_LEADER_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const debugLabelSource = map.getSource(DEBUG_LABEL_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const debugLeaderSource = map.getSource(DEBUG_LEADER_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const guideCircleSource = map.getSource(GUIDE_CIRCLE_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const guideLineSource = map.getSource(GUIDE_LINE_SOURCE_ID) as
        | GeoJSONSource
        | undefined;

      labelSource?.setData(labelCollections.labels);
      leaderSource?.setData(labelCollections.leaders);
      learningLabelSource?.setData(learningLabelCollections.labels);
      learningLeaderSource?.setData(learningLabelCollections.leaders);
      guideCircleSource?.setData(guideCollections.circles);
      guideLineSource?.setData(guideCollections.leaders);
      debugLabelSource?.setData(debugLabelCollections.labels);
      debugLeaderSource?.setData(debugLabelCollections.leaders);
      setLearningLayerVisibility(map, learningModeActive);

      setMapDebug({
        countrySourceLoaded: Boolean(map.getSource(SOURCE_ID)),
        countryFeatureCount: countriesData.features.length,
        labelFeatureCount:
          labelCollections.labels.features.length +
          learningLabelCollections.labels.features.length,
        leaderFeatureCount:
          labelCollections.leaders.features.length +
          learningLabelCollections.leaders.features.length,
        lastLabelLayerError: null,
        ...getMapDebugSnapshot(map),
      });
    },
    [
      assistedCountryIds,
      guessedCountryIds,
      debugLabelCollections,
      currentTargetCountry,
      gameStatus,
      guideCollections,
      labelCollections,
      learningLabelCollections,
      learningModeActive,
      missedCountryIds,
      pulseActive,
      quizCountryIdList,
      remainingCountryIds,
      selectedMode,
      setMapDebug,
      syncPaintExpressions,
    ],
  );

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current || !mapboxToken || !mapInitAllowed) {
      return;
    }

    if (!isWebglAvailable()) {
      // Deferred like the other state updates in this file so the effect does
      // not set state synchronously during the commit.
      const timeoutId = window.setTimeout(() => {
        setMapFatalError("WebGL is not available in this browser.");
        setMapLoaded(true);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    const container = mapNodeRef.current;
    let map: Map | null = null;
    let cancelled = false;

    const failFatally = (message: string) => {
      if (cancelled) {
        return;
      }

      setMapFatalError(message);
      setMapLoaded(true);
    };

    // mapbox-gl is the heaviest thing this app loads, so it is fetched here
    // rather than at module scope. Everything below runs a microtask later than
    // it used to; `cancelled` guards a unmount that beats the import.
    void (async () => {
      let mapboxgl: typeof import("mapbox-gl").default;

      try {
        mapboxgl = (await import("mapbox-gl")).default;
      } catch {
        failFatally("Could not load the map library.");

        return;
      }

      if (cancelled) {
        return;
      }

      mapboxgl.accessToken = mapboxToken;

      try {
        map = new mapboxgl.Map({
          container,
          style: MAP_STYLE,
          center: [-58, -18],
          zoom: 2.2,
          pitch: 38,
          bearing: -12,
          projection: "globe",
          antialias: !initialMapPerformanceModeRef.current,
          attributionControl: false,
        });
      } catch (error) {
        failFatally(
          error instanceof Error
            ? error.message
            : "Mapbox could not create a map on this device.",
        );

        return;
      }

      if (cancelled) {
        map.remove();
        map = null;

        return;
      }

      const createdMap = map;

      mapRef.current = createdMap;
      createdMap.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right",
      );

      createdMap.once("load", () => {
        hideMapLabelsAndRoads(createdMap);
        addTerrainAndFog(createdMap, {
          terrainEnabled: !initialMapPerformanceModeRef.current,
        });

        setMapLoaded(true);
        setMapDebug({ mapLoaded: true, ...getMapDebugSnapshot(createdMap) });
      });

      createdMap.on("error", (event) => {
        if (event.error?.message) {
          setMapError(event.error.message);
          setMapLoaded(true);
          setMapDebug({ mapLoaded: true, ...getMapDebugSnapshot(createdMap) });
        }
      });
    })();

    return () => {
      cancelled = true;

      if (feedbackGlowTimeoutRef.current) {
        window.clearTimeout(feedbackGlowTimeoutRef.current);
        feedbackGlowTimeoutRef.current = null;
      }

      if (missFeedbackTimeoutRef.current) {
        window.clearTimeout(missFeedbackTimeoutRef.current);
        missFeedbackTimeoutRef.current = null;
      }

      map?.remove();
      map = null;
      mapRef.current = null;
      setMapDebug({
        mapLoaded: false,
        countrySourceLoaded: false,
        labelSourceLoaded: false,
        labelLayerLoaded: false,
        leaderSourceLoaded: false,
        leaderLayerLoaded: false,
        insetLabelLayerLoaded: false,
        labelFeatureCount: 0,
        leaderFeatureCount: 0,
        lastLabelLayerError: null,
        sourceIds: [],
        layerIds: [],
        projection: "unknown",
      });
    };
  }, [mapboxToken, mapInitAllowed, mapRetryKey, setMapDebug]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    const syncZoom = () => {
      setMapZoom(Math.round(map.getZoom() * 100) / 100);
    };
    const initialTimeoutId = window.setTimeout(syncZoom, 0);

    map.on("moveend", syncZoom);
    map.on("zoomend", syncZoom);

    return () => {
      window.clearTimeout(initialTimeoutId);
      map.off("moveend", syncZoom);
      map.off("zoomend", syncZoom);
    };
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !topologyData || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    const addLayersWhenReady = () => {
      if (!map.isStyleLoaded()) {
        return;
      }

      try {
        addCountryLayers(map, topologyData);
      } catch (error) {
        setMapDebug({
          lastLabelLayerError:
            error instanceof Error
              ? error.message
              : "Mapbox rejected a country overlay layer.",
          ...getMapDebugSnapshot(map),
        });
      }
    };

    addLayersWhenReady();
    map.on("styledata", addLayersWhenReady);
    map.on("idle", addLayersWhenReady);

    return () => {
      map.off("styledata", addLayersWhenReady);
      map.off("idle", addLayersWhenReady);
    };
  }, [addCountryLayers, mapLoaded, setMapDebug, topologyData]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    previousGuessedIdsRef.current
      .filter((iso) => !guessedCountryIds.includes(iso))
      .forEach((iso) => {
        applyCountryFeatureState(map, iso, { guessed: false, fillProgress: 0 });
      });

    guessedCountryIds.forEach((iso) => {
      applyCountryFeatureState(map, iso, { guessed: true, fillProgress: 1 });
    });

    syncPaintExpressions(map);
    setMapDebug(getMapDebugSnapshot(map));
    previousGuessedIdsRef.current = guessedCountryIds;
  }, [
    applyCountryFeatureState,
    guessedCountryIds,
    mapLoaded,
    setMapDebug,
    syncPaintExpressions,
  ]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    setLearningLayerVisibility(map, learningModeActive);
  }, [learningModeActive, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    syncPaintExpressions(map);
    setMapDebug({
      ...getMapDebugSnapshot(map),
      insetMissedCount: missedCountryIds.filter((iso) =>
        caribbeanCountryIds.has(iso),
      ).length,
    });
  }, [mapLoaded, missedCountryIds, setMapDebug, syncPaintExpressions]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapLoaded ||
      !map ||
      !map.getLayer(REMAINING_PULSE_FILL_LAYER_ID) ||
      !map.getLayer(REMAINING_PULSE_LINE_LAYER_ID)
    ) {
      return;
    }

    map.setFilter(
      REMAINING_PULSE_FILL_LAYER_ID,
      buildRemainingPulseFilter(remainingCountryIds, pulseActive),
    );
    map.setFilter(
      REMAINING_PULSE_LINE_LAYER_ID,
      buildRemainingPulseFilter(remainingCountryIds, pulseActive),
    );

    if (!pulseActive) {
      map.setPaintProperty(REMAINING_PULSE_FILL_LAYER_ID, "fill-opacity", 0);
      map.setPaintProperty(REMAINING_PULSE_LINE_LAYER_ID, "line-opacity", 0);
      return;
    }

    if (!mapAnimationsEnabled) {
      map.setPaintProperty(REMAINING_PULSE_FILL_LAYER_ID, "fill-opacity", 0.13);
      map.setPaintProperty(REMAINING_PULSE_LINE_LAYER_ID, "line-opacity", 0.42);
      return;
    }

    let lastWritten = -1;

    return subscribeMotion(true, (elapsed) => {
      if (mapRef.current !== map) {
        return;
      }

      const pulse = breathe(elapsed, REMAINING_BREATH_PERIOD_MS);

      if (Math.abs(pulse - lastWritten) < MOTION_EPSILON) {
        return;
      }

      lastWritten = pulse;
      // Narrower swings than before: this is ambient context for what is left
      // to find, so it should sit behind the target rather than compete.
      map.setPaintProperty(
        REMAINING_PULSE_FILL_LAYER_ID,
        "fill-opacity",
        mix(0.06, 0.14, pulse),
      );
      map.setPaintProperty(
        REMAINING_PULSE_LINE_LAYER_ID,
        "line-opacity",
        mix(0.26, 0.46, pulse),
      );
    });
  }, [
    mapAnimationsEnabled,
    mapLoaded,
    pulseActive,
    remainingCountryIds,
    subscribeMotion,
  ]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    const region = getRegionConfig(selectedRegion);
    const isAntarctica = selectedSpecialRegion === "antarctica";
    const shouldFrameQuizRegion =
      (selectedMode === "type-to-fill" ||
        selectedMode === "identify-shaded" ||
        selectedMode === "click-country" ||
        selectedMode === "capital-challenge") &&
      gameStatus !== "idle" &&
      !isAntarctica;
    const shouldFrameIdleRegion = gameStatus === "idle" && regionPanelOpen;
    // Lift the framed region above the on-screen keyboard so it stays visible
    // while typing on mobile.
    const isNarrowViewport =
      typeof window !== "undefined" && window.innerWidth < 768;
    const regionPadding = isNarrowViewport
      ? { top: 104, right: 24, bottom: 142 + keyboardInset, left: 24 }
      : gameStatus === "running" || gameStatus === "paused"
        ? { top: 112, right: 96, bottom: 148, left: 96 }
        : { top: 118, right: 240, bottom: 154, left: 240 };
    // A keyboard open/close should re-frame quickly rather than run the full
    // 1.3s intro flight.
    const keyboardInsetChanged =
      keyboardInset !== framingKeyboardInsetRef.current;
    framingKeyboardInsetRef.current = keyboardInset;
    const framingDuration = keyboardInsetChanged ? 450 : 1300;

    try {
      map.setProjection(gameStatus === "idle" ? "globe" : "mercator");
    } catch {
      // Projection changes are polish, not required for the quiz loop.
    }

    if (isAntarctica) {
      map.flyTo({
        center: [0, -82],
        zoom: 1.25,
        pitch: 0,
        bearing: 0,
        duration: 1300,
        essential: true,
      });
    } else if (shouldFrameQuizRegion) {
      map.fitBounds(region.bounds, {
        padding: regionPadding,
        pitch: region.pitch,
        bearing: region.bearing,
        duration: framingDuration,
        essential: true,
      });
    } else if (shouldFrameIdleRegion) {
      map.flyTo({
        center: [region.center.lng, region.center.lat],
        zoom: region.zoom,
        pitch: region.pitch,
        bearing: region.bearing,
        duration: 1300,
        essential: true,
      });
    } else {
      map.flyTo({
        center: [-32, 16],
        zoom: typeof window !== "undefined" && window.innerWidth < 768 ? 1.1 : 1.7,
        pitch: 24,
        bearing: -12,
        duration: 1300,
        essential: true,
      });
    }

    setMapDebug(getMapDebugSnapshot(map));
  }, [
    gameStatus,
    keyboardInset,
    mapLoaded,
    regionPanelOpen,
    selectedMode,
    selectedRegion,
    selectedSpecialRegion,
    setMapDebug,
  ]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    if (previousTargetIdRef.current) {
      setCountryFeatureState(map, previousTargetIdRef.current, {
        target: false,
        targetPulse: 0,
      });
    }

    if (
      selectedMode !== "identify-shaded" ||
      gameStatus !== "running" ||
      !currentTargetCountry
    ) {
      previousTargetIdRef.current = null;
      syncPaintExpressions(map);
      return;
    }

    previousTargetIdRef.current = currentTargetCountry.iso_a3;
    setCountryFeatureState(map, currentTargetCountry.iso_a3, {
      target: true,
      targetPulse: 0,
    });

    if (!mapAnimationsEnabled) {
      setCountryFeatureState(map, currentTargetCountry.iso_a3, {
        target: true,
        targetPulse: 0.72,
      });
      return;
    }

    const targetIso = currentTargetCountry.iso_a3;
    let lastWritten = -1;

    return subscribeMotion(true, (elapsed) => {
      if (mapRef.current !== map) {
        return;
      }

      const targetPulse = breathe(elapsed, TARGET_BREATH_PERIOD_MS);

      if (Math.abs(targetPulse - lastWritten) < MOTION_EPSILON) {
        return;
      }

      lastWritten = targetPulse;
      setCountryFeatureState(map, targetIso, { target: true, targetPulse });
    });
  }, [
    currentTargetCountry,
    gameStatus,
    mapAnimationsEnabled,
    mapLoaded,
    selectedMode,
    subscribeMotion,
    syncPaintExpressions,
  ]);

  const handleCountryMatched = useCallback((
    country: Country,
    outcome?: "correct" | "assisted",
  ) => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    applyCountryFeatureState(map, country.iso_a3, {
      guessed: true,
      fillProgress: 1,
    });
    const nextGuessedIds = [...new Set([...guessedCountryIds, country.iso_a3])];
    const nextAssistedIds =
      outcome === "assisted"
        ? [...new Set([...assistedCountryIds, country.iso_a3])]
        : assistedCountryIds;
    syncPaintExpressions(map, nextGuessedIds, nextAssistedIds);

    setMapDebug({
      ...getMapDebugSnapshot(map),
      lastPopupIso: country.iso_a3,
      lastShadedIso: country.iso_a3,
    });
  }, [
    applyCountryFeatureState,
    assistedCountryIds,
    guessedCountryIds,
    setMapDebug,
    syncPaintExpressions,
  ]);

  const handleInsetCountryClick = useCallback(
    (iso: string | null) => {
      const result = submitMapClickGuess(iso, "inset");

      if (
        (result.outcome === "correct" || result.outcome === "assisted") &&
        result.country
      ) {
        handleCountryMatched(result.country, result.outcome);
      } else if (result.outcome === "wrong" || result.outcome === "ignored") {
        navigator.vibrate?.([18, 24, 18]);
      } else if (result.outcome === "missed") {
        navigator.vibrate?.([28, 36, 28]);
      }
    },
    [handleCountryMatched, submitMapClickGuess],
  );

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    const canvas = map.getCanvas();
    const clickLearningMode = gameStatus === "idle" && !selectedSpecialRegion;
    const clickQuizMode =
      selectedMode === "click-country" && gameStatus === "running";

    canvas.style.cursor = clickLearningMode || clickQuizMode ? "pointer" : "";

    if (!clickLearningMode && !clickQuizMode) {
      return () => {
        canvas.style.cursor = "";
      };
    }

    const handleClick = (event: MapMouseEvent) => {
      registerMapInteraction();

      if (!map.getLayer(FILL_LAYER_ID)) {
        return;
      }

      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [FILL_LAYER_ID],
      });
      const iso =
        typeof feature?.properties?.iso_a3 === "string"
          ? feature.properties.iso_a3
          : null;

      if (clickLearningMode) {
        const getFeatureId = (layerIds: string[]) => {
          const existingLayerIds = layerIds.filter((layerId) =>
            Boolean(map.getLayer(layerId)),
          );

          if (existingLayerIds.length === 0) {
            return null;
          }

          const [learningFeature] = map.queryRenderedFeatures(event.point, {
            layers: existingLayerIds,
          });

          return typeof learningFeature?.properties?.id === "string"
            ? learningFeature.properties.id
            : null;
        };
        const landmarkId = getFeatureId([
          LANDMARK_LABEL_LAYER_ID,
          LANDMARK_CIRCLE_LAYER_ID,
        ]);
        const cityId = getFeatureId([
          CITY_LABEL_LAYER_ID,
          CITY_CIRCLE_LAYER_ID,
        ]);
        const physicalId = getFeatureId([PHYSICAL_LABEL_LAYER_ID]);
        const subdivisionId = getFeatureId([SUBDIVISION_LABEL_LAYER_ID]);
        const learningFeature =
          findLearningFeature("landmark", landmarkId) ??
          findLearningFeature("city", cityId) ??
          findLearningFeature("physical", physicalId) ??
          findLearningFeature("subdivision", subdivisionId);

        if (learningFeature) {
          selectLearningFeature(learningFeature);
          return;
        }

        selectLearningCountry(
          iso && quizCountryIds.has(iso) ? iso : null,
        );
        return;
      }

      const clickedIso = iso && quizCountryIdList.includes(iso) ? iso : null;
      const result = submitMapClickGuess(clickedIso, "main");

      if (
        (result.outcome === "correct" || result.outcome === "assisted") &&
        result.country
      ) {
        handleCountryMatched(result.country, result.outcome);
      } else if (result.outcome === "wrong" || result.outcome === "ignored") {
        navigator.vibrate?.([18, 24, 18]);
      } else if (result.outcome === "missed") {
        navigator.vibrate?.([28, 36, 28]);
        syncPaintExpressions(map);
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
      canvas.style.cursor = "";
    };
  }, [
    gameStatus,
    handleCountryMatched,
    mapLoaded,
    quizCountryIdList,
    registerMapInteraction,
    selectedMode,
    selectedSpecialRegion,
    selectLearningFeature,
    selectLearningCountry,
    submitMapClickGuess,
    syncPaintExpressions,
  ]);

  const handleTestBrazilShade = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    applyCountryFeatureState(map, "BRA", { guessed: true, fillProgress: 1 });
    syncPaintExpressions(map, [...new Set([...guessedCountryIds, "BRA"])]);
    setMapDebug(getMapDebugSnapshot(map));
  };

  const handleClearBrazilShade = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    applyCountryFeatureState(map, "BRA", { guessed: false, fillProgress: 0 });
    syncPaintExpressions(map);
    setMapDebug(getMapDebugSnapshot(map));
  };

  const handleTestCanadaLabel = () => {
    setDebugLabelIds((ids) => [...new Set([...ids, "CAN"])]);
  };

  const handleTestStLuciaLabel = () => {
    setDebugLabelIds((ids) => [...new Set([...ids, "LCA"])]);
  };

  const handleClearTestLabels = () => {
    setDebugLabelIds([]);
  };

  const handleInsetLabelLayerLoaded = useCallback((loaded: boolean) => {
    setInsetLabelSourceLoaded(loaded);
    setMapDebug({ insetLabelLayerLoaded: loaded });
  }, [setMapDebug]);

  const closeLandingForQuiz = useCallback(() => {
    // The landing offers "Resume Quiz" right next to this action, so choosing
    // a new quiz while one is live is an explicit decision to abandon it.
    // Without the reset, the setup panel would immediately close itself
    // (selection is locked during a live quiz) and strand the user on the
    // pause overlay instead of quiz setup.
    const status = useGameStore.getState().gameStatus;

    if (status === "running" || status === "paused") {
      backToRegionSelect();
    }

    setRegionPanelOpen(true);
    setLandingOpen(false);
  }, [backToRegionSelect]);

  const closeLandingForExplore = useCallback(() => {
    setRegionPanelOpen(false);
    setLandingOpen(false);
  }, []);

  const quickStartQuiz = useCallback(() => {
    setRegionPanelOpen(false);
    setLandingOpen(false);
    startQuiz();
  }, [startQuiz]);

  const startDailyChallenge = useCallback(() => {
    setRegionPanelOpen(false);
    setLandingOpen(false);
    daily.startDailyChallenge();
  }, [daily]);

  const practiceWeakSpots = useCallback(() => {
    setRegionPanelOpen(false);
    setLandingOpen(false);
    startCustomQuiz(weakCountryIds, { label: "Weak spots" });
  }, [startCustomQuiz, weakCountryIds]);

  const handleExploreSearchSelect = useCallback(
    (result: ExploreSearchResult) => {
      registerMapInteraction();
      selectLearningFeature(result.feature);
      mapRef.current?.flyTo({
        center: result.center,
        zoom: result.zoom,
        duration: 1200,
        essential: true,
      });
    },
    [registerMapInteraction, selectLearningFeature],
  );

  const handleZoomIn = useCallback(() => {
    registerMapInteraction();
    mapRef.current?.zoomIn({ duration: 320 });
  }, [registerMapInteraction]);

  const handleZoomOut = useCallback(() => {
    registerMapInteraction();
    mapRef.current?.zoomOut({ duration: 320 });
  }, [registerMapInteraction]);

  const handleRecenter = useCallback(() => {
    registerMapInteraction();

    const map = mapRef.current;

    if (!map) {
      return;
    }

    // Reframe on whatever the user is actually working on: the quiz region
    // during a run, otherwise the default globe view.
    if (gameStatus !== "idle" && !selectedSpecialRegion) {
      const region = getRegionConfig(selectedRegion);

      map.fitBounds(region.bounds, {
        padding: 64,
        pitch: region.pitch,
        bearing: region.bearing,
        duration: 900,
        essential: true,
      });

      return;
    }

    map.flyTo({
      center: [-32, 16],
      zoom: typeof window !== "undefined" && window.innerWidth < 768 ? 1.1 : 1.7,
      pitch: 24,
      bearing: -12,
      duration: 900,
      essential: true,
    });
  }, [gameStatus, registerMapInteraction, selectedRegion, selectedSpecialRegion]);

  const reopenLanding = useCallback(() => {
    if (gameStatus === "running") {
      pauseQuiz();
    }

    setLandingOpen(true);
  }, [gameStatus, pauseQuiz]);

  const handleResumeSavedQuiz = useCallback(() => {
    resumeSavedQuiz(resumableQuiz ?? undefined);
    setResumableQuiz(null);
  }, [resumableQuiz, resumeSavedQuiz]);

  const handleDiscardSavedQuiz = useCallback(() => {
    discardSavedQuiz();
    setResumableQuiz(null);
  }, [discardSavedQuiz]);

  const resumeActiveQuiz = useCallback(() => {
    setLandingOpen(false);

    const status = useGameStore.getState().gameStatus;

    if (status === "paused") {
      resumeQuiz();
    } else if (status !== "running") {
      // No live quiz in memory but a saved one exists on disk: restore it.
      handleResumeSavedQuiz();
    }
  }, [handleResumeSavedQuiz, resumeQuiz]);

  if (!mapboxToken) {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#15423c,transparent_34rem),#05080c] px-6 text-white">
        <section className="max-w-xl rounded-[2rem] border border-white/14 bg-white/8 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
            Mapbox token required
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            GeoMaster is ready for a map token.
          </h1>
          <p className="mt-4 text-white/66">
            Add your public Mapbox token as{" "}
            <code className="rounded-md bg-white/10 px-1.5 py-1 font-mono text-sm text-emerald-100">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            in <code className="font-mono text-emerald-100">.env.local</code>,
            then restart the dev server.
          </p>
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-3 font-mono text-sm text-white/72">
            NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_public_mapbox_token_here
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`relative h-dvh min-h-dvh w-full overflow-hidden bg-slate-100 text-white ${
        landingOpen ? "[&_.mapboxgl-control-container]:hidden" : ""
      }`}
    >
      <div ref={mapNodeRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.08),transparent_32rem),linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.18))]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mapLoaded ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 26 }}
        className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-[#05080c]/82 backdrop-blur-sm"
      >
        <p className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-medium text-white/70">
          Initializing terrain engine...
        </p>
      </motion.div>

      {features.mapControls && !landingOpen && mapLoaded && !mapFatalError ? (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
        />
      ) : null}
      {!landingOpen && !selectedSpecialRegion ? (
        <GameHud
          onOpenLanding={reopenLanding}
          onOpenRegionPanel={() => openRegionPanel()}
          regionPanelOpen={regionPanelOpen}
          exploreSearch={
            features.exploreSearch ? (
              <ExploreSearch onSelect={handleExploreSearchSelect} />
            ) : null
          }
          exploreSearchCompact={
            features.exploreSearch ? (
              <ExploreSearch onSelect={handleExploreSearchSelect} compact />
            ) : null
          }
        />
      ) : null}
      <AnimatePresence>
        {resumableQuiz &&
        gameStatus === "idle" &&
        !landingOpen &&
        !selectedSpecialRegion ? (
          <ResumePrompt
            key="resume-prompt"
            snapshot={resumableQuiz}
            onResume={handleResumeSavedQuiz}
            onDiscard={handleDiscardSavedQuiz}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {missTeachingNote && !landingOpen ? (
          <motion.p
            key={missTeachingNote.sequence}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-30 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-2xl border border-rose-200/22 bg-zinc-950/72 px-3 py-1.5 text-center text-xs font-semibold leading-4 text-rose-50 backdrop-blur-xl sm:bottom-28 sm:rounded-full"
            aria-live="polite"
          >
            {missTeachingNote.text}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {idlePromptEnabled && idlePrompt ? (
          <IdlePromptToast key={idlePrompt} prompt={idlePrompt} />
        ) : null}
      </AnimatePresence>
      {!landingOpen ? (
        <PremiumControls
          panelOpen={regionPanelOpen}
          onPanelOpenChange={closeRegionPanel}
        />
      ) : null}
      <AnimatePresence>
        {!landingOpen && selectedSpecialRegion === "antarctica" ? (
          <AntarcticaEducationCard
            key="antarctica-card"
            onBack={clearSpecialRegion}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {!landingOpen && caribbeanInsetMounted && topologyData ? (
          <MapErrorBoundary key="caribbean-inset-boundary" fallback={() => null}>
            <CaribbeanInsetMap
              key="caribbean-inset"
              mapboxToken={mapboxToken}
              topologyData={topologyData}
              guessedCountryIds={guessedCountryIds}
              assistedCountryIds={assistedCountryIds}
              visibleLabelIds={visibleLabelIds}
              debugLabelIds={debugLabelIds}
              missedCountryIds={missedCountryIds}
              remainingCountryIds={remainingCountryIds}
              pulseActive={pulseActive}
              targetCountryId={
                targetHighlightActive ? currentTargetCountry?.iso_a3 ?? null : null
              }
              mobilePerformanceMode={mobilePerformanceMode}
              documentVisible={documentVisible}
              correctPopupVisible={correctPopupVisible}
              mobileExpanded={caribbeanInsetExpanded}
              onMobileExpandedChange={setCaribbeanInsetExpanded}
              clickEnabled={
                selectedMode === "click-country" && gameStatus === "running"
              }
              onCountryClick={handleInsetCountryClick}
              onLabelSourceLoaded={handleInsetLabelLayerLoaded}
            />
          </MapErrorBoundary>
        ) : null}
      </AnimatePresence>
      {!landingOpen &&
      !selectedSpecialRegion &&
      (selectedMode === "identify-shaded" ||
        selectedMode === "click-country" ||
        selectedMode === "capital-challenge") &&
      gameStatus === "running" ? (
        <TargetHintCard
          mode={selectedMode}
          targetCountry={currentTargetCountry}
          smartHint={smartHint}
          currentTargetHints={currentTargetHints}
          attemptCount={currentTargetAttemptCount}
          capitalHintEnabled={capitalHintEnabled}
          onCapitalHintChange={setCapitalHintEnabled}
        />
      ) : null}
      {!landingOpen && !selectedSpecialRegion ? (
        <>
          <AnimatePresence>
            {isPerfectRun && perfectRunSequence > 0 ? (
              <PerfectRunCelebration
                key={perfectRunSequence}
                sequence={perfectRunSequence}
              />
            ) : null}
          </AnimatePresence>
          <CountryPopup
            country={lastMatchedCountry}
            feedbackSequence={lastMatchSequence}
            autoHide={autoHideCorrectCard}
            onClose={clearCorrectCard}
          />
          <AnimatePresence>
            {learningModeActive && selectedLearningFeature ? (
              <LearningModeCard
                key={`${selectedLearningFeature.kind}-${
                  selectedLearningFeature.kind === "country"
                    ? selectedLearningFeature.country.iso_a3
                    : selectedLearningFeature.feature.id
                }`}
                feature={selectedLearningFeature}
                onClose={clearLearningFeature}
              />
            ) : null}
          </AnimatePresence>
          {gameStatus === "running" ? (
            <TypeToFillInput
              onCountryMatched={handleCountryMatched}
              keyboardInset={keyboardInset}
            />
          ) : null}
          <ResultsDashboard
            onChangeRegion={() => openRegionPanel()}
            onContinueLearning={() => setRegionPanelOpen(false)}
          />
        </>
      ) : null}
      <AnimatePresence>
        {!landingOpen && gameStatus === "paused" ? (
          <PauseOverlay key="pause-overlay" />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {landingOpen ? (
          <LandingPage
            key="landing"
            hasActiveQuiz={
              gameStatus === "running" ||
              gameStatus === "paused" ||
              Boolean(resumableQuiz)
            }
            onResumeQuiz={resumeActiveQuiz}
            onStartQuiz={closeLandingForQuiz}
            onExploreMap={closeLandingForExplore}
            onQuickStart={features.quickStart ? quickStartQuiz : undefined}
            quickStartLabel={
              // A newcomer has no reason to expect a particular region, so the
              // named shortcut only appears once there is a habit to resume.
              hasPlayedBefore
                ? `Start ${getRegionConfig(selectedRegion).label}`
                : "Start Learning"
            }
            onPracticeWeakSpots={
              features.practiceMistakes ? practiceWeakSpots : undefined
            }
            weakSpotCount={weakCountryIds.length}
            onStartDailyChallenge={
              daily.available ? startDailyChallenge : undefined
            }
            dailyDoneToday={daily.doneToday}
            dailyStreak={daily.streak}
          />
        ) : null}
      </AnimatePresence>
      {IS_DEVELOPMENT && debugUiEnabled ? (
        <MapDebugPanel
          onTestBrazilShade={handleTestBrazilShade}
          onClearBrazilShade={handleClearBrazilShade}
          onTestCanadaLabel={handleTestCanadaLabel}
          onTestStLuciaLabel={handleTestStLuciaLabel}
          onClearTestLabels={handleClearTestLabels}
          remainingCount={remainingCount}
          pulseActive={pulseActive}
          pulseReason={pulseReason}
          caribbeanInsetMounted={caribbeanInsetMounted}
          targetHighlightActive={targetHighlightActive}
          insetTargetHighlightActive={insetTargetHighlightActive}
          labelCount={labelCount}
          leaderLineCount={leaderLineCount}
          insetLabelSourceLoaded={caribbeanInsetMounted && insetLabelSourceLoaded}
          expanded={debugExpanded}
          onToggleExpanded={() => setDebugExpanded((expanded) => !expanded)}
        />
      ) : null}

      {mapFatalError ? (
        <MapUnavailable
          detail={mapFatalError}
          onRetry={() => {
            setMapFatalError(null);
            setMapLoaded(false);
            setMapRetryKey((key) => key + 1);
          }}
        />
      ) : null}

      {(mapError || topologyError) && (
        <div className="absolute left-5 top-24 z-40 max-w-sm rounded-2xl border border-red-300/20 bg-red-950/40 p-4 text-sm text-red-50 shadow-xl backdrop-blur-xl">
          {mapError ?? topologyError?.message}
        </div>
      )}
    </main>
  );
}
