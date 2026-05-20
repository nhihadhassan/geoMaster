import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildGeneratedHints,
  countryOverrides,
  isSmallCountry,
  isoByCountryName,
} from "../src/data/countryOverrides.ts";
import { funFactsByIso } from "../src/data/funFacts.ts";
import { quizCountrySeeds } from "../src/data/countryQuizLists.ts";

type RestCountry = {
  name?: {
    common?: string;
    official?: string;
    nativeName?: Record<string, { common?: string; official?: string }>;
  };
  cca2?: string;
  cca3?: string;
  capital?: string[];
  languages?: Record<string, string>;
  latlng?: [number, number];
  region?: string;
  subregion?: string;
  area?: number;
};

type WorldBankDatum = {
  countryiso3code?: string;
  date?: string;
  value?: number | null;
};

type LatestIndicator = {
  value: number;
  year: number;
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatedPath = path.join(repoRoot, "src/data/countries.generated.ts");

const flag = (code: string) => `https://flagcdn.com/${code.toLowerCase()}.svg`;

const flagEmoji = (code: string) => {
  if (!/^[a-z]{2}$/i.test(code)) {
    return "";
  }

  return code
    .toUpperCase()
    .split("")
    .map((letter) =>
      String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65),
    )
    .join("");
};

const normalizeName = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const unique = (values: string[]) =>
  Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status}: ${url}`);
  }

  return response.json() as Promise<T>;
};

const fetchRestCountries = async () => {
  const fields = [
    "name",
    "cca2",
    "cca3",
    "capital",
    "languages",
    "latlng",
    "subregion",
    "region",
    "flags",
    "area",
  ].join(",");
  const countries = await fetchJson<RestCountry[]>(
    `https://restcountries.com/v3.1/all?fields=${fields}`,
  );

  return countries.reduce<Record<string, RestCountry>>((accumulator, country) => {
    if (country.cca3) {
      accumulator[country.cca3] = country;
    }

    return accumulator;
  }, {});
};

const fetchWorldBankIndicator = async (indicator: string) => {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&per_page=20000`;
  const payload = await fetchJson<[unknown, WorldBankDatum[]]>(url);
  const rows = payload[1] ?? [];

  return rows.reduce<Record<string, LatestIndicator>>((accumulator, row) => {
    const iso = row.countryiso3code;

    if (!iso || !row.value || !row.date) {
      return accumulator;
    }

    const year = Number(row.date);
    const existing = accumulator[iso];

    if (!existing || year > existing.year) {
      accumulator[iso] = {
        value: row.value,
        year,
      };
    }

    return accumulator;
  }, {});
};

const selectNativeName = (country: RestCountry, fallback: string) => {
  const nativeNames = Object.values(country.name?.nativeName ?? {});
  const firstNativeName = nativeNames.find((name) => name.common)?.common;

  return firstNativeName ?? country.name?.common ?? fallback;
};

const buildFunFact = (
  name: string,
  restCountry: RestCountry | undefined,
  capital: string,
) => {
  if (restCountry?.subregion) {
    return `${name} is part of ${restCountry.subregion}, with ${capital} as its capital.`;
  }

  if (restCountry?.region) {
    return `${name} is part of ${restCountry.region}, with ${capital} as its capital.`;
  }

  return `${name} is one of the countries included in GeoMaster's world quiz set.`;
};

const buildGeneratedCountries = async () => {
  const restCountries = await fetchRestCountries();
  const populations = await fetchWorldBankIndicator("SP.POP.TOTL");
  const gdps = await fetchWorldBankIndicator("NY.GDP.MKTP.CD");
  const groupedSeeds = new Map<
    string,
    { name: string; regions: typeof quizCountrySeeds[number]["region"][] }
  >();

  for (const seed of quizCountrySeeds) {
    const iso = isoByCountryName[seed.name];

    if (!iso) {
      throw new Error(`Missing ISO override for ${seed.name}`);
    }

    const existing = groupedSeeds.get(iso);

    if (existing) {
      if (!existing.regions.includes(seed.region)) {
        existing.regions.push(seed.region);
      }
    } else {
      groupedSeeds.set(iso, {
        name: seed.name,
        regions: [seed.region],
      });
    }
  }

  return [...groupedSeeds.entries()].map(([iso, seed]) => {
    const override = countryOverrides[iso] ?? {};
    const restCountry =
      restCountries[iso] ??
      Object.values(restCountries).find((country) => {
        const lookupName = override.apiName ?? seed.name;
        return (
          normalizeName(country.name?.common ?? "") === normalizeName(lookupName) ||
          normalizeName(country.name?.official ?? "") === normalizeName(lookupName)
        );
      });
    const wbCode = override.wbCode ?? iso;
    const population = override.education?.population
      ? {
          value: override.education.population,
          year: override.education.populationYear ?? 2024,
        }
      : populations[wbCode];
    const gdp = override.education?.gdpUsd
      ? {
          value: override.education.gdpUsd,
          year: override.education.gdpYear ?? 2024,
        }
      : gdps[wbCode];
    const capital = override.capital ?? restCountry?.capital?.[0] ?? "";
    const languages =
      override.languages ?? Object.values(restCountry?.languages ?? {});
    const flagCode = override.flagCode ?? restCountry?.cca2 ?? "";
    const isSmall =
      override.isSmall ??
      (isSmallCountry(iso) || (restCountry?.area ?? 999999) < 50000);
    const generatedHints = buildGeneratedHints(seed.name, seed.regions, iso);
    const acceptedNames = unique([
      ...(override.acceptedNames ?? []),
      restCountry?.name?.official ?? "",
    ]);
    const center =
      override.center ??
      (restCountry?.latlng
        ? { lat: restCountry.latlng[0], lng: restCountry.latlng[1] }
        : { lat: 0, lng: 0 });
    const funFactSource =
      funFactsByIso[iso] ?? buildFunFact(seed.name, restCountry, capital || "its capital");
    const funFacts = Array.isArray(funFactSource) ? funFactSource : [funFactSource];
    const [funFact] = funFacts;

    return {
      iso_a3: iso,
      name: seed.name,
      acceptedNames,
      continentQuizGroups: seed.regions,
      continentQuizGroup: seed.regions[0],
      capital,
      flag: flagCode ? flag(flagCode) : "",
      flagCode: flagCode ? flagCode.toLowerCase() : undefined,
      flagEmoji: flagEmoji(flagCode),
      clickHint1: override.clickHint1 ?? generatedHints.clickHint1,
      clickHint2: override.clickHint2 ?? generatedHints.clickHint2,
      hints: generatedHints.hints,
      center,
      zoom: isSmall ? 7.5 : 4.6,
      isSmall,
      allowMissingStats: override.allowMissingStats ?? false,
      education: {
        population: population?.value ?? null,
        populationYear: population?.year,
        gdpUsd: gdp?.value ?? null,
        gdpYear: gdp?.year,
        languages,
        nativeName: override.nativeName ?? (restCountry ? selectNativeName(restCountry, seed.name) : seed.name),
        funFact,
        funFacts: funFacts.length > 1 ? funFacts : undefined,
      },
    };
  });
};

const main = async () => {
  const countries = await buildGeneratedCountries();
  const contents = `// This file is generated by scripts/generate-country-data.ts. Do not edit by hand.
import type { Country } from "./countries";

export const generatedCountries = ${JSON.stringify(countries, null, 2)} satisfies Country[];
`;

  await writeFile(generatedPath, contents);
  console.log(`Generated ${countries.length} countries at ${generatedPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
