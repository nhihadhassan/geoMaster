import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { topology } from "topojson-server";

type RawCountryProperties = Record<string, unknown>;
type CountryProperties = {
  iso_a3: string;
  name: string;
};

const SOURCE_PATH = resolve("src/data/world-countries.geo.json");
const OUTPUT_PATH = resolve("public/data/world-countries.topo.json");
const QUANTIZATION = 1_000_000;

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
): Feature<Geometry, CountryProperties> | null => {
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
    type: "Feature",
    id: iso,
    properties: { iso_a3: iso, name },
    geometry: feature.geometry,
  };
};

const source = JSON.parse(
  await readFile(SOURCE_PATH, "utf8"),
) as FeatureCollection<Geometry, RawCountryProperties>;
const features = source.features
  .map(normalizeFeature)
  .filter(
    (feature): feature is Feature<Geometry, CountryProperties> =>
      feature !== null,
  );
const normalized: FeatureCollection<Geometry, CountryProperties> = {
  type: "FeatureCollection",
  features,
};
const generated = topology({ countries: normalized }, QUANTIZATION);

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(generated)}\n`, "utf8");

console.log(
  `Generated ${features.length} country features at ${OUTPUT_PATH} with ${QUANTIZATION.toLocaleString()}-step quantization.`,
);
