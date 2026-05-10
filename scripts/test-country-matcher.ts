import { countries } from "../src/data/countries";
import { findCountryMatch } from "../src/utils/countryMatcher";

const cases: Array<[string, string | null]> = [
  ["Brazil", "BRA"],
  ["Brasil", "BRA"],
  ["Brazl", null],
  ["Brazi", null],
  ["Canada", "CAN"],
  ["Canad", null],
  ["Mexico", "MEX"],
  ["Mexcio", "MEX"],
  ["Mexic", null],
  ["United States", "USA"],
  ["USA", "USA"],
  ["US", "USA"],
  ["America", null],
  ["St Lucia", "LCA"],
  ["Trinidad", "TTO"],
];

const failures = cases
  .map(([input, expected]) => {
    const actual = findCountryMatch(input, countries)?.country.iso_a3 ?? null;

    return actual === expected ? null : { input, expected, actual };
  })
  .filter(Boolean);

if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`Matcher checks passed (${cases.length} cases).`);
