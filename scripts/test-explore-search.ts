// Explore search: that each dataset is reachable and that ranking puts the
// place you named above places that merely mention it.
import { assert, assertEqual, runTests, test } from "./test-harness.ts";

const { searchExplore } = await import("../src/utils/exploreSearch.ts");

const namesFor = (query: string) =>
  searchExplore(query).map((result) => result.name);

test("a country is found by name, alias, and capital", () => {
  assertEqual(namesFor("brazil")[0], "Brazil", "exact name");
  assertEqual(namesFor("brasil")[0], "Brazil", "accepted alternate name");
  assertEqual(namesFor("lima")[0], "Peru", "capital city name");
});

test("every learning dataset is reachable", () => {
  const kindFor = (query: string) => searchExplore(query)[0]?.kindLabel;

  assertEqual(kindFor("peru"), "Country", "countries");
  assertEqual(kindFor("ontario"), "Province", "subdivisions");
  assertEqual(kindFor("toronto"), "City", "cities");
  assertEqual(kindFor("cn tower"), "Tower", "landmarks");
  assertEqual(kindFor("sahara"), "Desert", "physical features");
});

test("a place outranks places that merely reference it", () => {
  // Toronto is Ontario's capital, so the province matches "toronto" too.
  assertEqual(
    namesFor("toronto")[0],
    "Toronto",
    "the city should win over the province it is the capital of",
  );
});

test("very short queries return nothing", () => {
  assertEqual(searchExplore("p").length, 0, "one character is too ambiguous");
  assertEqual(searchExplore("").length, 0, "an empty query returns nothing");
});

test("results are capped", () => {
  assert(searchExplore("an", 5).length <= 5, "the explicit limit is respected");
  assert(searchExplore("an").length <= 8, "the default limit keeps it short");
});

await runTests("Explore search checks");
