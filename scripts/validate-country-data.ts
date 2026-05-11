import worldCountries from "../src/data/world-countries.geo.json" with { type: "json" };
import { countries, type QuizRegion } from "../src/data/countries.ts";
import {
  expectedRegionCounts,
  expectedRegionMembershipCount,
  expectedUniqueCountryCount,
  quizCountrySeeds,
} from "../src/data/countryQuizLists.ts";
import { labelPlacements } from "../src/data/labelPlacements.ts";
import { smallCountryGuides } from "../src/data/smallCountryGuides.ts";
import { findCountryMatch, normalizeCountryText } from "../src/utils/countryMatcher.ts";

type WorldFeature = {
  properties?: Record<string, unknown>;
};

const fail = (message: string, details?: unknown) => {
  console.error(`\nCountry validation failed: ${message}`);
  if (details) {
    console.error(details);
  }
  process.exit(1);
};

const warn = (message: string, details?: unknown) => {
  console.warn(`Country validation warning: ${message}`);
  if (details) {
    console.warn(details);
  }
};

const asString = (value: unknown) =>
  typeof value === "string" && value !== "-99" ? value : null;

const getFeatureIso = (feature: WorldFeature) => {
  const properties = feature.properties ?? {};

  return (
    asString(properties.iso_a3) ??
    asString(properties.ISO_A3) ??
    asString(properties.ADM0_A3) ??
    asString(properties.adm0_a3) ??
    asString(properties.WB_A3) ??
    asString(properties.SOV_A3)
  );
};

const features = (worldCountries as { features: WorldFeature[] }).features;
const geometryIsoSet = new Set(
  features.map(getFeatureIso).filter((iso): iso is string => Boolean(iso)),
);

const names = new Set<string>();
const isos = new Set<string>();
const errors: string[] = [];
const warnings: string[] = [];

if (countries.length !== expectedUniqueCountryCount) {
  errors.push(
    `Expected ${expectedUniqueCountryCount} unique countries, found ${countries.length}.`,
  );
}

const seedNames = new Set(quizCountrySeeds.map((seed) => seed.name));
const dataNames = new Set(countries.map((country) => country.name));
const regionMembershipTotal = countries.reduce(
  (total, country) => total + country.continentQuizGroups.length,
  0,
);
const uniqueSeedNames = new Set(quizCountrySeeds.map((seed) => seed.name));
const missingFromData = [...uniqueSeedNames].filter((name) => !dataNames.has(name));
const extraInData = [...dataNames].filter((name) => !seedNames.has(name));

if (missingFromData.length || extraInData.length) {
  errors.push(
    `Generated data does not match canonical quiz list. Missing: ${missingFromData.join(", ") || "none"}. Extra: ${extraInData.join(", ") || "none"}.`,
  );
}

if (regionMembershipTotal !== expectedRegionMembershipCount) {
  errors.push(
    `Expected ${expectedRegionMembershipCount} quiz-region memberships, found ${regionMembershipTotal}.`,
  );
}

for (const [region, expectedCount] of Object.entries(expectedRegionCounts) as [
  QuizRegion,
  number,
][]) {
  const count = countries.filter(
    (country) => country.continentQuizGroups.includes(region),
  ).length;

  if (count !== expectedCount) {
    errors.push(`${region} expected ${expectedCount}, found ${count}.`);
  }

  const seenInRegion = new Set<string>();
  for (const country of countries.filter((country) =>
    country.continentQuizGroups.includes(region),
  )) {
    if (seenInRegion.has(country.iso_a3)) {
      errors.push(`${region} contains duplicate ISO_A3 ${country.iso_a3}.`);
    }
    seenInRegion.add(country.iso_a3);
  }
}

const israel = countries.find((country) => country.iso_a3 === "ISR");
if (israel) {
  errors.push("Israel must not appear in the active quiz country data.");
}

const palestine = countries.find((country) => country.iso_a3 === "PSE");
if (!palestine) {
  errors.push("Palestine is missing from the active quiz country data.");
} else {
  if (palestine.name !== "Palestine") {
    errors.push(`Palestine display name must be "Palestine", got "${palestine.name}".`);
  }
  if (!palestine.continentQuizGroups.includes("asia")) {
    errors.push("Palestine must be included in the Asia quiz.");
  }
}

for (const iso of ["RUS", "TUR"]) {
  const country = countries.find((item) => item.iso_a3 === iso);

  if (!country) {
    errors.push(`${iso} is missing from the active quiz country data.`);
  } else if (
    !country.continentQuizGroups.includes("europe") ||
    !country.continentQuizGroups.includes("asia")
  ) {
    errors.push(`${country.name} must be included in both Europe and Asia.`);
  }
}

for (const country of countries) {
  if (names.has(country.name)) {
    errors.push(`Duplicate country name: ${country.name}`);
  }
  names.add(country.name);

  if (isos.has(country.iso_a3)) {
    errors.push(`Duplicate ISO_A3: ${country.iso_a3}`);
  }
  isos.add(country.iso_a3);

  if (!/^[A-Z]{3}$/.test(country.iso_a3)) {
    errors.push(`${country.name} has invalid ISO_A3 ${country.iso_a3}.`);
  }

  if (!country.continentQuizGroups?.length) {
    errors.push(`${country.name} is missing continentQuizGroups.`);
  }

  if (!country.capital) {
    errors.push(`${country.name} is missing a capital.`);
  }

  if (!country.flag) {
    errors.push(`${country.name} is missing a flag URL.`);
  }

  if (!country.flag && !country.flagEmoji && !country.flagCode) {
    errors.push(`${country.name} is missing both flag URL and fallback flag data.`);
  }

  if (!country.acceptedNames) {
    errors.push(`${country.name} is missing acceptedNames.`);
  }

  if (!Number.isFinite(country.center.lat) || !Number.isFinite(country.center.lng)) {
    errors.push(`${country.name} has invalid center coordinates.`);
  }

  if (!country.education) {
    errors.push(`${country.name} is missing education data.`);
    continue;
  }

  if (!country.education.languages.length) {
    errors.push(`${country.name} is missing languages.`);
  }

  if (!country.education.funFact) {
    errors.push(`${country.name} is missing a fun fact.`);
  }

  if (
    !country.allowMissingStats &&
    (country.education.population === null || country.education.gdpUsd === null)
  ) {
    errors.push(`${country.name} is missing population or GDP without an override.`);
  }

  if (!geometryIsoSet.has(country.iso_a3)) {
    errors.push(`${country.name} (${country.iso_a3}) does not match map geometry.`);
  }

  const placement = labelPlacements[country.iso_a3]?.main;

  if (!placement) {
    if (country.isSmall) {
      warnings.push(`${country.name} (${country.iso_a3}) is small and uses fallback label placement.`);
    }

    if (country.continentQuizGroups.includes("oceania") && country.center.lng < 0) {
      warnings.push(`${country.name} (${country.iso_a3}) needs wrapped Oceania fallback label longitude.`);
    }
  } else if (country.isSmall && !placement.leaderAnchorCoord) {
    warnings.push(`${country.name} (${country.iso_a3}) has manual label placement without a leader line.`);
  }
}

if (dataNames.has("French Guiana")) {
  errors.push("French Guiana must not be included in the sovereign-country quiz.");
}

const requiredGuideCountries = [
  "VAT",
  "SMR",
  "MCO",
  "LIE",
  "AND",
  "MLT",
  "SYC",
  "COM",
  "MUS",
  "STP",
  "CPV",
  "GMB",
  "SWZ",
  "LSO",
  "MDV",
  "SGP",
  "BHR",
  "BRN",
  "QAT",
  "KWT",
  "LBN",
  "PSE",
  "KIR",
  "TUV",
  "NRU",
  "MHL",
  "FSM",
  "PLW",
  "WSM",
  "TON",
  "VUT",
  "FJI",
  "SLB",
];

const missingGuides = requiredGuideCountries.filter(
  (iso) => !smallCountryGuides[iso],
);

if (missingGuides.length) {
  errors.push(`Missing small-country guide metadata for: ${missingGuides.join(", ")}.`);
}

const aliasMap = new Map<string, string>();
for (const country of countries) {
  for (const value of [country.name, ...country.acceptedNames]) {
    const normalized = normalizeCountryText(value);
    const existing = aliasMap.get(normalized);

    if (existing && existing !== country.iso_a3) {
      errors.push(`Alias collision: "${value}" maps to ${existing} and ${country.iso_a3}.`);
    }

    aliasMap.set(normalized, country.iso_a3);
  }
}

const matcherSmokeTests = [
  ["Brazil", "BRA"],
  ["Brasil", "BRA"],
  ["Brazi", null],
  ["Canada", "CAN"],
  ["Canad", null],
  ["Mexico", "MEX"],
  ["Mexic", null],
  ["USA", "USA"],
  ["US", "USA"],
  ["America", null],
  ["United Kingdom", "GBR"],
  ["UK", "GBR"],
  ["Ivory Coast", "CIV"],
  ["DRC", "COD"],
  ["Congo Brazzaville", "COG"],
  ["Vatican", "VAT"],
  ["UK", "GBR"],
  ["Sao Tome", "STP"],
  ["UAE", "ARE"],
  ["DPRK", "PRK"],
  ["East Timor", "TLS"],
  ["PNG", "PNG"],
  ["Liechtenstien", "LIE"],
  ["Bosnia Herzegovina", "BIH"],
] as const;

for (const [input, expectedIso] of matcherSmokeTests) {
  const actualIso = findCountryMatch(input, countries)?.country.iso_a3 ?? null;

  if (actualIso !== expectedIso) {
    errors.push(`Matcher smoke test failed for "${input}": expected ${expectedIso}, got ${actualIso}.`);
  }
}

if (errors.length) {
  fail(errors.join("\n"));
}

if (warnings.length) {
  warn(`${warnings.length} label-placement follow-ups detected.`, warnings.slice(0, 40));
}

console.log(`Country validation passed: ${countries.length} countries, ${geometryIsoSet.size} map features.`);
