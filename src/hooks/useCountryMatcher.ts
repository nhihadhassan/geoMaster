"use client";

import { useMemo } from "react";
import type { Country } from "@/data/countries";
import { createCountryMatcher } from "@/utils/countryMatcher";

export function useCountryMatcher(
  countries: Country[],
  guessedCountryIds: string[],
) {
  const availableCountries = useMemo(
    () =>
      countries.filter(
        (country) => !guessedCountryIds.includes(country.iso_a3),
      ),
    [countries, guessedCountryIds],
  );

  return useMemo(
    () => createCountryMatcher(availableCountries),
    [availableCountries],
  );
}
