import { countries } from "../src/data/countries.ts";
import { findCountryMatch } from "../src/utils/countryMatcher.ts";

const cases: Array<[string, string | null]> = [
  ["Brazil", "BRA"],
  ["Brasil", "BRA"],
  ["Brazl", "BRA"],
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
  ["Antigua", "ATG"],
  ["St Kitts", "KNA"],
  ["St Vincent", "VCT"],
  ["Vatican", "VAT"],
  ["Czech Republic", "CZE"],
  ["Bosnia", "BIH"],
  ["Macedonia", "MKD"],
  ["Central African Republic", "CAF"],
  ["CAR", "CAF"],
  ["CARS", null],
  ["UK", "GBR"],
  ["Sao Tome", "STP"],
  ["Ivory Coast", "CIV"],
  ["DRC", "COD"],
  ["Congo Brazzaville", "COG"],
  ["Cape Verde", "CPV"],
  ["Swaziland", "SWZ"],
  ["UAE", "ARE"],
  ["DPRK", "PRK"],
  ["Burma", "MMR"],
  ["East Timor", "TLS"],
  ["PNG", "PNG"],
  ["NZ", "NZL"],
  ["Liechtenstien", "LIE"],
  ["Kyrgystan", "KGZ"],
  ["Turkmenstan", "TKM"],
  ["Tajikstan", "TJK"],
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
