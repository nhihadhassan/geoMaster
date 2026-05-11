import type { Country } from "@/data/countries";

const compactFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const trimTrailingDecimal = (value: string) => value.replace(/\.0$/, "");

export const formatPopulation = (value: number | null) => {
  if (value === null) {
    return null;
  }

  if (value >= 1_000_000_000) {
    return `${trimTrailingDecimal(compactFormatter.format(value / 1_000_000_000))}B`;
  }

  if (value >= 1_000_000) {
    return `${trimTrailingDecimal(compactFormatter.format(value / 1_000_000))}M`;
  }

  if (value >= 1_000) {
    return `${trimTrailingDecimal(compactFormatter.format(value / 1_000))}K`;
  }

  return compactFormatter.format(value);
};

export const formatGDP = (value: number | null) => {
  if (value === null) {
    return null;
  }

  if (value >= 1_000_000_000_000) {
    return `$${trimTrailingDecimal(compactFormatter.format(value / 1_000_000_000_000))}T`;
  }

  if (value >= 1_000_000_000) {
    return `$${trimTrailingDecimal(compactFormatter.format(value / 1_000_000_000))}B`;
  }

  if (value >= 1_000_000) {
    return `$${trimTrailingDecimal(compactFormatter.format(value / 1_000_000))}M`;
  }

  return `$${compactFormatter.format(value)}`;
};

export const formatLanguages = (languages: string[]) => languages.join(", ");

export const formatCountryEducation = (country: Country) => {
  const { education } = country;
  const population = formatPopulation(education.population);
  const gdp = formatGDP(education.gdpUsd);
  const languages = formatLanguages(education.languages);

  return {
    stats: [
      population ? { label: "Population", value: population } : null,
      gdp ? { label: "GDP", value: gdp } : null,
      languages ? { label: "Languages", value: languages } : null,
      education.nativeName
        ? { label: "Native name", value: education.nativeName }
        : null,
    ].filter((row): row is { label: string; value: string } => Boolean(row)),
    funFact: education.funFact,
    sourceYear: education.populationYear ?? education.gdpYear,
  };
};
