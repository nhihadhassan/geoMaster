import type { Feature, FeatureCollection, Point } from "geojson";
import { countries, type Country } from "@/data/countries";
import { landmarks, type Landmark } from "@/data/landmarks";
import {
  physicalFeatures,
  type PhysicalFeature,
} from "@/data/physicalFeatures";
import { subdivisions, type Subdivision } from "@/data/subdivisions";

export type LearningFeature =
  | { kind: "country"; country: Country }
  | { kind: "subdivision"; feature: Subdivision }
  | { kind: "physical"; feature: PhysicalFeature }
  | { kind: "landmark"; feature: Landmark };

export type LearningPointProperties = {
  id: string;
  name: string;
  type: string;
  parent?: string;
  zoomMin?: number;
};

const countryNameByIso = new Map(
  countries.map((country) => [country.iso_a3, country.name]),
);

const toFeatureCollection = <T extends { id: string; name: string; center: [number, number] }>(
  items: T[],
  getProperties: (item: T) => LearningPointProperties,
) =>
  ({
    type: "FeatureCollection",
    features: items.map(
      (item): Feature<Point, LearningPointProperties> => ({
        type: "Feature",
        properties: getProperties(item),
        geometry: {
          type: "Point",
          coordinates: item.center,
        },
      }),
    ),
  }) satisfies FeatureCollection<Point, LearningPointProperties>;

export const subdivisionFeatureCollection = toFeatureCollection(
  subdivisions,
  (subdivision) => ({
    id: subdivision.id,
    name: subdivision.name,
    type: subdivision.type,
    parent: countryNameByIso.get(subdivision.countryIsoA3),
  }),
);

export const physicalFeatureCollection = toFeatureCollection(
  physicalFeatures,
  (feature) => ({
    id: feature.id,
    name: feature.name,
    type: feature.type,
    zoomMin: feature.zoomMin,
  }),
);

export const landmarkFeatureCollection = toFeatureCollection(
  landmarks,
  (landmark) => ({
    id: landmark.id,
    name: landmark.name,
    type: landmark.type,
    parent: landmark.countryIsoA3
      ? countryNameByIso.get(landmark.countryIsoA3)
      : undefined,
    zoomMin: landmark.zoomMin,
  }),
);

export const findLearningFeature = (
  kind: Exclude<LearningFeature["kind"], "country">,
  id: string | null | undefined,
): LearningFeature | null => {
  if (!id) {
    return null;
  }

  if (kind === "subdivision") {
    const feature = subdivisions.find((item) => item.id === id);
    return feature ? { kind, feature } : null;
  }

  if (kind === "physical") {
    const feature = physicalFeatures.find((item) => item.id === id);
    return feature ? { kind, feature } : null;
  }

  const feature = landmarks.find((item) => item.id === id);
  return feature ? { kind, feature } : null;
};

export const getParentCountryName = (iso: string | undefined) =>
  iso ? countryNameByIso.get(iso) : undefined;
