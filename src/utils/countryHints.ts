import type { Country, QuizRegion } from "@/data/countries";

const normalizeHint = (hint: string) =>
  hint
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isWeakClickHint = (country: Country, hint?: string) => {
  if (!hint) {
    return true;
  }

  const normalized = normalizeHint(hint);
  const countryName = normalizeHint(country.name);

  return (
    normalized.length < 12 ||
    normalized === "it is on the mainland" ||
    normalized === "it is a small or island country" ||
    normalized === "it is a pacific island country" ||
    /^it is in (north america|south america|europe|asia|africa|oceania)( and (north america|south america|europe|asia|africa|oceania))*$/.test(
      normalized,
    ) ||
    normalized.includes(`look for ${countryName} within`)
  );
};

const uniqueHints = (hints: string[]) => {
  const seen = new Set<string>();

  return hints.filter((hint) => {
    const normalized = normalizeHint(hint);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const identifySecondHint = (country: Country, capitalHintEnabled: boolean) =>
  capitalHintEnabled
    ? `Starts with ${country.name.charAt(0).toUpperCase()}, ends with ${country.name.charAt(country.name.length - 1).toUpperCase()}`
    : `Capital: ${country.capital}`;

export const getIdentifyHints = (
  country: Country,
  attempts: number,
  capitalHintEnabled: boolean,
) => {
  if (attempts <= 0) {
    return [];
  }

  return uniqueHints([
    `Starts with ${country.name.charAt(0).toUpperCase()}`,
    ...(attempts >= 2 ? [identifySecondHint(country, capitalHintEnabled)] : []),
  ]);
};

const clickHintOverrides: Record<string, [string, string]> = {
  AND: ["It is a microstate in the Pyrenees.", "Look between Spain and France."],
  ARE: ["It is on the Arabian Peninsula.", "Look along the Persian Gulf near Oman."],
  ATG: ["It is in the Caribbean.", "Look in the Lesser Antilles, east of Puerto Rico."],
  BHR: ["It is in the Persian Gulf.", "Look for a tiny island country near Qatar and Saudi Arabia."],
  BHS: ["It is in the Caribbean region.", "Look north of Cuba and east of Florida."],
  BLZ: ["It is in Central America.", "Look on the Caribbean coast south of Mexico."],
  BRB: ["It is in the Caribbean.", "Look east of the Lesser Antilles island chain."],
  BRN: ["It is in Southeast Asia.", "Look on the island of Borneo."],
  CPV: ["It is an Atlantic island country.", "Look west of Senegal off Africa's coast."],
  COM: ["It is an island country in the Indian Ocean.", "Look between Mozambique and Madagascar."],
  CRI: ["It is in Central America.", "Look between Nicaragua and Panama."],
  CUB: ["It is in the Caribbean.", "Look for the long island south of Florida."],
  DMA: ["It is in the Caribbean.", "Look in the Lesser Antilles between Guadeloupe and Martinique."],
  DOM: ["It is in the Caribbean.", "Look on the eastern side of Hispaniola."],
  GMB: ["It is in West Africa.", "Look for the narrow country surrounded by Senegal."],
  GRD: ["It is in the Caribbean.", "Look near the southern end of the Lesser Antilles."],
  GTM: ["It is in Central America.", "Look south of Mexico and west of Belize."],
  HTI: ["It is in the Caribbean.", "Look on the western side of Hispaniola."],
  HND: ["It is in Central America.", "Look east of Guatemala and north of Nicaragua."],
  JAM: ["It is in the Caribbean.", "Look south of Cuba."],
  KIR: ["It is a Pacific island country.", "Look for islands spread across the central Pacific."],
  KNA: ["It is in the Caribbean.", "Look in the northern Lesser Antilles."],
  KWT: ["It is in the Persian Gulf.", "Look at the northern end of the Gulf near Iraq."],
  LBN: ["It is on the eastern Mediterranean.", "Look north of Palestine and west of Syria."],
  LCA: ["It is in the Caribbean.", "Look in the Lesser Antilles, south of Martinique."],
  LIE: ["It is a European microstate.", "Look between Switzerland and Austria."],
  LSO: ["It is in southern Africa.", "Look for the enclave entirely inside South Africa."],
  MCO: ["It is a European microstate.", "Look on the Mediterranean coast near southeastern France."],
  MDV: ["It is an Indian Ocean island country.", "Look southwest of India and Sri Lanka."],
  MHL: ["It is a Pacific island country.", "Look in Micronesia, north of Kiribati."],
  MLT: ["It is a Mediterranean island country.", "Look south of Sicily."],
  MUS: ["It is an Indian Ocean island country.", "Look east of Madagascar."],
  NIC: ["It is in Central America.", "Look between Honduras and Costa Rica."],
  NRU: ["It is a tiny Pacific island country.", "Look just south of the equator in Micronesia."],
  PAN: ["It is in Central America.", "Look at the land bridge connecting Central and South America."],
  PLW: ["It is a Pacific island country.", "Look east of the Philippines."],
  PSE: ["It is in the eastern Mediterranean.", "Look along the coast and inland near Jordan."],
  QAT: ["It is in the Persian Gulf.", "Look for the small peninsula east of Bahrain."],
  SGP: ["It is in Southeast Asia.", "Look at the southern tip of the Malay Peninsula."],
  SLB: ["It is a Pacific island country.", "Look east of Papua New Guinea."],
  SLV: ["It is in Central America.", "Look on the Pacific coast between Guatemala and Honduras."],
  SMR: ["It is a European microstate.", "Look inside northeastern Italy."],
  STP: ["It is an Atlantic island country.", "Look in the Gulf of Guinea west of central Africa."],
  SWZ: ["It is in southern Africa.", "Look between South Africa and Mozambique."],
  SYC: ["It is an Indian Ocean island country.", "Look northeast of Madagascar."],
  TON: ["It is a Pacific island country.", "Look in Polynesia east of Fiji."],
  TTO: ["It is in the southern Caribbean.", "Look just off the coast of Venezuela."],
  TUV: ["It is a Pacific island country.", "Look north of Fiji in Polynesia."],
  VAT: ["It is a European microstate.", "Look inside the city of Rome."],
  VCT: ["It is in the Caribbean.", "Look in the Lesser Antilles, north of Grenada."],
  VUT: ["It is a Pacific island country.", "Look east of Australia and west of Fiji."],
  WSM: ["It is a Pacific island country.", "Look in Polynesia, west of American Samoa."],
};

const regionLocationHint = (country: Country, selectedRegion: QuizRegion) => {
  const { lat, lng } = country.center;

  switch (selectedRegion) {
    case "south-america":
      if (lat > 4) return "It is in northern South America.";
      if (lat < -30) return "It is in southern South America.";
      if (lng < -70) return "It is along western South America.";
      if (lng > -55) return "It is in eastern South America.";
      return "It is in central South America.";
    case "north-america":
      if (country.isSmall || (lat < 24 && lng > -86)) return "It is in the Caribbean or Central America.";
      if (lat < 18) return "It is in Central America.";
      if (lat > 45) return "It is in northern North America.";
      return "It is in mainland North America.";
    case "europe":
      if (lat > 57) return "It is in northern Europe.";
      if (lng < -2) return "It is in western Europe.";
      if (lng > 25) return "It is in eastern Europe.";
      if (lat < 43) return "It is in southern Europe.";
      return "It is in central Europe.";
    case "asia":
      if (lng < 60 && lat < 35) return "It is in Western Asia.";
      if (lng >= 60 && lng < 90 && lat > 25) return "It is in Central or South Asia.";
      if (lng >= 90 && lat < 25) return "It is in Southeast Asia.";
      if (lng >= 100 && lat >= 25) return "It is in East Asia.";
      if (lat < 10) return "It is in island Southeast Asia or the Indian Ocean.";
      return "It is in Asia.";
    case "africa":
      if (lat > 20) return "It is in North Africa.";
      if (lng < 5) return "It is in West Africa.";
      if (lng > 35) return "It is in East Africa or the Indian Ocean.";
      if (lat < -15) return "It is in southern Africa.";
      return "It is in central Africa.";
    case "oceania":
      if (country.iso_a3 === "AUS") return "It is the largest country in Oceania.";
      if (country.iso_a3 === "NZL") return "It is southeast of Australia.";
      if (lng < 160) return "It is in the western Pacific.";
      if (lng > 180 || lng < -170) return "It is in the central Pacific.";
      return "It is in the South Pacific.";
  }
};

const strongerLocationHint = (country: Country, selectedRegion: QuizRegion) => {
  const { lat, lng } = country.center;

  if (country.isSmall) {
    if (selectedRegion === "oceania") return "Look for a small island country rather than a large landmass.";
    if (selectedRegion === "north-america") return "Use the island clusters and inset area to narrow it down.";
    return "Look for one of the smaller countries or island markers.";
  }

  switch (selectedRegion) {
    case "south-america":
      if (lng < -70) return "It lies on or near the Pacific side of the continent.";
      if (lng > -55) return "It lies closer to the Atlantic side of the continent.";
      return "It is inland, away from the continent's outer coasts.";
    case "north-america":
      if (lat > 40) return "Look north of Mexico and the Caribbean.";
      if (lng < -100) return "Look toward the western side of the region.";
      return "Look around Central America, Mexico, or the Caribbean coast.";
    case "europe":
      if (lat > 57) return "Look near the Nordic or Baltic part of Europe.";
      if (lat < 43) return "Look around the Mediterranean side of Europe.";
      return "Look between western and eastern Europe.";
    case "asia":
      if (lng < 60) return "Look around the Middle East or Caucasus area.";
      if (lng < 90) return "Look between Central Asia and the Indian subcontinent.";
      if (lng < 115) return "Look around Southeast Asia or southern China.";
      return "Look toward East Asia or the western Pacific.";
    case "africa":
      if (lat > 20) return "Look along the Mediterranean or Sahara region.";
      if (lat < -15) return "Look below central Africa.";
      if (lng < 5) return "Look near the Atlantic side of Africa.";
      return "Look toward Africa's eastern side.";
    case "oceania":
      return "Use the Pacific island guide circles to narrow the area.";
  }
};

export const getClickCountryHints = (
  country: Country,
  attempts: number,
  selectedRegion: QuizRegion,
) => {
  if (attempts <= 0) {
    return [];
  }

  const override = clickHintOverrides[country.iso_a3];
  const firstHint =
    override?.[0] ??
    (!isWeakClickHint(country, country.hints?.subregionHint)
      ? country.hints?.subregionHint
      : regionLocationHint(country, selectedRegion));
  const secondHint =
    override?.[1] ??
    (!isWeakClickHint(country, country.hints?.neighborHint)
      ? country.hints?.neighborHint
      : !isWeakClickHint(country, country.hints?.locationHint)
        ? country.hints?.locationHint
        : !isWeakClickHint(country, country.hints?.islandOrMainlandHint)
          ? country.hints?.islandOrMainlandHint
          : strongerLocationHint(country, selectedRegion));

  return uniqueHints([
    firstHint,
    ...(attempts >= 2 ? [secondHint] : []),
  ]).slice(0, Math.min(attempts, 2));
};
