"use client";

import { useEffect, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type {
  GeometryCollection,
  Topology,
} from "topojson-specification";

export type CountryProperties = {
  iso_a3: string;
  name: string;
};

type CountryFeature = Feature<Geometry, CountryProperties>;
type CountryFeatureCollection = FeatureCollection<Geometry, CountryProperties>;
type CountryTopology = Topology<{
  countries: GeometryCollection<CountryProperties>;
}>;
type TopologyState = {
  data: CountryFeatureCollection | null;
  isLoading: boolean;
  error: Error | null;
};
type UseWorldTopologyOptions = {
  enabled: boolean;
  retryKey: number;
};

export const WORLD_TOPOLOGY_PATH = "/data/world-countries.topo.json";

const IDLE_STATE: TopologyState = {
  data: null,
  isLoading: false,
  error: null,
};

const isCountryFeature = (item: Feature<Geometry>): item is CountryFeature =>
  typeof item.properties?.iso_a3 === "string" &&
  typeof item.properties?.name === "string";

const parseTopology = (value: unknown): CountryFeatureCollection => {
  const topology = value as CountryTopology;
  const countriesObject = topology?.objects?.countries;

  if (topology?.type !== "Topology" || !countriesObject) {
    throw new Error("The world country geometry response is invalid.");
  }

  const collection = feature(topology, countriesObject);

  if (collection.type !== "FeatureCollection") {
    throw new Error("The world country geometry has no feature collection.");
  }

  const features = collection.features.filter(isCountryFeature);

  if (features.length !== collection.features.length || features.length === 0) {
    throw new Error("The world country geometry is missing country metadata.");
  }

  return {
    type: "FeatureCollection",
    features,
  };
};

export function useWorldTopology({
  enabled,
  retryKey,
}: UseWorldTopologyOptions) {
  const [state, setState] = useState<TopologyState>(IDLE_STATE);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    let settled = false;
    const loadingTimeoutId = window.setTimeout(() => {
      if (!settled) {
        setState({ data: null, isLoading: true, error: null });
      }
    }, 0);

    void fetch(WORLD_TOPOLOGY_PATH, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Could not load world country geometry (${response.status}).`,
          );
        }

        return response.json() as Promise<unknown>;
      })
      .then((value) => {
        if (controller.signal.aborted) {
          return;
        }

        settled = true;
        window.clearTimeout(loadingTimeoutId);
        setState({ data: parseTopology(value), isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        settled = true;
        window.clearTimeout(loadingTimeoutId);
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Unable to load world country geometry."),
        });
      });

    return () => {
      settled = true;
      window.clearTimeout(loadingTimeoutId);
      controller.abort();
    };
  }, [enabled, retryKey]);

  return state;
}
