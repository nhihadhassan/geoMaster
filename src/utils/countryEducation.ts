import type { Country } from "@/data/countries";
import { featuredCountryImages } from "@/data/featuredCountryImages";

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

export const getCountryFunFacts = (country: Country) => {
  const facts = [
    country.education.funFact,
    ...(country.education.funFacts ?? []),
  ];

  return Array.from(
    new Set(facts.map((fact) => fact.trim()).filter(Boolean)),
  );
};

export const formatCountryEducation = (country: Country) => {
  const { education } = country;
  const population = formatPopulation(education.population);
  const gdp = formatGDP(education.gdpUsd);
  const languages = formatLanguages(education.languages);
  const funFacts = getCountryFunFacts(country);

  return {
    stats: [
      population ? { label: "Population", value: population } : null,
      gdp ? { label: "GDP", value: gdp } : null,
      languages ? { label: "Languages", value: languages } : null,
      education.nativeName
        ? { label: "Native name", value: education.nativeName }
        : null,
    ].filter((row): row is { label: string; value: string } => Boolean(row)),
    funFact: funFacts[0] ?? education.funFact,
    funFacts,
    featuredFunFact: funFacts[0] ?? education.funFact,
    featuredImage: education.featuredImage ?? featuredCountryImages[country.iso_a3],
    sourceYear: education.populationYear ?? education.gdpYear,
  };
};
