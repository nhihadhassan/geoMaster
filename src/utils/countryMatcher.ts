import type { Country } from "@/data/countries";

export type CountryMatch = {
  country: Country;
  matchedBy: "exact" | "alias" | "fuzzy";
  score?: number;
};

export const normalizeCountryText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\band\b/g, "")
    .replace(/[^a-z0-9]/g, "");

const candidateNamesFor = (country: Country) => [
  country.name,
  ...country.acceptedNames,
];

const editDistance = (a: string, b: string) => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    table[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    table[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitutionCost = a[row - 1] === b[col - 1] ? 0 : 1;
      const deletion = table[row - 1][col] + 1;
      const insertion = table[row][col - 1] + 1;
      const substitution = table[row - 1][col - 1] + substitutionCost;
      let distance = Math.min(deletion, insertion, substitution);

      if (
        row > 1 &&
        col > 1 &&
        a[row - 1] === b[col - 2] &&
        a[row - 2] === b[col - 1]
      ) {
        distance = Math.min(distance, table[row - 2][col - 2] + 1);
      }

      table[row][col] = distance;
    }
  }

  return table[a.length][b.length];
};

const isIncompletePrefix = (input: string, candidate: string) =>
  input.length < candidate.length && candidate.startsWith(input);

const canUseFuzzyMatch = (input: string, candidate: string) => {
  if (input.length < 5 || candidate.length < 5) {
    return null;
  }

  if (isIncompletePrefix(input, candidate) || isIncompletePrefix(candidate, input)) {
    return null;
  }

  const maxDistance = Math.min(input.length, candidate.length) >= 12 ? 2 : 1;

  if (Math.abs(input.length - candidate.length) > maxDistance) {
    return null;
  }

  const distance = editDistance(input, candidate);

  return distance > 0 && distance <= maxDistance ? distance : null;
};

export const findCountryMatch = (
  input: string,
  countries: Country[],
): CountryMatch | null => {
  const query = input.trim();

  if (query.length < 2) {
    return null;
  }

  const normalizedQuery = normalizeCountryText(query);

  for (const country of countries) {
    if (normalizeCountryText(country.name) === normalizedQuery) {
      return { country, matchedBy: "exact" };
    }

    if (
      country.acceptedNames.some(
        (alias) => normalizeCountryText(alias) === normalizedQuery,
      )
    ) {
      return { country, matchedBy: "alias" };
    }
  }

  const fuzzyMatches = countries.flatMap((country) =>
    candidateNamesFor(country)
      .map(normalizeCountryText)
      .map((candidate) => ({
        country,
        distance: canUseFuzzyMatch(normalizedQuery, candidate),
      }))
      .filter(
        (match): match is { country: Country; distance: number } =>
          match.distance !== null,
      ),
  );

  if (fuzzyMatches.length > 0) {
    const bestDistance = Math.min(
      ...fuzzyMatches.map((match) => match.distance),
    );
    const bestCountries = new Map(
      fuzzyMatches
        .filter((match) => match.distance === bestDistance)
        .map((match) => [match.country.iso_a3, match.country]),
    );

    if (bestCountries.size === 1) {
      const [country] = bestCountries.values();

      return { country, matchedBy: "fuzzy", score: bestDistance };
    }
  }

  return null;
};

export const createCountryMatcher = (countries: Country[]) => (input: string) =>
  findCountryMatch(input, countries)?.country ?? null;
