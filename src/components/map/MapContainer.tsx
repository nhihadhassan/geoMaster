"use client";

import mapboxgl, { type GeoJSONSource, type Map } from "mapbox-gl";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";
import { AntarcticaEducationCard } from "@/components/game/AntarcticaEducationCard";
import { GameHud } from "@/components/game/GameHud";
import { LandingPage } from "@/components/game/LandingPage";
import { LearningModeCard } from "@/components/game/LearningModeCard";
import { PauseOverlay } from "@/components/game/PauseOverlay";
import { PerfectRunCelebration } from "@/components/game/PerfectRunCelebration";
import { PremiumControls } from "@/components/game/PremiumControls";
import { ResultsDashboard } from "@/components/game/ResultsDashboard";
import { TargetHintCard } from "@/components/game/TargetHintCard";
import { TypeToFillInput } from "@/components/game/TypeToFillInput";
import {
  CaribbeanInsetMap,
  caribbeanCountryIds,
} from "@/components/map/CaribbeanInsetMap";
import { CountryPopup } from "@/components/map/CountryPopup";
import {
  countries,
  getRegionConfig,
  quizCountryIds,
  type Country,
} from "@/data/countries";
import { buildLabelCollections } from "@/data/labelPlacements";
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
import { useGameStore, type CountryResult } from "@/store/gameStore";

const SOURCE_ID = "geomaster-countries";
const FILL_LAYER_ID = "geomaster-country-fill";
const LINE_LAYER_ID = "geomaster-country-line";
const TARGET_GLOW_LAYER_ID = "geomaster-target-glow";
const REMAINING_PULSE_FILL_LAYER_ID = "geomaster-remaining-pulse-fill";
const REMAINING_PULSE_LINE_LAYER_ID = "geomaster-remaining-pulse-line";
const LABEL_SOURCE_ID = "geomaster-country-labels";
const LEADER_SOURCE_ID = "geomaster-country-leaders";
const GUIDE_CIRCLE_SOURCE_ID = "geomaster-small-country-guide-circles";
const GUIDE_LINE_SOURCE_ID = "geomaster-small-country-guide-lines";
const GUIDE_CIRCLE_LAYER_ID = "geomaster-small-country-guide-circle-layer";
const GUIDE_LINE_LAYER_ID = "geomaster-small-country-guide-line-layer";
const SUBDIVISION_SOURCE_ID = "geomaster-subdivisions";
const SUBDIVISION_LABEL_LAYER_ID = "geomaster-subdivision-label-layer";
const CITY_SOURCE_ID = "geomaster-cities";
const CITY_CIRCLE_LAYER_ID = "geomaster-city-circle-layer";
const CITY_LABEL_LAYER_ID = "geomaster-city-label-layer";
const PHYSICAL_SOURCE_ID = "geomaster-physical-features";
const PHYSICAL_LABEL_LAYER_ID = "geomaster-physical-feature-label-layer";
const LANDMARK_SOURCE_ID = "geomaster-landmarks";
const LANDMARK_CIRCLE_LAYER_ID = "geomaster-landmark-circle-layer";
const LANDMARK_LABEL_LAYER_ID = "geomaster-landmark-label-layer";
const LABEL_LAYER_PREFIX = "geomaster-country-label-layer";
const LEADER_LAYER_ID = "geomaster-country-leader-layer";
const DEBUG_LABEL_SOURCE_ID = "geomaster-debug-country-labels";
const DEBUG_LEADER_SOURCE_ID = "geomaster-debug-country-leaders";
const DEBUG_LABEL_LAYER_ID = "geomaster-debug-country-label-layer";
const DEBUG_LEADER_LAYER_ID = "geomaster-debug-country-leader-layer";
const MAP_STYLE = "mapbox://styles/mapbox/light-v11";
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
const LANDING_SEEN_KEY = "geomaster-landing-seen";
const LABEL_ANCHORS = ["center", "left", "right", "top", "bottom"] as const;
const LABEL_KINDS = ["fallback", "manual"] as const;
const LABEL_LAYER_IDS = LABEL_KINDS.flatMap((kind) =>
  LABEL_ANCHORS.map((anchor) => `${LABEL_LAYER_PREFIX}-${kind}-${anchor}`),
);
const GEOMASTER_LAYER_IDS = [
  FILL_LAYER_ID,
  LINE_LAYER_ID,
  TARGET_GLOW_LAYER_ID,
  REMAINING_PULSE_FILL_LAYER_ID,
  REMAINING_PULSE_LINE_LAYER_ID,
  GUIDE_LINE_LAYER_ID,
  GUIDE_CIRCLE_LAYER_ID,
  SUBDIVISION_LABEL_LAYER_ID,
  CITY_CIRCLE_LAYER_ID,
  CITY_LABEL_LAYER_ID,
  PHYSICAL_LABEL_LAYER_ID,
  LANDMARK_CIRCLE_LAYER_ID,
  LANDMARK_LABEL_LAYER_ID,
  LEADER_LAYER_ID,
  ...LABEL_LAYER_IDS,
  DEBUG_LEADER_LAYER_ID,
  DEBUG_LABEL_LAYER_ID,
];

const hideMapLabelsAndRoads = (map: Map) => {
  const style = map.getStyle();

  style.layers?.forEach((layer) => {
    const id = layer.id.toLowerCase();
    const shouldHide =
      layer.type === "symbol" ||
      id.includes("road") ||
      id.includes("transit") ||
      id.includes("admin") ||
      id.includes("building") ||
      id.includes("place") ||
      id.includes("label");

    if (shouldHide) {
      try {
        map.setLayoutProperty(layer.id, "visibility", "none");
      } catch {
        // Some Mapbox base layers are generated dynamically. Leave them alone.
      }
    }
  });
};

const addTerrainAndFog = (map: Map) => {
  try {
    if (!map.getSource("mapbox-dem")) {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }

    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.08 });
    map.setFog({
      color: "rgb(241, 245, 249)",
      "high-color": "rgb(186, 230, 253)",
      "horizon-blend": 0.08,
      "space-color": "rgb(226, 232, 240)",
      "star-intensity": 0,
    });
  } catch {
    // Terrain is visual polish. The base map and game loop should still work.
  }
};

const setCountryFeatureState = (
  map: Map,
  countryId: string,
  state: Record<string, boolean | number>,
) => {
  if (!map.getSource(SOURCE_ID)) {
    return {
      source: SOURCE_ID,
      id: countryId,
      state,
      ok: false,
      error: "Country source is not loaded.",
    };
  }

  try {
    map.setFeatureState({ source: SOURCE_ID, id: countryId }, state);
    return {
      source: SOURCE_ID,
      id: countryId,
      state,
      ok: true,
    };
  } catch {
    return {
      source: SOURCE_ID,
      id: countryId,
      state,
      ok: false,
      error: "Mapbox rejected setFeatureState for this feature id.",
    };
  }
};

const buildFillColorExpression = (
  selectedIds: string[],
  guessedIds: string[],
  assistedIds: string[],
  missedIds: string[],
) => [
  "case",
  ["boolean", ["feature-state", "target"], false],
  "#67e8f9",
  ["in", ["get", "iso_a3"], ["literal", missedIds]],
  "#f7b7b0",
  ["in", ["get", "iso_a3"], ["literal", assistedIds]],
  "#fbbf24",
  ["boolean", ["feature-state", "guessed"], false],
  "#22f6a5",
  ["in", ["get", "iso_a3"], ["literal", guessedIds]],
  "#22f6a5",
  ["in", ["get", "iso_a3"], ["literal", selectedIds]],
  "#748394",
  ["in", ["get", "iso_a3"], ["literal", Array.from(quizCountryIds)]],
  "#64748b",
  "#94a3b8",
] as mapboxgl.ExpressionSpecification;

const buildFillOpacityExpression = (
  selectedIds: string[],
  guessedIds: string[],
  assistedIds: string[],
  missedIds: string[],
) => [
  "case",
  ["boolean", ["feature-state", "target"], false],
  0.72,
  ["in", ["get", "iso_a3"], ["literal", missedIds]],
  0.82,
  ["in", ["get", "iso_a3"], ["literal", assistedIds]],
  0.94,
  ["boolean", ["feature-state", "guessed"], false],
  0.92,
  ["in", ["get", "iso_a3"], ["literal", guessedIds]],
  0.92,
  ["in", ["get", "iso_a3"], ["literal", selectedIds]],
  0.5,
  0.22,
] as mapboxgl.ExpressionSpecification;

const buildRemainingPulseFilter = (
  remainingCountryIds: string[],
  pulseActive: boolean,
) =>
  (pulseActive && remainingCountryIds.length > 0
    ? ["in", ["get", "iso_a3"], ["literal", remainingCountryIds]]
    : ["==", ["get", "iso_a3"], "__none__"]) as mapboxgl.FilterSpecification;

const getPulseReason = (
  remainingCount: number,
  remainingSeconds: number,
  isRunningTypeMode: boolean,
) => {
  if (!isRunningTypeMode) {
    return "none";
  }

  const hasFewLeft = remainingCount <= 5;
  const isLastMinute = remainingSeconds <= 60;

  if (hasFewLeft && isLastMinute) {
    return "5 left + last minute";
  }

  if (hasFewLeft) {
    return "5 left";
  }

  if (isLastMinute) {
    return "last minute";
  }

  return "none";
};

const formatDebugBoolean = (value: boolean) => (value ? "yes" : "no");

const getMapDebugSnapshot = (map: Map) => ({
  sourceIds: [
    SOURCE_ID,
    SUBDIVISION_SOURCE_ID,
    CITY_SOURCE_ID,
    PHYSICAL_SOURCE_ID,
    LANDMARK_SOURCE_ID,
    LEADER_SOURCE_ID,
    LABEL_SOURCE_ID,
    DEBUG_LEADER_SOURCE_ID,
    DEBUG_LABEL_SOURCE_ID,
  ].filter((sourceId) => Boolean(map.getSource(sourceId))),
  layerIds: GEOMASTER_LAYER_IDS.filter((layerId) => Boolean(map.getLayer(layerId))),
  labelSourceLoaded: Boolean(map.getSource(LABEL_SOURCE_ID)),
  labelLayerLoaded: LABEL_LAYER_IDS.some((layerId) => Boolean(map.getLayer(layerId))),
  leaderSourceLoaded: Boolean(map.getSource(LEADER_SOURCE_ID)),
  leaderLayerLoaded: Boolean(map.getLayer(LEADER_LAYER_ID)),
  projection: map.getProjection?.().name ?? "unknown",
});

const LEARNING_LAYER_IDS = [
  SUBDIVISION_LABEL_LAYER_ID,
  CITY_CIRCLE_LAYER_ID,
  CITY_LABEL_LAYER_ID,
  PHYSICAL_LABEL_LAYER_ID,
  LANDMARK_CIRCLE_LAYER_ID,
  LANDMARK_LABEL_LAYER_ID,
];

const setLearningLayerVisibility = (map: Map, visible: boolean) => {
  LEARNING_LAYER_IDS.forEach((layerId) => {
    if (!map.getLayer(layerId)) {
      return;
    }

    map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
  });
};

type MapDebugPanelProps = {
  onTestBrazilShade: () => void;
  onClearBrazilShade: () => void;
  onTestCanadaLabel: () => void;
  onTestStLuciaLabel: () => void;
  onClearTestLabels: () => void;
  remainingCount: number;
  pulseActive: boolean;
  pulseReason: string;
  caribbeanInsetMounted: boolean;
  targetHighlightActive: boolean;
  insetTargetHighlightActive: boolean;
  labelCount: number;
  leaderLineCount: number;
  insetLabelSourceLoaded: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
};

function MapDebugPanel({
  onTestBrazilShade,
  onClearBrazilShade,
  onTestCanadaLabel,
  onTestStLuciaLabel,
  onClearTestLabels,
  remainingCount,
  pulseActive,
  pulseReason,
  caribbeanInsetMounted,
  targetHighlightActive,
  insetTargetHighlightActive,
  labelCount,
  leaderLineCount,
  insetLabelSourceLoaded,
  expanded,
  onToggleExpanded,
}: MapDebugPanelProps) {
  const debug = useGameStore((state) => state.debug);
  const selectedMode = useGameStore((state) => state.selectedMode);
  const capitalHintEnabled = useGameStore(
    (state) => state.capitalHintEnabled,
  );
  const quizCountries = useGameStore((state) => state.quizCountries);
  const guessedCountryIds = useGameStore((state) => state.guessedCountryIds);
  const countryResults = useGameStore((state) => state.countryResults);
  const currentTargetHints = useGameStore((state) => state.currentTargetHints);
  const targetQueue = useGameStore((state) => state.targetQueue);
  const lastMatchedCountry = useGameStore((state) => state.lastMatchedCountry);
  const currentTargetCountry = useGameStore(
    (state) => state.currentTargetCountry,
  );
  const resultEntries = Object.entries(countryResults);
  const assistedIds = resultEntries
    .filter(([, result]) => result.status === "assisted")
    .map(([iso]) => iso);
  const missedIds = resultEntries
    .filter(([, result]) => result.status === "missed")
    .map(([iso]) => iso);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggleExpanded}
        className="absolute left-5 top-36 z-30 rounded-full border border-white/14 bg-black/40 px-3 py-2 text-xs font-semibold text-white/66 shadow-xl shadow-black/30 backdrop-blur-2xl transition hover:bg-black/52 hover:text-white"
      >
        Debug
      </button>
    );
  }

  return (
    <aside className="absolute left-5 top-36 z-20 max-h-80 w-[min(22rem,calc(100vw-2.5rem))] overflow-auto rounded-3xl border border-white/14 bg-black/44 p-4 font-mono text-xs text-white/72 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/44">
          Debug
        </p>
        <button
          type="button"
          onClick={onToggleExpanded}
          className="rounded-full border border-white/12 bg-white/8 px-2 py-1 font-sans text-[0.65rem] font-semibold text-white/62 transition hover:bg-white/14 hover:text-white"
        >
          Hide
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
        <dt>Mapbox loaded</dt>
        <dd>{formatDebugBoolean(debug.mapLoaded)}</dd>
        <dt>Source loaded</dt>
        <dd>{formatDebugBoolean(debug.countrySourceLoaded)}</dd>
        <dt>Features</dt>
        <dd>{debug.countryFeatureCount}</dd>
        <dt>Region count</dt>
        <dd>{quizCountries.length}</dd>
        <dt>Mode</dt>
        <dd>{selectedMode}</dd>
        <dt>Last match</dt>
        <dd>{lastMatchedCountry?.name ?? "none"}</dd>
        <dt>Raw input</dt>
        <dd>{debug.lastRawInput ?? "none"}</dd>
        <dt>Norm input</dt>
        <dd>{debug.lastNormalizedInput ?? "none"}</dd>
        <dt>Matched</dt>
        <dd>
          {debug.lastMatchedIso
            ? `${debug.lastMatchedIso} ${debug.lastMatchedName ?? ""}`
            : "none"}
        </dd>
        <dt>Match method</dt>
        <dd>{debug.lastMatchMethod ?? "none"}</dd>
        <dt>Accepted</dt>
        <dd>
          {debug.lastMatchAccepted === null
            ? "n/a"
            : formatDebugBoolean(debug.lastMatchAccepted)}
        </dd>
        <dt>Popup ISO</dt>
        <dd>{debug.lastPopupIso ?? "none"}</dd>
        <dt>Shaded ISO</dt>
        <dd>{debug.lastShadedIso ?? "none"}</dd>
        <dt>Clicked ISO</dt>
        <dd>{debug.lastClickedIso ?? "none"}</dd>
        <dt>Clicked name</dt>
        <dd>{debug.lastClickedName ?? "none"}</dd>
        <dt>Click source</dt>
        <dd>{debug.lastClickSource ?? "none"}</dd>
        <dt>Target</dt>
        <dd>
          {currentTargetCountry
            ? `${currentTargetCountry.iso_a3} ${currentTargetCountry.name}`
            : "none"}
        </dd>
        <dt>Capital hint</dt>
        <dd>{formatDebugBoolean(capitalHintEnabled)}</dd>
        <dt>Target queue</dt>
        <dd>{targetQueue.length}</dd>
        <dt>Guessed count</dt>
        <dd>{guessedCountryIds.length}</dd>
        <dt>Results</dt>
        <dd>{resultEntries.length}</dd>
        <dt>Assisted</dt>
        <dd>{assistedIds.length}</dd>
        <dt>Missed</dt>
        <dd>{missedIds.length}</dd>
        <dt>Hints</dt>
        <dd>{currentTargetHints.length}</dd>
        <dt>Target highlight</dt>
        <dd>{formatDebugBoolean(targetHighlightActive)}</dd>
        <dt>Inset target</dt>
        <dd>{formatDebugBoolean(insetTargetHighlightActive)}</dd>
        <dt>Projection</dt>
        <dd>{debug.projection}</dd>
        <dt>Sources</dt>
        <dd>{debug.sourceIds.join(", ") || "none"}</dd>
        <dt>Layers</dt>
        <dd>{debug.layerIds.length}</dd>
        <dt>Label source</dt>
        <dd>{formatDebugBoolean(debug.labelSourceLoaded)}</dd>
        <dt>Label layer</dt>
        <dd>{formatDebugBoolean(debug.labelLayerLoaded)}</dd>
        <dt>Leader source</dt>
        <dd>{formatDebugBoolean(debug.leaderSourceLoaded)}</dd>
        <dt>Leader layer</dt>
        <dd>{formatDebugBoolean(debug.leaderLayerLoaded)}</dd>
        <dt>Label features</dt>
        <dd>{debug.labelFeatureCount}</dd>
        <dt>Leader features</dt>
        <dd>{debug.leaderFeatureCount}</dd>
        <dt>Inset label layer</dt>
        <dd>{formatDebugBoolean(debug.insetLabelLayerLoaded)}</dd>
        <dt>Last ISO exists</dt>
        <dd>
          {debug.guessedIsoExists === null
            ? "n/a"
            : formatDebugBoolean(debug.guessedIsoExists)}
        </dd>
        <dt>Last state</dt>
        <dd>
          {debug.lastFeatureStateCall
            ? `${debug.lastFeatureStateCall.id} ${debug.lastFeatureStateCall.ok ? "ok" : "fail"}`
            : "none"}
        </dd>
        <dt>Remaining</dt>
        <dd>{remainingCount}</dd>
        <dt>Pulse active</dt>
        <dd>{formatDebugBoolean(pulseActive)}</dd>
        <dt>Pulse reason</dt>
        <dd>{pulseReason}</dd>
        <dt>Feedback</dt>
        <dd>{lastMatchedCountry?.name ?? "none"}</dd>
        <dt>Caribbean inset</dt>
        <dd>{formatDebugBoolean(caribbeanInsetMounted)}</dd>
        <dt>Labels</dt>
        <dd>{labelCount}</dd>
        <dt>Leader lines</dt>
        <dd>{leaderLineCount}</dd>
        <dt>Inset labels</dt>
        <dd>{formatDebugBoolean(insetLabelSourceLoaded)}</dd>
        <dt>Inset missed</dt>
        <dd>{debug.insetMissedCount}</dd>
        <dt>Toast duration</dt>
        <dd>7s</dd>
      </dl>
      <p className="mt-3 break-words text-white/58">
        Guessed: {guessedCountryIds.join(", ") || "none"}
      </p>
      <p className="mt-2 break-words text-white/58">
        Assisted: {assistedIds.join(", ") || "none"}
      </p>
      <p className="mt-2 break-words text-white/58">
        Missed: {missedIds.join(", ") || "none"}
      </p>
      <p className="mt-2 break-words text-white/58">
        Target hints: {currentTargetHints.join(" | ") || "none"}
      </p>
      {debug.lastFeatureStateCall?.error ? (
        <p className="mt-2 rounded-xl border border-red-300/20 bg-red-950/30 p-2 text-red-100/80">
          {debug.lastFeatureStateCall.error}
        </p>
      ) : null}
      {debug.lastLabelLayerError ? (
        <p className="mt-2 rounded-xl border border-red-300/20 bg-red-950/30 p-2 text-red-100/80">
          {debug.lastLabelLayerError}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2 font-sans">
        <button
          type="button"
          onClick={onTestBrazilShade}
          className="rounded-full border border-emerald-200/24 bg-emerald-300/14 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/22"
        >
          Test BRA shade
        </button>
        <button
          type="button"
          onClick={onClearBrazilShade}
          className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/14"
        >
          Clear test
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 font-sans">
        <button
          type="button"
          onClick={onTestCanadaLabel}
          className="rounded-full border border-sky-200/24 bg-sky-300/14 px-3 py-1.5 text-xs font-semibold text-sky-50 transition hover:bg-sky-300/22"
        >
          Test Canada Label
        </button>
        <button
          type="button"
          onClick={onTestStLuciaLabel}
          className="rounded-full border border-sky-200/24 bg-sky-300/14 px-3 py-1.5 text-xs font-semibold text-sky-50 transition hover:bg-sky-300/22"
        >
          Test St Lucia Label
        </button>
        <button
          type="button"
          onClick={onClearTestLabels}
          className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/14"
        >
          Clear Test Labels
        </button>
      </div>
    </aside>
  );
}

export function MapContainer() {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const previousGuessedIdsRef = useRef<string[]>([]);
  const previousTargetIdRef = useRef<string | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const remainingPulseFrameRef = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [insetLabelSourceLoaded, setInsetLabelSourceLoaded] = useState(false);
  const [debugLabelIds, setDebugLabelIds] = useState<string[]>([]);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [landingOpen, setLandingOpen] = useState(false);
  const [learningHelpOpen, setLearningHelpOpen] = useState(false);
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
  const lastMatchSequence = useGameStore((state) => state.lastMatchSequence);
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLandingOpen(window.localStorage.getItem(LANDING_SEEN_KEY) !== "1");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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
  const learningLabelIds = useMemo(
    () => countries.map((country) => country.iso_a3),
    [],
  );
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
      if (learningModeActive) {
        return learningLabelIds;
      }

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
      learningLabelIds,
      learningModeActive,
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
  const labelCollections = useMemo(
    () =>
      buildLabelCollections(learningModeActive ? countries : quizCountries, visibleLabelIds, "main", {
        hideMainInsetLabels: caribbeanInsetMounted,
      }),
    [caribbeanInsetMounted, learningModeActive, quizCountries, visibleLabelIds],
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
  const labelCount = labelCollections.labels.features.length;
  const leaderLineCount = labelCollections.leaders.features.length;
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
            "line-opacity": [
              "case",
              ["boolean", ["feature-state", "target"], false],
              [
                "interpolate",
                ["linear"],
                ["coalesce", ["feature-state", "targetPulse"], 0],
                0,
                0.38,
                1,
                0.96,
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
                2,
                1,
                7,
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
      guideCircleSource?.setData(guideCollections.circles);
      guideLineSource?.setData(guideCollections.leaders);
      debugLabelSource?.setData(debugLabelCollections.labels);
      debugLeaderSource?.setData(debugLabelCollections.leaders);
      setLearningLayerVisibility(map, learningModeActive);

      setMapDebug({
        countrySourceLoaded: Boolean(map.getSource(SOURCE_ID)),
        countryFeatureCount: countriesData.features.length,
        labelFeatureCount: labelCollections.labels.features.length,
        leaderFeatureCount: labelCollections.leaders.features.length,
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
    if (!mapNodeRef.current || mapRef.current || !mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapNodeRef.current,
      style: MAP_STYLE,
      center: [-58, -18],
      zoom: 2.2,
      pitch: 38,
      bearing: -12,
      projection: "globe",
      antialias: true,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    map.once("load", () => {
      hideMapLabelsAndRoads(map);
      addTerrainAndFog(map);

      setMapLoaded(true);
      setMapDebug({ mapLoaded: true, ...getMapDebugSnapshot(map) });
    });

    map.on("error", (event) => {
      if (event.error?.message) {
        setMapError(event.error.message);
        setMapLoaded(true);
        setMapDebug({ mapLoaded: true, ...getMapDebugSnapshot(map) });
      }
    });

    return () => {
      if (remainingPulseFrameRef.current) {
        window.cancelAnimationFrame(remainingPulseFrameRef.current);
        remainingPulseFrameRef.current = null;
      }

      map.remove();
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
  }, [mapboxToken, setMapDebug]);

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

    if (remainingPulseFrameRef.current) {
      window.cancelAnimationFrame(remainingPulseFrameRef.current);
      remainingPulseFrameRef.current = null;
    }

    if (!pulseActive) {
      map.setPaintProperty(REMAINING_PULSE_FILL_LAYER_ID, "fill-opacity", 0);
      map.setPaintProperty(REMAINING_PULSE_LINE_LAYER_ID, "line-opacity", 0);
      return;
    }

    const startedAt = performance.now();
    const animate = (now: number) => {
      if (mapRef.current !== map) {
        return;
      }

      const pulse = (Math.sin(((now - startedAt) / 1900) * Math.PI * 2) + 1) / 2;
      map.setPaintProperty(
        REMAINING_PULSE_FILL_LAYER_ID,
        "fill-opacity",
        0.04 + pulse * 0.16,
      );
      map.setPaintProperty(
        REMAINING_PULSE_LINE_LAYER_ID,
        "line-opacity",
        0.18 + pulse * 0.44,
      );
      remainingPulseFrameRef.current = window.requestAnimationFrame(animate);
    };

    remainingPulseFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (remainingPulseFrameRef.current) {
        window.cancelAnimationFrame(remainingPulseFrameRef.current);
        remainingPulseFrameRef.current = null;
      }
    };
  }, [mapLoaded, pulseActive, remainingCountryIds]);

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
    const regionPadding =
      typeof window !== "undefined" && window.innerWidth < 768
        ? { top: 104, right: 24, bottom: 142, left: 24 }
        : gameStatus === "running" || gameStatus === "paused"
          ? { top: 112, right: 96, bottom: 148, left: 96 }
          : { top: 118, right: 240, bottom: 154, left: 240 };

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
        duration: 1300,
        essential: true,
      });
    } else {
      map.flyTo({
        center: [region.center.lng, region.center.lat],
        zoom: region.zoom,
        pitch: region.pitch,
        bearing: region.bearing,
        duration: 1300,
        essential: true,
      });
    }

    setMapDebug(getMapDebugSnapshot(map));
  }, [
    gameStatus,
    mapLoaded,
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

    if (pulseFrameRef.current) {
      window.cancelAnimationFrame(pulseFrameRef.current);
      pulseFrameRef.current = null;
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

    const startedAt = performance.now();
    const pulse = (now: number) => {
      if (mapRef.current !== map) {
        return;
      }

      const targetPulse = (Math.sin((now - startedAt) / 280) + 1) / 2;

      setCountryFeatureState(map, currentTargetCountry.iso_a3, {
        target: true,
        targetPulse,
      });

      pulseFrameRef.current = window.requestAnimationFrame(pulse);
    };

    pulseFrameRef.current = window.requestAnimationFrame(pulse);

    return () => {
      if (pulseFrameRef.current) {
        window.cancelAnimationFrame(pulseFrameRef.current);
        pulseFrameRef.current = null;
      }
    };
  }, [
    currentTargetCountry,
    gameStatus,
    mapLoaded,
    selectedMode,
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

    const handleClick = (event: mapboxgl.MapMouseEvent) => {
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

  const closeLanding = useCallback(() => {
    window.localStorage.setItem(LANDING_SEEN_KEY, "1");
    setLandingOpen(false);
  }, []);

  const reopenLanding = useCallback(() => {
    setLandingOpen(true);
  }, []);

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
    <main className="relative h-dvh min-h-dvh w-full overflow-hidden bg-slate-100 text-white">
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

      {!landingOpen && !selectedSpecialRegion ? <GameHud /> : null}
      {!landingOpen && learningModeActive ? (
        <button
          type="button"
          onClick={reopenLanding}
          className="absolute right-4 top-24 z-20 rounded-full border border-white/12 bg-zinc-950/52 px-4 py-2 text-sm font-semibold text-white/70 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:bg-zinc-950/64 hover:text-white sm:right-5 sm:top-28"
        >
          GeoMaster
        </button>
      ) : null}
      {!landingOpen && learningModeActive ? (
        <>
          <button
            type="button"
            onClick={() => setLearningHelpOpen((open) => !open)}
            className="absolute left-3 top-[calc(5.1rem+env(safe-area-inset-top))] z-20 min-h-11 rounded-full border border-sky-100/16 bg-zinc-950/58 px-4 text-sm font-semibold text-white/72 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:bg-zinc-950/68 hover:text-white sm:hidden"
          >
            <span className="text-sky-100/82">Learning</span>
          </button>
          {learningHelpOpen ? (
            <motion.aside
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute inset-x-2 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 rounded-3xl border border-white/12 bg-zinc-950/74 p-4 text-white shadow-2xl shadow-black/36 backdrop-blur-2xl sm:hidden"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/22" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-sky-100/56">
                    Learning Mode
                  </p>
                  <p className="mt-2 text-sm leading-5 text-white/66">
                    Zoom in and tap countries, states, cities, features, or
                    landmarks to open compact learning cards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLearningHelpOpen(false)}
                  className="min-h-11 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/14 hover:text-white"
                >
                  Close
                </button>
              </div>
            </motion.aside>
          ) : null}
          <div className="pointer-events-none absolute left-5 top-28 z-20 hidden rounded-full border border-sky-100/16 bg-zinc-950/52 px-4 py-2 text-sm font-semibold text-white/70 shadow-lg shadow-black/25 backdrop-blur-xl sm:block">
            <span className="text-sky-100/82">Learning Mode</span>
            <span className="ml-2 text-white/42">
              Zoom in for states, features, and landmarks
            </span>
          </div>
        </>
      ) : null}
      {!landingOpen ? <PremiumControls /> : null}
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
            clickEnabled={
              selectedMode === "click-country" && gameStatus === "running"
            }
            onCountryClick={handleInsetCountryClick}
            onLabelSourceLoaded={handleInsetLabelLayerLoaded}
          />
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
          <TypeToFillInput onCountryMatched={handleCountryMatched} />
          <ResultsDashboard />
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
            onStartQuiz={closeLanding}
            onExploreMap={closeLanding}
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

      {(mapError || topologyError) && (
        <div className="absolute left-5 top-24 z-40 max-w-sm rounded-2xl border border-red-300/20 bg-red-950/40 p-4 text-sm text-red-50 shadow-xl backdrop-blur-xl">
          {mapError ?? topologyError?.message}
        </div>
      )}
    </main>
  );
}
