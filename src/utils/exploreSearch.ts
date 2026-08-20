// Search index for explore mode. It reuses the datasets the map already loads
// - countries, cities, landmarks, physical features, subdivisions - so nothing
// new is fetched and every result maps onto an existing LearningFeature.
import { cities } from "@/data/cities";
import { countries } from "@/data/countries";
import { landmarks } from "@/data/landmarks";
import { physicalFeatures } from "@/data/physicalFeatures";
import { subdivisions } from "@/data/subdivisions";
import type { LearningFeature } from "@/data/learningFeatures";
import { normalizeCountryText } from "@/utils/countryMatcher";

export type ExploreSearchResult = {
  key: string;
  name: string;
  /** "Country", "City", "Mountain Range"... shown as the result's category. */
  kindLabel: string;
  /** Where it sits: parent country, region, etc. */
  context?: string;
  center: [number, number];
  /** How far to fly in. Countries carry their own tuned zoom. */
  zoom: number;
  feature: LearningFeature;
  /** Alternate names and related terms. Matched, but ranked below the name so
   *  that searching "Toronto" surfaces Toronto before the province whose
   *  capital it happens to be. */
  aliases: string[];
};

const titleCase = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const countryNameByIso = new Map(
  countries.map((country) => [country.iso_a3, country.name]),
);

const buildIndex = (): ExploreSearchResult[] => [
  ...countries.map((country) => ({
    key: `country-${country.iso_a3}`,
    name: country.name,
    kindLabel: "Country",
    context: country.capital || undefined,
    center: [country.center.lng, country.center.lat] as [number, number],
    zoom: country.zoom,
    feature: { kind: "country", country } satisfies LearningFeature,
    aliases: [country.capital, ...country.acceptedNames],
  })),
  ...subdivisions.map((subdivision) => ({
    key: `subdivision-${subdivision.id}`,
    name: subdivision.name,
    kindLabel: titleCase(subdivision.type),
    context: countryNameByIso.get(subdivision.countryIsoA3),
    center: subdivision.center,
    zoom: 4.6,
    feature: {
      kind: "subdivision",
      feature: subdivision,
    } satisfies LearningFeature,
    aliases: [subdivision.education?.capital ?? ""],
  })),
  ...cities.map((city) => ({
    key: `city-${city.id}`,
    name: city.name,
    kindLabel: "City",
    context: `${city.subdivision}, ${countryNameByIso.get(city.countryIsoA3) ?? ""}`,
    center: city.center,
    zoom: Math.max(city.zoomMin, 6),
    feature: { kind: "city", feature: city } satisfies LearningFeature,
    aliases: [city.subdivision],
  })),
  ...landmarks.map((landmark) => ({
    key: `landmark-${landmark.id}`,
    name: landmark.name,
    kindLabel: titleCase(landmark.type),
    context: [
      landmark.city,
      landmark.countryIsoA3
        ? countryNameByIso.get(landmark.countryIsoA3)
        : undefined,
    ]
      .filter(Boolean)
      .join(", "),
    center: landmark.center,
    zoom: Math.max(landmark.zoomMin, 8),
    feature: { kind: "landmark", feature: landmark } satisfies LearningFeature,
    aliases: [landmark.city ?? ""],
  })),
  ...physicalFeatures.map((feature) => ({
    key: `physical-${feature.id}`,
    name: feature.name,
    kindLabel: titleCase(feature.type),
    context: undefined,
    center: feature.center,
    zoom: Math.max(feature.zoomMin, 3.4),
    feature: { kind: "physical", feature } satisfies LearningFeature,
    aliases: [],
  })),
];

let cachedIndex: ExploreSearchResult[] | null = null;

const getIndex = () => {
  cachedIndex ??= buildIndex();

  return cachedIndex;
};

/**
 * Prefix-first ranking: an exact name wins, then a name that starts with the
 * query, then anything containing it. Countries outrank other kinds at equal
 * strength, because they are what people usually mean.
 */
const matchStrength = (candidate: string, query: string) => {
  const normalized = normalizeCountryText(candidate);

  if (!normalized) {
    return 0;
  }

  if (normalized === query) {
    return 100;
  }

  if (normalized.startsWith(query)) {
    return 70;
  }

  return normalized.includes(query) ? 40 : 0;
};

const scoreEntry = (entry: ExploreSearchResult, query: string) => {
  const nameScore = matchStrength(entry.name, query);
  const aliasScore = entry.aliases.reduce(
    (best, alias) => Math.max(best, matchStrength(alias, query)),
    0,
  );
  // An alias hit is worth less than the same hit on the place's own name.
  const best = Math.max(nameScore, aliasScore * 0.6);

  if (best === 0) {
    return 0;
  }

  return best + (entry.kindLabel === "Country" ? 5 : 0);
};

export const searchExplore = (rawQuery: string, limit = 8) => {
  const query = normalizeCountryText(rawQuery);

  if (query.length < 2) {
    return [];
  }

  return getIndex()
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((match) => match.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.entry.name.length - b.entry.name.length,
    )
    .slice(0, limit)
    .map((match) => match.entry);
};
