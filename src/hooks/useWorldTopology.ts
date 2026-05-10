"use client";

import { useMemo } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import worldCountries from "@/data/world-countries.geo.json";

export type CountryProperties = {
  iso_a3: string;
  name: string;
};

type RawCountryProperties = Record<string, unknown>;
type CountryFeature = Feature<Geometry, CountryProperties>;
type CountryFeatureCollection = FeatureCollection<Geometry, CountryProperties>;

const readString = (properties: RawCountryProperties, keys: string[]) => {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === "string" && value && value !== "-99") {
      return value;
    }
  }

  return "";
};

const normalizeFeature = (
  feature: Feature<Geometry, RawCountryProperties>,
): CountryFeature | null => {
  const iso = readString(feature.properties ?? {}, [
    "iso_a3",
    "ISO_A3",
    "ADM0_A3",
    "adm0_a3",
    "WB_A3",
    "SOV_A3",
  ]);
  const name = readString(feature.properties ?? {}, [
    "name",
    "NAME",
    "ADMIN",
    "admin",
  ]);

  if (!iso || !name) {
    return null;
  }

  return {
    ...feature,
    id: iso,
    properties: {
      iso_a3: iso,
      name,
    },
  };
};

export function useWorldTopology() {
  return useMemo(() => {
    try {
      const collection = worldCountries as unknown as FeatureCollection<
        Geometry,
        RawCountryProperties
      >;
      const features = collection.features
        .map(normalizeFeature)
        .filter((feature): feature is CountryFeature => Boolean(feature));

      return {
        data: {
          type: "FeatureCollection",
          features,
        } satisfies CountryFeatureCollection,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Unable to load world country geometry."),
      };
    }
  }, []);
}
