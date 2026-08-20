// Map source/layer identifiers, style helpers, and paint-expression builders
// shared by MapContainer and the map debug panel. Extracted verbatim from
// MapContainer.tsx so the map keeps behaving exactly as before.
import type {
  ExpressionSpecification,
  FilterSpecification,
  Map,
} from "mapbox-gl";
import { quizCountryIds } from "@/data/countries";

export const SOURCE_ID = "geomaster-countries";
export const FILL_LAYER_ID = "geomaster-country-fill";
export const LINE_LAYER_ID = "geomaster-country-line";
export const TARGET_GLOW_LAYER_ID = "geomaster-target-glow";
export const REMAINING_PULSE_FILL_LAYER_ID = "geomaster-remaining-pulse-fill";
export const REMAINING_PULSE_LINE_LAYER_ID = "geomaster-remaining-pulse-line";
export const LABEL_SOURCE_ID = "geomaster-country-labels";
export const LEADER_SOURCE_ID = "geomaster-country-leaders";
export const LEARNING_LABEL_SOURCE_ID = "geomaster-learning-country-labels";
export const LEARNING_LEADER_SOURCE_ID = "geomaster-learning-country-leaders";
export const GUIDE_CIRCLE_SOURCE_ID = "geomaster-small-country-guide-circles";
export const GUIDE_LINE_SOURCE_ID = "geomaster-small-country-guide-lines";
export const GUIDE_CIRCLE_LAYER_ID = "geomaster-small-country-guide-circle-layer";
export const GUIDE_LINE_LAYER_ID = "geomaster-small-country-guide-line-layer";
export const SUBDIVISION_SOURCE_ID = "geomaster-subdivisions";
export const SUBDIVISION_LABEL_LAYER_ID = "geomaster-subdivision-label-layer";
export const CITY_SOURCE_ID = "geomaster-cities";
export const CITY_CIRCLE_LAYER_ID = "geomaster-city-circle-layer";
export const CITY_LABEL_LAYER_ID = "geomaster-city-label-layer";
export const PHYSICAL_SOURCE_ID = "geomaster-physical-features";
export const PHYSICAL_LABEL_LAYER_ID = "geomaster-physical-feature-label-layer";
export const LANDMARK_SOURCE_ID = "geomaster-landmarks";
export const LANDMARK_CIRCLE_LAYER_ID = "geomaster-landmark-circle-layer";
export const LANDMARK_LABEL_LAYER_ID = "geomaster-landmark-label-layer";
export const LABEL_LAYER_PREFIX = "geomaster-country-label-layer";
export const LEADER_LAYER_ID = "geomaster-country-leader-layer";
export const LEARNING_LABEL_LAYER_PREFIX = "geomaster-learning-country-label-layer";
export const LEARNING_LEADER_LAYER_ID = "geomaster-learning-country-leader-layer";
export const DEBUG_LABEL_SOURCE_ID = "geomaster-debug-country-labels";
export const DEBUG_LEADER_SOURCE_ID = "geomaster-debug-country-leaders";
export const DEBUG_LABEL_LAYER_ID = "geomaster-debug-country-label-layer";
export const DEBUG_LEADER_LAYER_ID = "geomaster-debug-country-leader-layer";
export const MAP_STYLE = "mapbox://styles/mapbox/light-v11";

export const LABEL_ANCHORS = ["center", "left", "right", "top", "bottom"] as const;
export const LABEL_KINDS = ["fallback", "manual"] as const;
export const LABEL_LAYER_IDS = LABEL_KINDS.flatMap((kind) =>
  LABEL_ANCHORS.map((anchor) => `${LABEL_LAYER_PREFIX}-${kind}-${anchor}`),
);
export const LEARNING_LABEL_LAYER_IDS = LABEL_KINDS.flatMap((kind) =>
  LABEL_ANCHORS.map(
    (anchor) => `${LEARNING_LABEL_LAYER_PREFIX}-${kind}-${anchor}`,
  ),
);
export const GEOMASTER_LAYER_IDS = [
  FILL_LAYER_ID,
  LINE_LAYER_ID,
  TARGET_GLOW_LAYER_ID,
  REMAINING_PULSE_FILL_LAYER_ID,
  REMAINING_PULSE_LINE_LAYER_ID,
  GUIDE_LINE_LAYER_ID,
  GUIDE_CIRCLE_LAYER_ID,
  LEARNING_LEADER_LAYER_ID,
  SUBDIVISION_LABEL_LAYER_ID,
  CITY_CIRCLE_LAYER_ID,
  CITY_LABEL_LAYER_ID,
  PHYSICAL_LABEL_LAYER_ID,
  LANDMARK_CIRCLE_LAYER_ID,
  LANDMARK_LABEL_LAYER_ID,
  LEADER_LAYER_ID,
  ...LEARNING_LABEL_LAYER_IDS,
  ...LABEL_LAYER_IDS,
  DEBUG_LEADER_LAYER_ID,
  DEBUG_LABEL_LAYER_ID,
];

export const hideMapLabelsAndRoads = (map: Map) => {
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

export const addTerrainAndFog = (
  map: Map,
  { terrainEnabled = true }: { terrainEnabled?: boolean } = {},
) => {
  try {
    if (terrainEnabled) {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }

      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.08 });
    }

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

export const setCountryFeatureState = (
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

export const buildFillColorExpression = (
  selectedIds: string[],
  guessedIds: string[],
  assistedIds: string[],
  missedIds: string[],
) => [
  "case",
  ["boolean", ["feature-state", "wrong"], false],
  "#fb7185",
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
] as ExpressionSpecification;

export const buildFillOpacityExpression = (
  selectedIds: string[],
  guessedIds: string[],
  assistedIds: string[],
  missedIds: string[],
) => [
  "case",
  ["boolean", ["feature-state", "wrong"], false],
  0.86,
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
] as ExpressionSpecification;

export const buildRemainingPulseFilter = (
  remainingCountryIds: string[],
  pulseActive: boolean,
) =>
  (pulseActive && remainingCountryIds.length > 0
    ? ["in", ["get", "iso_a3"], ["literal", remainingCountryIds]]
    : ["==", ["get", "iso_a3"], "__none__"]) as FilterSpecification;

export const getPulseReason = (
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


export const getMapDebugSnapshot = (map: Map) => ({
  sourceIds: [
    SOURCE_ID,
    SUBDIVISION_SOURCE_ID,
    CITY_SOURCE_ID,
    PHYSICAL_SOURCE_ID,
    LANDMARK_SOURCE_ID,
    LEADER_SOURCE_ID,
    LABEL_SOURCE_ID,
    LEARNING_LEADER_SOURCE_ID,
    LEARNING_LABEL_SOURCE_ID,
    DEBUG_LEADER_SOURCE_ID,
    DEBUG_LABEL_SOURCE_ID,
  ].filter((sourceId) => Boolean(map.getSource(sourceId))),
  layerIds: GEOMASTER_LAYER_IDS.filter((layerId) => Boolean(map.getLayer(layerId))),
  labelSourceLoaded: Boolean(map.getSource(LABEL_SOURCE_ID)),
  labelLayerLoaded: [...LABEL_LAYER_IDS, ...LEARNING_LABEL_LAYER_IDS].some(
    (layerId) => Boolean(map.getLayer(layerId)),
  ),
  leaderSourceLoaded:
    Boolean(map.getSource(LEADER_SOURCE_ID)) ||
    Boolean(map.getSource(LEARNING_LEADER_SOURCE_ID)),
  leaderLayerLoaded:
    Boolean(map.getLayer(LEADER_LAYER_ID)) ||
    Boolean(map.getLayer(LEARNING_LEADER_LAYER_ID)),
  projection: map.getProjection?.().name ?? "unknown",
});

export const LEARNING_LAYER_IDS = [
  SUBDIVISION_LABEL_LAYER_ID,
  CITY_CIRCLE_LAYER_ID,
  CITY_LABEL_LAYER_ID,
  PHYSICAL_LABEL_LAYER_ID,
  LANDMARK_CIRCLE_LAYER_ID,
  LANDMARK_LABEL_LAYER_ID,
  LEARNING_LEADER_LAYER_ID,
  ...LEARNING_LABEL_LAYER_IDS,
];

export const setLearningLayerVisibility = (map: Map, visible: boolean) => {
  LEARNING_LAYER_IDS.forEach((layerId) => {
    if (!map.getLayer(layerId)) {
      return;
    }

    map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
  });
};
