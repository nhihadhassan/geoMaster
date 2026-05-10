"use client";

import mapboxgl, { type GeoJSONSource, type Map } from "mapbox-gl";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";
import { countries } from "@/data/countries";
import { buildLabelCollections } from "@/data/labelPlacements";
import type { CountryProperties } from "@/hooks/useWorldTopology";

const INSET_SOURCE_ID = "geomaster-caribbean-countries";
const INSET_FILL_LAYER_ID = "geomaster-caribbean-fill";
const INSET_LINE_LAYER_ID = "geomaster-caribbean-line";
const INSET_TARGET_FILL_LAYER_ID = "geomaster-caribbean-target-fill";
const INSET_TARGET_LINE_LAYER_ID = "geomaster-caribbean-target-line";
const INSET_PULSE_FILL_LAYER_ID = "geomaster-caribbean-pulse-fill";
const INSET_PULSE_LINE_LAYER_ID = "geomaster-caribbean-pulse-line";
const INSET_LABEL_SOURCE_ID = "geomaster-caribbean-labels";
const INSET_LEADER_SOURCE_ID = "geomaster-caribbean-leaders";
const INSET_LABEL_LAYER_PREFIX = "geomaster-caribbean-label-layer";
const INSET_LEADER_LAYER_ID = "geomaster-caribbean-leader-layer";
const INSET_DEBUG_LABEL_SOURCE_ID = "geomaster-caribbean-debug-labels";
const INSET_DEBUG_LEADER_SOURCE_ID = "geomaster-caribbean-debug-leaders";
const INSET_DEBUG_LABEL_LAYER_ID = "geomaster-caribbean-debug-label-layer";
const INSET_DEBUG_LEADER_LAYER_ID = "geomaster-caribbean-debug-leader-layer";
const MAP_STYLE = "mapbox://styles/mapbox/light-v11";
const LABEL_ANCHORS = ["center", "left", "right", "top", "bottom"] as const;
const INSET_LABEL_LAYER_IDS = LABEL_ANCHORS.map(
  (anchor) => `${INSET_LABEL_LAYER_PREFIX}-${anchor}`,
);
const CARIBBEAN_BOUNDS: [[number, number], [number, number]] = [
  [-86, 9],
  [-58, 28],
];

export const caribbeanCountryIds = new Set([
  "ATG",
  "BHS",
  "BRB",
  "CUB",
  "DMA",
  "DOM",
  "GRD",
  "HTI",
  "JAM",
  "KNA",
  "LCA",
  "VCT",
  "TTO",
]);

type CaribbeanInsetMapProps = {
  mapboxToken: string;
  topologyData: FeatureCollection<Geometry, CountryProperties>;
  guessedCountryIds: string[];
  assistedCountryIds: string[];
  visibleLabelIds: string[];
  debugLabelIds: string[];
  missedCountryIds: string[];
  remainingCountryIds: string[];
  pulseActive: boolean;
  targetCountryId: string | null;
  clickEnabled?: boolean;
  onCountryClick?: (iso: string | null) => void;
  onLabelSourceLoaded?: (loaded: boolean) => void;
};

const hideLabels = (map: Map) => {
  map.getStyle().layers?.forEach((layer) => {
    const id = layer.id.toLowerCase();

    if (
      layer.type === "symbol" ||
      id.includes("road") ||
      id.includes("transit") ||
      id.includes("admin") ||
      id.includes("building") ||
      id.includes("place") ||
      id.includes("label")
    ) {
      try {
        map.setLayoutProperty(layer.id, "visibility", "none");
      } catch {
        // Base style internals can vary; labels are polish here.
      }
    }
  });
};

const buildFillColorExpression = (
  guessedIds: string[],
  assistedIds: string[],
  missedIds: string[],
) =>
  [
    "case",
    ["in", ["get", "iso_a3"], ["literal", missedIds]],
    "#f7b7b0",
    ["in", ["get", "iso_a3"], ["literal", assistedIds]],
    "#fbbf24",
    ["in", ["get", "iso_a3"], ["literal", guessedIds]],
    "#22f6a5",
    "#748394",
  ] as mapboxgl.ExpressionSpecification;

const buildFillOpacityExpression = (
  guessedIds: string[],
  assistedIds: string[],
  missedIds: string[],
) =>
  [
    "case",
    ["in", ["get", "iso_a3"], ["literal", missedIds]],
    0.88,
    ["in", ["get", "iso_a3"], ["literal", assistedIds]],
    0.94,
    ["in", ["get", "iso_a3"], ["literal", guessedIds]],
    0.95,
    0.62,
  ] as mapboxgl.ExpressionSpecification;

const buildRemainingFilter = (
  remainingCountryIds: string[],
  pulseActive: boolean,
) =>
  (pulseActive && remainingCountryIds.some((id) => caribbeanCountryIds.has(id))
    ? [
        "in",
        ["get", "iso_a3"],
        ["literal", remainingCountryIds.filter((id) => caribbeanCountryIds.has(id))],
      ]
    : ["==", ["get", "iso_a3"], "__none__"]) as mapboxgl.FilterSpecification;

const buildTargetFilter = (targetCountryId: string | null) =>
  (targetCountryId && caribbeanCountryIds.has(targetCountryId)
    ? ["==", ["get", "iso_a3"], targetCountryId]
    : ["==", ["get", "iso_a3"], "__none__"]) as mapboxgl.FilterSpecification;

export function CaribbeanInsetMap({
  mapboxToken,
  topologyData,
  guessedCountryIds,
  assistedCountryIds,
  visibleLabelIds,
  debugLabelIds,
  missedCountryIds,
  remainingCountryIds,
  pulseActive,
  targetCountryId,
  clickEnabled = false,
  onCountryClick,
  onLabelSourceLoaded,
}: CaribbeanInsetMapProps) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const pulseFrameRef = useRef<number | null>(null);
  const targetPulseFrameRef = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const caribbeanData = useMemo(
    () =>
      ({
        type: "FeatureCollection",
        features: topologyData.features.filter((feature) =>
          caribbeanCountryIds.has(feature.properties.iso_a3),
        ),
      }) satisfies FeatureCollection<Geometry, CountryProperties>,
    [topologyData],
  );
  const labelCollections = useMemo(
    () =>
      buildLabelCollections(
        countries.filter((country) => caribbeanCountryIds.has(country.iso_a3)),
        visibleLabelIds.filter((id) => caribbeanCountryIds.has(id)),
        "inset",
      ),
    [visibleLabelIds],
  );
  const debugLabelCollections = useMemo(
    () =>
      buildLabelCollections(
        countries.filter((country) => caribbeanCountryIds.has(country.iso_a3)),
        debugLabelIds.filter((id) => caribbeanCountryIds.has(id)),
        "inset",
      ),
    [debugLabelIds],
  );

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current || !mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapNodeRef.current,
      style: MAP_STYLE,
      bounds: CARIBBEAN_BOUNDS,
      fitBoundsOptions: {
        padding: 18,
      },
      interactive: true,
      attributionControl: false,
      projection: "mercator",
    });

    mapRef.current = map;
    map.dragPan.disable();
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();
    map.keyboard.disable();

    map.once("load", () => {
      hideLabels(map);
      setMapLoaded(true);
    });

    return () => {
      onLabelSourceLoaded?.(false);

      if (pulseFrameRef.current) {
        window.cancelAnimationFrame(pulseFrameRef.current);
        pulseFrameRef.current = null;
      }

      if (targetPulseFrameRef.current) {
        window.cancelAnimationFrame(targetPulseFrameRef.current);
        targetPulseFrameRef.current = null;
      }

      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [mapboxToken, onLabelSourceLoaded]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    const canvas = map.getCanvas();
    canvas.style.cursor = clickEnabled ? "pointer" : "";

    if (!clickEnabled) {
      return () => {
        canvas.style.cursor = "";
      };
    }

    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      if (!map.getLayer(INSET_FILL_LAYER_ID)) {
        onCountryClick?.(null);
        return;
      }

      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [INSET_FILL_LAYER_ID],
      });
      const iso =
        typeof feature?.properties?.iso_a3 === "string"
          ? feature.properties.iso_a3
          : null;

      onCountryClick?.(iso && caribbeanCountryIds.has(iso) ? iso : null);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
      canvas.style.cursor = "";
    };
  }, [clickEnabled, mapLoaded, onCountryClick]);

  const ensureLayers = useCallback(
    (map: Map) => {
      if (!map.isStyleLoaded()) {
        return;
      }

      const source = map.getSource(INSET_SOURCE_ID) as GeoJSONSource | undefined;
      const labelSource = map.getSource(INSET_LABEL_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const leaderSource = map.getSource(INSET_LEADER_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const debugLabelSource = map.getSource(INSET_DEBUG_LABEL_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      const debugLeaderSource = map.getSource(INSET_DEBUG_LEADER_SOURCE_ID) as
        | GeoJSONSource
        | undefined;

      if (source) {
        source.setData(caribbeanData);
      } else {
        map.addSource(INSET_SOURCE_ID, {
          type: "geojson",
          data: caribbeanData,
          promoteId: "iso_a3",
        });
      }

      if (leaderSource) {
        leaderSource.setData(labelCollections.leaders);
      } else {
        map.addSource(INSET_LEADER_SOURCE_ID, {
          type: "geojson",
          data: labelCollections.leaders,
        });
      }

      if (labelSource) {
        labelSource.setData(labelCollections.labels);
      } else {
        map.addSource(INSET_LABEL_SOURCE_ID, {
          type: "geojson",
          data: labelCollections.labels,
        });
      }

      if (debugLeaderSource) {
        debugLeaderSource.setData(debugLabelCollections.leaders);
      } else {
        map.addSource(INSET_DEBUG_LEADER_SOURCE_ID, {
          type: "geojson",
          data: debugLabelCollections.leaders,
        });
      }

      if (debugLabelSource) {
        debugLabelSource.setData(debugLabelCollections.labels);
      } else {
        map.addSource(INSET_DEBUG_LABEL_SOURCE_ID, {
          type: "geojson",
          data: debugLabelCollections.labels,
        });
      }

      if (!map.getLayer(INSET_FILL_LAYER_ID)) {
        map.addLayer({
          id: INSET_FILL_LAYER_ID,
          type: "fill",
          source: INSET_SOURCE_ID,
          paint: {
            "fill-color": buildFillColorExpression(
              guessedCountryIds,
              assistedCountryIds,
              missedCountryIds,
            ),
            "fill-opacity": buildFillOpacityExpression(
              guessedCountryIds,
              assistedCountryIds,
              missedCountryIds,
            ),
          },
        });
      }

      if (!map.getLayer(INSET_PULSE_FILL_LAYER_ID)) {
        map.addLayer({
          id: INSET_PULSE_FILL_LAYER_ID,
          type: "fill",
          source: INSET_SOURCE_ID,
          filter: buildRemainingFilter(remainingCountryIds, pulseActive),
          paint: {
            "fill-color": "#f8fafc",
            "fill-opacity": 0,
          },
        });
      }

      if (!map.getLayer(INSET_LINE_LAYER_ID)) {
        map.addLayer({
          id: INSET_LINE_LAYER_ID,
          type: "line",
          source: INSET_SOURCE_ID,
          paint: {
            "line-color": "#f8fafc",
            "line-opacity": 0.76,
            "line-width": 1,
          },
        });
      }

      if (!map.getLayer(INSET_TARGET_FILL_LAYER_ID)) {
        map.addLayer({
          id: INSET_TARGET_FILL_LAYER_ID,
          type: "fill",
          source: INSET_SOURCE_ID,
          filter: buildTargetFilter(targetCountryId),
          paint: {
            "fill-color": "#67e8f9",
            "fill-opacity": 0,
          },
        });
      }

      if (!map.getLayer(INSET_TARGET_LINE_LAYER_ID)) {
        map.addLayer({
          id: INSET_TARGET_LINE_LAYER_ID,
          type: "line",
          source: INSET_SOURCE_ID,
          filter: buildTargetFilter(targetCountryId),
          paint: {
            "line-color": "#22d3ee",
            "line-opacity": 0,
            "line-width": 0,
            "line-blur": 1.6,
          },
        });
      }

      if (!map.getLayer(INSET_PULSE_LINE_LAYER_ID)) {
        map.addLayer({
          id: INSET_PULSE_LINE_LAYER_ID,
          type: "line",
          source: INSET_SOURCE_ID,
          filter: buildRemainingFilter(remainingCountryIds, pulseActive),
          paint: {
            "line-color": "#ffffff",
            "line-opacity": 0,
            "line-width": 2.2,
            "line-blur": 1.4,
          },
        });
      }

      if (!map.getLayer(INSET_LEADER_LAYER_ID)) {
        map.addLayer({
          id: INSET_LEADER_LAYER_ID,
          type: "line",
          source: INSET_LEADER_SOURCE_ID,
          paint: {
            "line-color": "#475569",
            "line-opacity": 0.55,
            "line-width": 0.85,
            "line-blur": 0.1,
          },
        });
      }

      LABEL_ANCHORS.forEach((anchor) => {
        const layerId = `${INSET_LABEL_LAYER_PREFIX}-${anchor}`;

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: "symbol",
            source: INSET_LABEL_SOURCE_ID,
            filter: ["==", ["get", "textAnchor"], anchor],
            layout: {
              "text-field": ["get", "label"],
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
              "text-size": [
                "match",
                ["get", "labelSize"],
                "small",
                9.5,
                "large",
                11.5,
                10.5,
              ],
              "text-anchor": anchor,
              "text-line-height": 0.95,
              "text-letter-spacing": 0,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            },
            paint: {
              "text-color": "#172033",
              "text-halo-color": "rgba(248,250,252,0.94)",
              "text-halo-width": 1.7,
              "text-halo-blur": 0.16,
            },
          });
        }
      });

      if (!map.getLayer(INSET_DEBUG_LEADER_LAYER_ID)) {
        map.addLayer({
          id: INSET_DEBUG_LEADER_LAYER_ID,
          type: "line",
          source: INSET_DEBUG_LEADER_SOURCE_ID,
          paint: {
            "line-color": "#fde68a",
            "line-opacity": 0.95,
            "line-width": 1.8,
          },
        });
      }

      if (!map.getLayer(INSET_DEBUG_LABEL_LAYER_ID)) {
        map.addLayer({
          id: INSET_DEBUG_LABEL_LAYER_ID,
          type: "symbol",
          source: INSET_DEBUG_LABEL_SOURCE_ID,
          layout: {
            "text-field": ["concat", "TEST: ", ["get", "name"]],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 15,
            "text-anchor": "center",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#020617",
            "text-halo-width": 3,
          },
        });
      }

      [
        INSET_TARGET_FILL_LAYER_ID,
        INSET_TARGET_LINE_LAYER_ID,
        INSET_LEADER_LAYER_ID,
        ...INSET_LABEL_LAYER_IDS,
        INSET_DEBUG_LEADER_LAYER_ID,
        INSET_DEBUG_LABEL_LAYER_ID,
      ].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.moveLayer(layerId);
        }
      });

      onLabelSourceLoaded?.(
        INSET_LABEL_LAYER_IDS.some((layerId) => Boolean(map.getLayer(layerId))),
      );
    },
    [
      caribbeanData,
      debugLabelCollections,
      assistedCountryIds,
      guessedCountryIds,
      labelCollections,
      missedCountryIds,
      onLabelSourceLoaded,
      pulseActive,
      remainingCountryIds,
      targetCountryId,
    ],
  );

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded || !map) {
      return;
    }

    const syncLayers = () => {
      if (!map.isStyleLoaded()) {
        return;
      }

      try {
        ensureLayers(map);
      } catch {
        onLabelSourceLoaded?.(false);
        return;
      }

      if (!map.getLayer(INSET_FILL_LAYER_ID)) {
        return;
      }

      map.setPaintProperty(
        INSET_FILL_LAYER_ID,
        "fill-color",
        buildFillColorExpression(
          guessedCountryIds,
          assistedCountryIds,
          missedCountryIds,
        ),
      );
      map.setPaintProperty(
        INSET_FILL_LAYER_ID,
        "fill-opacity",
        buildFillOpacityExpression(
          guessedCountryIds,
          assistedCountryIds,
          missedCountryIds,
        ),
      );
      map.setFilter(
        INSET_PULSE_FILL_LAYER_ID,
        buildRemainingFilter(remainingCountryIds, pulseActive),
      );
      map.setFilter(
        INSET_PULSE_LINE_LAYER_ID,
        buildRemainingFilter(remainingCountryIds, pulseActive),
      );
      map.setFilter(INSET_TARGET_FILL_LAYER_ID, buildTargetFilter(targetCountryId));
      map.setFilter(INSET_TARGET_LINE_LAYER_ID, buildTargetFilter(targetCountryId));
      (
        map.getSource(INSET_LABEL_SOURCE_ID) as GeoJSONSource | undefined
      )?.setData(labelCollections.labels);
      (
        map.getSource(INSET_LEADER_SOURCE_ID) as GeoJSONSource | undefined
      )?.setData(labelCollections.leaders);
      (
        map.getSource(INSET_DEBUG_LABEL_SOURCE_ID) as GeoJSONSource | undefined
      )?.setData(debugLabelCollections.labels);
      (
        map.getSource(INSET_DEBUG_LEADER_SOURCE_ID) as GeoJSONSource | undefined
      )?.setData(debugLabelCollections.leaders);
    };

    syncLayers();
    map.on("styledata", syncLayers);
    map.on("idle", syncLayers);

    return () => {
      map.off("styledata", syncLayers);
      map.off("idle", syncLayers);
    };
  }, [
    debugLabelCollections,
    assistedCountryIds,
    ensureLayers,
    guessedCountryIds,
    labelCollections,
    mapLoaded,
    missedCountryIds,
    onLabelSourceLoaded,
    pulseActive,
    remainingCountryIds,
    targetCountryId,
  ]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded) {
      return;
    }

    if (
      !map?.getLayer(INSET_PULSE_FILL_LAYER_ID) ||
      !map.getLayer(INSET_PULSE_LINE_LAYER_ID)
    ) {
      return;
    }

    if (pulseFrameRef.current) {
      window.cancelAnimationFrame(pulseFrameRef.current);
      pulseFrameRef.current = null;
    }

    if (!pulseActive) {
      map.setPaintProperty(INSET_PULSE_FILL_LAYER_ID, "fill-opacity", 0);
      map.setPaintProperty(INSET_PULSE_LINE_LAYER_ID, "line-opacity", 0);
      return;
    }

    const startedAt = performance.now();
    const animate = (now: number) => {
      if (mapRef.current !== map) {
        return;
      }

      const pulse = (Math.sin(((now - startedAt) / 1900) * Math.PI * 2) + 1) / 2;
      map.setPaintProperty(
        INSET_PULSE_FILL_LAYER_ID,
        "fill-opacity",
        0.06 + pulse * 0.18,
      );
      map.setPaintProperty(
        INSET_PULSE_LINE_LAYER_ID,
        "line-opacity",
        0.2 + pulse * 0.48,
      );
      pulseFrameRef.current = window.requestAnimationFrame(animate);
    };

    pulseFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (pulseFrameRef.current) {
        window.cancelAnimationFrame(pulseFrameRef.current);
        pulseFrameRef.current = null;
      }
    };
  }, [mapLoaded, pulseActive]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapLoaded) {
      return;
    }

    if (
      !map?.getLayer(INSET_TARGET_FILL_LAYER_ID) ||
      !map.getLayer(INSET_TARGET_LINE_LAYER_ID)
    ) {
      return;
    }

    if (targetPulseFrameRef.current) {
      window.cancelAnimationFrame(targetPulseFrameRef.current);
      targetPulseFrameRef.current = null;
    }

    map.setFilter(INSET_TARGET_FILL_LAYER_ID, buildTargetFilter(targetCountryId));
    map.setFilter(INSET_TARGET_LINE_LAYER_ID, buildTargetFilter(targetCountryId));

    if (!targetCountryId || !caribbeanCountryIds.has(targetCountryId)) {
      map.setPaintProperty(INSET_TARGET_FILL_LAYER_ID, "fill-opacity", 0);
      map.setPaintProperty(INSET_TARGET_LINE_LAYER_ID, "line-opacity", 0);
      map.setPaintProperty(INSET_TARGET_LINE_LAYER_ID, "line-width", 0);
      return;
    }

    const startedAt = performance.now();
    const animate = (now: number) => {
      if (mapRef.current !== map) {
        return;
      }

      const pulse = (Math.sin((now - startedAt) / 280) + 1) / 2;
      map.setPaintProperty(
        INSET_TARGET_FILL_LAYER_ID,
        "fill-opacity",
        0.2 + pulse * 0.28,
      );
      map.setPaintProperty(
        INSET_TARGET_LINE_LAYER_ID,
        "line-opacity",
        0.42 + pulse * 0.5,
      );
      map.setPaintProperty(
        INSET_TARGET_LINE_LAYER_ID,
        "line-width",
        2 + pulse * 5,
      );

      targetPulseFrameRef.current = window.requestAnimationFrame(animate);
    };

    targetPulseFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (targetPulseFrameRef.current) {
        window.cancelAnimationFrame(targetPulseFrameRef.current);
        targetPulseFrameRef.current = null;
      }
    };
  }, [mapLoaded, targetCountryId]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 18, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute right-5 top-36 z-20 w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-white/14 bg-black/38 p-3 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/44">
            Caribbean Detail
          </p>
          <p className="text-xs text-white/58">Island countries magnified</p>
        </div>
        {pulseActive ? (
          <span className="rounded-full border border-white/12 bg-white/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/72">
            Hints
          </span>
        ) : null}
      </div>
      <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
        <div ref={mapNodeRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.10),transparent_10rem)]" />
      </div>
    </motion.aside>
  );
}
