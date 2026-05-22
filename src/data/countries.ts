import { generatedCountries } from "./countries.generated.ts";

export type QuizRegion =
  | "north-america"
  | "south-america"
  | "europe"
  | "asia"
  | "africa"
  | "oceania"
  | "world";

export type ContinentQuizRegion = Exclude<QuizRegion, "world">;

export type RegionSelectorId = QuizRegion | "antarctica";

export type CountryEducation = {
  population: number | null;
  populationYear?: number;
  gdpUsd: number | null;
  gdpYear?: number;
  languages: string[];
  nativeName?: string;
  funFact: string;
  funFacts?: string[];
  featuredImage?: {
    src: string;
    alt: string;
    credit?: string;
    sourceUrl?: string;
  };
};

export type CountryHints = {
  subregionHint?: string;
  locationHint?: string;
  neighborHint?: string;
  islandOrMainlandHint?: string;
};

export type Country = {
  iso_a3: string;
  name: string;
  acceptedNames: string[];
  continentQuizGroups: ContinentQuizRegion[];
  /** @deprecated Use continentQuizGroups for runtime quiz membership. */
  continentQuizGroup: ContinentQuizRegion;
  capital: string;
  flag: string;
  flagCode?: string;
  flagEmoji?: string;
  clickHint1?: string;
  clickHint2?: string;
  hints?: CountryHints;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  isSmall: boolean;
  allowMissingStats?: boolean;
  education: CountryEducation;
};

export type RegionConfig = {
  id: QuizRegion;
  label: string;
  timerSeconds: number;
  bounds: [[number, number], [number, number]];
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  pitch: number;
  bearing: number;
};

export type RegionSelectorConfig = {
  id: RegionSelectorId;
  label: string;
  count: number;
  enabled: boolean;
  note?: string;
};

export const countries: Country[] = generatedCountries;

export type QuizTimerMode =
  | "type-to-fill"
  | "identify-shaded"
  | "click-country"
  | "capital-challenge";

export const regionConfigs: Record<QuizRegion, RegionConfig> = {
  "north-america": {
    id: "north-america",
    label: "North America",
    timerSeconds: 360,
    bounds: [
      [-171, 5],
      [-50, 73],
    ],
    center: { lat: 27, lng: -86 },
    zoom: 2.75,
    pitch: 38,
    bearing: 8,
  },
  "south-america": {
    id: "south-america",
    label: "South America",
    timerSeconds: 240,
    bounds: [
      [-83, -57],
      [-33, 14],
    ],
    center: { lat: -17, lng: -61 },
    zoom: 3.25,
    pitch: 42,
    bearing: -10,
  },
  europe: {
    id: "europe",
    label: "Europe",
    timerSeconds: 480,
    bounds: [
      [-25, 34],
      [64, 73],
    ],
    center: { lat: 54, lng: 21 },
    zoom: 3.35,
    pitch: 36,
    bearing: 0,
  },
  asia: {
    id: "asia",
    label: "Asia",
    timerSeconds: 540,
    bounds: [
      [25, -12],
      [180, 76],
    ],
    center: { lat: 31, lng: 96 },
    zoom: 2.35,
    pitch: 34,
    bearing: 0,
  },
  africa: {
    id: "africa",
    label: "Africa",
    timerSeconds: 600,
    bounds: [
      [-31, -37],
      [66, 39],
    ],
    center: { lat: 2, lng: 22 },
    zoom: 3.2,
    pitch: 36,
    bearing: 0,
  },
  oceania: {
    id: "oceania",
    label: "Oceania",
    timerSeconds: 300,
    bounds: [
      [105, -51],
      [233, 12],
    ],
    center: { lat: -18, lng: 168 },
    zoom: 2.6,
    pitch: 32,
    bearing: 0,
  },
  world: {
    id: "world",
    label: "Whole World",
    timerSeconds: 1200,
    bounds: [
      [-170, -58],
      [190, 78],
    ],
    center: { lat: 19, lng: 8 },
    zoom: 1.65,
    pitch: 18,
    bearing: 0,
  },
};

const regionOrder: QuizRegion[] = [
  "north-america",
  "south-america",
  "europe",
  "asia",
  "africa",
  "oceania",
  "world",
];

export const getCountriesForRegion = (region: QuizRegion) =>
  region === "world"
    ? countries
    : countries.filter((country) => country.continentQuizGroups.includes(region));

export const getRegionConfig = (region: QuizRegion) => regionConfigs[region];

export const getTimerSeconds = (region: QuizRegion, mode: QuizTimerMode) => {
  if (region !== "world") {
    return regionConfigs[region].timerSeconds;
  }

  return mode === "type-to-fill" ? 15 * 60 : 20 * 60;
};

export const regionSelectorConfigs: RegionSelectorConfig[] = [
  ...regionOrder.map((region) => ({
    id: region,
    label: regionConfigs[region].label,
    count: getCountriesForRegion(region).length,
    enabled: true,
  })),
  {
    id: "antarctica",
    label: "Antarctica",
    count: 0,
    enabled: true,
    note: "Educational region",
  },
];

export const quizCountryIds = new Set(countries.map((country) => country.iso_a3));
