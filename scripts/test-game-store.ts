// High-value quiz-engine flows: starting, answering, hints, the 3-attempt miss,
// completion, the deadline-based timer (including a simulated background jump),
// custom rosters, and the save/resume round trip.
import {
  assert,
  assertEqual,
  installMemoryStorage,
  runTests,
  test,
} from "./test-harness.ts";

installMemoryStorage();

const { useGameStore } = await import("../src/store/gameStore.ts");
const { readQuizProgress } = await import("../src/store/quizPersistence.ts");
const { getCountriesForRegion } = await import("../src/data/countries.ts");

const store = () => useGameStore.getState();

const resetToRegion = (region: Parameters<typeof getCountriesForRegion>[0]) => {
  localStorage.clear();
  store().backToRegionSelect();
  store().selectRegion(region);
};

test("a type-to-fill run starts, scores, and completes", () => {
  resetToRegion("south-america");
  store().selectMode("type-to-fill");
  store().startQuiz();

  assertEqual(store().gameStatus, "running", "quiz should be running");
  assert(store().deadlineAt !== null, "a timed run should arm a deadline");

  const countries = store().quizCountries;

  assertEqual(countries.length, 12, "South America should have 12 countries");

  countries.forEach((country) => store().submitTypeGuess(country));

  assertEqual(store().gameStatus, "completed", "run should complete");
  assertEqual(store().score, 12, "every country should score");
  assertEqual(store().isPerfectRun, true, "a clean sweep is a perfect run");
});

test("a guess outside the roster, or a repeat, is rejected", () => {
  resetToRegion("south-america");
  store().selectMode("type-to-fill");
  store().startQuiz();

  const [first] = store().quizCountries;
  const outsider = getCountriesForRegion("europe")[0];

  assertEqual(
    store().submitTypeGuess(outsider),
    "out-of-quiz",
    "a country outside the roster should be classified",
  );
  assertEqual(store().submitTypeGuess(first), "accepted", "first guess counts");
  assertEqual(
    store().submitTypeGuess(first),
    "duplicate",
    "the same country should not score twice",
  );
  assertEqual(store().score, 1, "score should count unique guesses only");
});

test("identify mode escalates hints and misses after three attempts", () => {
  resetToRegion("south-america");
  store().selectMode("identify-shaded");
  store().startQuiz();

  const target = store().currentTargetCountry;

  assert(target !== null, "identify mode should pick a target");

  const wrong = store().quizCountries.find(
    (country) => country.iso_a3 !== target?.iso_a3,
  );

  assert(wrong !== undefined, "a wrong answer should exist");

  const first = store().submitIdentifyGuess(wrong ?? null);

  assertEqual(first.outcome, "wrong", "first wrong guess is wrong");
  assertEqual(
    store().currentTargetHints.length,
    1,
    "one hint after one wrong attempt",
  );

  store().submitIdentifyGuess(wrong ?? null);

  assertEqual(
    store().currentTargetHints.length,
    2,
    "hints escalate on the second attempt",
  );

  const third = store().submitIdentifyGuess(wrong ?? null);

  assertEqual(third.outcome, "missed", "third wrong attempt misses");
  assertEqual(
    store().countryResults[target?.iso_a3 ?? ""].status,
    "missed",
    "the target should be recorded as missed",
  );
  assert(
    store().currentTargetCountry?.iso_a3 !== target?.iso_a3,
    "a miss should advance to the next target",
  );
});

test("a hinted correct answer is recorded as assisted", () => {
  resetToRegion("south-america");
  store().selectMode("identify-shaded");
  store().startQuiz();

  const target = store().currentTargetCountry;
  const wrong = store().quizCountries.find(
    (country) => country.iso_a3 !== target?.iso_a3,
  );

  store().submitIdentifyGuess(wrong ?? null);

  const result = store().submitIdentifyGuess(target);

  assertEqual(result.outcome, "assisted", "answering after a hint is assisted");
  assertEqual(
    store().countryResults[target?.iso_a3 ?? ""].status,
    "assisted",
    "assisted status should be stored",
  );
  assertEqual(store().isPerfectRun, false, "an assisted run is not perfect");
});

test("a wrong map click records what was tapped for the map to teach", () => {
  resetToRegion("south-america");
  store().selectMode("click-country");
  store().startQuiz();

  const target = store().currentTargetCountry;
  const wrong = store().quizCountries.find(
    (country) => country.iso_a3 !== target?.iso_a3,
  );

  store().submitMapClickGuess(wrong?.iso_a3 ?? null, "main");

  assertEqual(
    store().lastMissFeedback?.wrongIso,
    wrong?.iso_a3,
    "the tapped country should be recorded",
  );
  assertEqual(
    store().lastMissFeedback?.correctIso,
    null,
    "an early attempt must not reveal the answer",
  );

  store().submitMapClickGuess(wrong?.iso_a3 ?? null, "main");
  store().submitMapClickGuess(wrong?.iso_a3 ?? null, "main");

  assertEqual(
    store().lastMissFeedback?.correctIso,
    target?.iso_a3,
    "the revealing attempt should expose the correct country",
  );
});

test("the timer is derived from a deadline and survives a background jump", () => {
  resetToRegion("south-america");
  store().selectMode("type-to-fill");
  store().startQuiz();

  const startingSeconds = store().remainingSeconds;

  assert(startingSeconds > 0, "a timed run should start with time on the clock");

  // Simulate 30 seconds passing while the tab was throttled: only one tick
  // fires, but the clock must reflect the real elapsed time, not one second.
  useGameStore.setState({ deadlineAt: Date.now() + (startingSeconds - 30) * 1000 });
  store().tick();

  assert(
    Math.abs(store().remainingSeconds - (startingSeconds - 30)) <= 1,
    `clock should catch up to real time, got ${store().remainingSeconds}`,
  );

  // And an expired deadline ends the run rather than counting down from stale
  // state.
  useGameStore.setState({ deadlineAt: Date.now() - 1000 });
  store().tick();

  assertEqual(store().remainingSeconds, 0, "an expired deadline zeroes the clock");
  assertEqual(store().gameStatus, "failed", "an expired deadline fails the run");
});

test("pause freezes the clock and resume re-arms it", () => {
  resetToRegion("south-america");
  store().selectMode("type-to-fill");
  store().startQuiz();

  useGameStore.setState({
    deadlineAt: Date.now() + 100_000,
    remainingSeconds: 100,
  });
  store().pauseQuiz();

  const frozen = store().remainingSeconds;

  assertEqual(store().deadlineAt, null, "pausing disarms the deadline");
  assert(
    Math.abs(frozen - 100) <= 1,
    `pausing should keep the remaining time, got ${frozen}`,
  );

  store().tick();

  assertEqual(
    store().remainingSeconds,
    frozen,
    "a paused quiz must not tick down",
  );

  store().resumeQuiz();

  assertEqual(store().gameStatus, "running", "resume returns to running");
  assert(store().deadlineAt !== null, "resume re-arms the deadline");
});

test("untimed practice never runs out", () => {
  resetToRegion("south-america");
  store().selectMode("type-to-fill");
  store().setTimerMode("untimed");
  store().startQuiz();

  assertEqual(store().deadlineAt, null, "untimed runs carry no deadline");

  store().tick();

  assertEqual(store().gameStatus, "running", "untimed runs cannot expire");

  store().setTimerMode("timed");
});

test("a custom roster runs on the shared engine and is resumable", () => {
  resetToRegion("south-america");
  localStorage.clear();

  const ids = ["BRA", "PER", "CHL"];

  store().startCustomQuiz(ids, { mode: "type-to-fill", label: "Practice set" });

  assertEqual(store().gameStatus, "running", "a custom run should start");
  assertEqual(
    store().quizCountries.map((country) => country.iso_a3),
    ids,
    "the roster should be exactly the supplied countries",
  );
  assertEqual(store().total, 3, "total should follow the roster");
  assertEqual(
    store().remainingSeconds,
    60,
    "a 3-country roster gets the 60s floor",
  );

  const [first] = store().quizCountries;

  store().submitTypeGuess(first);

  const snapshot = readQuizProgress();

  assert(snapshot !== null, "an in-progress custom run should persist");
  assertEqual(
    snapshot?.customCountryIds,
    ids,
    "the roster should survive in the snapshot",
  );
  assertEqual(snapshot?.customLabel, "Practice set", "the label should persist");

  store().backToRegionSelect();
  store().resumeSavedQuiz(snapshot ?? undefined);

  assertEqual(store().gameStatus, "running", "the saved run should resume");
  assertEqual(store().score, 1, "the score should be restored");
  assertEqual(
    store().quizCountries.map((country) => country.iso_a3),
    ids,
    "the resumed roster should match",
  );
  assert(store().deadlineAt !== null, "a resumed running quiz re-arms its clock");
});

test("finishing a run clears the saved snapshot", () => {
  resetToRegion("south-america");
  store().selectMode("type-to-fill");
  store().startQuiz();
  store().submitTypeGuess(store().quizCountries[0]);

  assert(readQuizProgress() !== null, "an in-progress run should be saved");

  store().giveUp();

  assertEqual(
    readQuizProgress(),
    null,
    "ending a run should clear the saved snapshot",
  );
});

test("deliberate hints count once and make the answered target assisted", () => {
  resetToRegion("south-america");
  store().selectMode("identify-shaded");
  store().startQuiz();

  const target = store().currentTargetCountry;
  const reveal = store().requestHint();

  assert(reveal !== null, "a running target quiz should reveal a hint");
  assertEqual(store().hintsUsed, 1, "one deliberate reveal should count");

  const result = store().submitIdentifyGuess(target);
  assertEqual(result.outcome, "assisted", "a hinted answer is assisted");
});

test("retry immediately restarts the same quiz configuration", () => {
  resetToRegion("south-america");
  store().selectMode("type-to-fill");
  store().startQuiz();
  store().submitTypeGuess(store().quizCountries[0]);
  store().requestHint();

  store().retryQuiz();

  assertEqual(store().gameStatus, "running", "retry should start immediately");
  assertEqual(store().selectedRegion, "south-america", "region is preserved");
  assertEqual(store().selectedMode, "type-to-fill", "mode is preserved");
  assertEqual(store().score, 0, "retry clears score");
  assertEqual(store().hintsUsed, 0, "retry clears hint count");
  assertEqual(store().currentInput, "", "retry clears input");
});

await runTests("Game store checks");
