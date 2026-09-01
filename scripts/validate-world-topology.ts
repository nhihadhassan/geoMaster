import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type {
  GeometryCollection,
  Topology,
} from "topojson-specification";
import { caribbeanCountryIds } from "../src/data/caribbean.ts";

type RawCountryProperties = Record<string, unknown>;
type CountryProperties = {
  iso_a3: string;
  name: string;
};
type CountryFeature = Feature<Geometry, CountryProperties>;

const SOURCE_PATH = resolve("src/data/world-countries.geo.json");
const OUTPUT_PATH = resolve("public/data/world-countries.topo.json");
const EXPECTED_FEATURE_COUNT = 242;
const MAX_BOUNDS_DELTA_DEGREES = 0.0005;
const MAX_OUTPUT_BYTES = 1_100_000;
const SMALL_COUNTRY_CHECKS = [
  ...caribbeanCountryIds,
  "MCO",
  "NRU",
  "SGP",
  "VAT",
];

const assert: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) {
    throw new Error(message);
  }
};

const readString = (properties: RawCountryProperties, keys: string[]) => {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === "string" && value && value !== "-99") {
      return value;
    }
  }

  return "";
};

const normalizeSourceFeature = (
  sourceFeature: Feature<Geometry, RawCountryProperties>,
): CountryFeature | null => {
  const iso = readString(sourceFeature.properties ?? {}, [
    "iso_a3",
    "ISO_A3",
    "ADM0_A3",
    "adm0_a3",
    "WB_A3",
    "SOV_A3",
  ]);
  const name = readString(sourceFeature.properties ?? {}, [
    "name",
    "NAME",
    "ADMIN",
    "admin",
  ]);

  return iso && name
    ? {
        type: "Feature",
        id: iso,
        properties: { iso_a3: iso, name },
        geometry: sourceFeature.geometry,
      }
    : null;
};

const getBounds = (geometry: Geometry) => {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];

  const visit = (value: unknown) => {
    if (
      Array.isArray(value) &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      bounds[0] = Math.min(bounds[0], value[0]);
      bounds[1] = Math.min(bounds[1], value[1]);
      bounds[2] = Math.max(bounds[2], value[0]);
      bounds[3] = Math.max(bounds[3], value[1]);

      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
    }
  };

  const visitGeometry = (item: Geometry) => {
    if (item.type === "GeometryCollection") {
      item.geometries.forEach(visitGeometry);

      return;
    }

    visit(item.coordinates);
  };

  visitGeometry(geometry);

  return bounds;
};

const sourceDocument = JSON.parse(
  await readFile(SOURCE_PATH, "utf8"),
) as FeatureCollection<Geometry, RawCountryProperties>;
const sourceFeatures = sourceDocument.features
  .map(normalizeSourceFeature)
  .filter((item): item is CountryFeature => item !== null);
const topologyDocument = JSON.parse(
  await readFile(OUTPUT_PATH, "utf8"),
) as Topology<{ countries: GeometryCollection<CountryProperties> }>;
const countryObject = topologyDocument.objects.countries;

assert(countryObject, "The generated topology has no countries object.");

const generatedDocument = feature(
  topologyDocument,
  countryObject,
) as FeatureCollection<Geometry, CountryProperties>;

assert(
  sourceFeatures.length === EXPECTED_FEATURE_COUNT,
  `Expected ${EXPECTED_FEATURE_COUNT} normalized source features, received ${sourceFeatures.length}.`,
);
assert(
  generatedDocument.features.length === sourceFeatures.length,
  `Generated feature count ${generatedDocument.features.length} does not match source count ${sourceFeatures.length}.`,
);

const sourceById = new Map(
  sourceFeatures.map((item) => [item.properties.iso_a3, item]),
);
const generatedById = new Map(
  generatedDocument.features.map((item) => [item.properties.iso_a3, item]),
);

for (const [iso, sourceFeature] of sourceById) {
  const generatedFeature = generatedById.get(iso);
  assert(generatedFeature, `Generated topology is missing ${iso}.`);
  assert(
    generatedFeature.properties.name === sourceFeature.properties.name,
    `${iso} changed name from ${sourceFeature.properties.name} to ${generatedFeature.properties.name}.`,
  );
  assert(
    generatedFeature.geometry.type === sourceFeature.geometry.type,
    `${iso} changed geometry type from ${sourceFeature.geometry.type} to ${generatedFeature.geometry.type}.`,
  );
  assert(
    Object.keys(generatedFeature.properties).sort().join(",") ===
      "iso_a3,name",
    `${iso} contains unexpected generated properties.`,
  );

  const sourceBounds = getBounds(sourceFeature.geometry);
  const generatedBounds = getBounds(generatedFeature.geometry);

  generatedBounds.forEach((value, index) => {
    assert(Number.isFinite(value), `${iso} has invalid generated bounds.`);
    assert(
      Math.abs(value - sourceBounds[index]) <= MAX_BOUNDS_DELTA_DEGREES,
      `${iso} bounds moved more than ${MAX_BOUNDS_DELTA_DEGREES} degrees.`,
    );
  });
}

for (const iso of SMALL_COUNTRY_CHECKS) {
  const generatedFeature = generatedById.get(iso);
  assert(generatedFeature, `Small-country fidelity check is missing ${iso}.`);
  const [minX, minY, maxX, maxY] = getBounds(generatedFeature.geometry);
  assert(maxX > minX && maxY > minY, `${iso} collapsed during conversion.`);
}

const outputStats = await stat(OUTPUT_PATH);
assert(
  outputStats.size <= MAX_OUTPUT_BYTES,
  `Generated topology is ${outputStats.size} bytes, above the ${MAX_OUTPUT_BYTES}-byte limit.`,
);

console.log(
  `Validated ${generatedDocument.features.length} countries, including ${SMALL_COUNTRY_CHECKS.length} small-country checks (${outputStats.size.toLocaleString()} bytes).`,
);
