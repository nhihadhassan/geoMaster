// The mastery model and the run-recording rules that feed it.
import {
  assert,
  assertEqual,
  installMemoryStorage,
  runTests,
  test,
} from "./test-harness.ts";

installMemoryStorage();

const {
  emptyProgress,
  getMasteredCount,
  getMasteryLevel,
  getRegionMastery,
  getWeakestCountryIds,
} = await import("../src/utils/countryMastery.ts");
const { buildRunOutcome } = await import("../src/hooks/useRecordQuizProgress.ts");

const progressOf = (
  overrides: Partial<ReturnType<typeof emptyProgress>>,
) => ({ ...emptyProgress(), ...overrides });

test("mastery levels reflect how a country has actually gone", () => {
  assertEqual(getMasteryLevel(undefined), "unseen", "no record is unseen");
  assertEqual(
    getMasteryLevel(progressOf({})),
    "unseen",
    "a zeroed record is unseen",
  );
  assertEqual(
    getMasteryLevel(progressOf({ correct: 2, lastResult: "correct" })),
    "mastered",
    "two clean answers ending on a correct is mastered",
  );
  assertEqual(
    getMasteryLevel(progressOf({ correct: 3, missed: 1, lastResult: "missed" })),
    "learning",
    "a recent slip after clean answers is still learning, not mastered",
  );
  assertEqual(
    getMasteryLevel(progressOf({ missed: 2, correct: 1, lastResult: "missed" })),
    "shaky",
    "missed more often than answered is shaky",
  );
  assertEqual(
    getMasteryLevel(progressOf({ assisted: 1, lastResult: "assisted" })),
    "learning",
    "a hinted answer is learning",
  );
});

test("region mastery counts only that region's countries", () => {
  const progressMap = {
    BRA: progressOf({ correct: 2, lastResult: "correct" as const }),
    PER: progressOf({ correct: 2, lastResult: "correct" as const }),
    FRA: progressOf({ correct: 2, lastResult: "correct" as const }),
  };
  const southAmerica = getRegionMastery(progressMap, "south-america");

  assertEqual(southAmerica.total, 12, "South America has 12 countries");
  assertEqual(southAmerica.mastered, 2, "only the two SA countries count");
  assertEqual(getMasteredCount(progressMap), 3, "global count includes France");
});

test("the weakness ranking puts misses first and ignores solid countries", () => {
  const now = Date.now();
  const progressMap = {
    BRA: progressOf({ correct: 4, lastResult: "correct" as const, lastSeenAt: now }),
    PER: progressOf({ missed: 3, lastResult: "missed" as const, lastSeenAt: now }),
    CHL: progressOf({ assisted: 2, lastResult: "assisted" as const, lastSeenAt: now }),
  };
  const weakest = getWeakestCountryIds(progressMap, { now });

  assertEqual(weakest[0], "PER", "the most-missed country ranks first");
  assertEqual(weakest[1], "CHL", "a hinted country ranks below a missed one");
  assert(!weakest.includes("BRA"), "a solid country is not a weak spot");
});

test("a country untouched for weeks drifts back up the ranking", () => {
  const now = Date.now();
  const month = 30 * 24 * 60 * 60 * 1000;
  const progressMap = {
    PER: progressOf({ missed: 1, lastResult: "missed" as const, lastSeenAt: now }),
    CHL: progressOf({
      missed: 1,
      lastResult: "missed" as const,
      lastSeenAt: now - month,
    }),
  };

  assertEqual(
    getWeakestCountryIds(progressMap, { now })[0],
    "CHL",
    "the staler of two equal weaknesses should come up for practice first",
  );
});

test("the weakness ranking can be scoped to a region and limited", () => {
  const now = Date.now();
  const progressMap = {
    PER: progressOf({ missed: 3, lastResult: "missed" as const, lastSeenAt: now }),
    CHL: progressOf({ missed: 2, lastResult: "missed" as const, lastSeenAt: now }),
    FRA: progressOf({ missed: 5, lastResult: "missed" as const, lastSeenAt: now }),
  };

  assertEqual(
    getWeakestCountryIds(progressMap, { region: "south-america", now }),
    ["PER", "CHL"],
    "scoping to a region excludes countries outside it",
  );
  assertEqual(
    getWeakestCountryIds(progressMap, { limit: 1, now }).length,
    1,
    "the limit should be respected",
  );
});

test("run outcomes are read correctly from both engine shapes", () => {
  const targetQueueRun = buildRunOutcome({
    quizCountryIds: ["BRA", "PER", "CHL"],
    countryResults: {
      BRA: { status: "correct" },
      PER: { status: "assisted" },
    },
    guessedCountryIds: [],
    isTargetQueueMode: true,
  });

  assertEqual(
    targetQueueRun,
    [
      { iso: "BRA", status: "correct" },
      { iso: "PER", status: "assisted" },
      // Never reached before the run ended, so it counts as missed.
      { iso: "CHL", status: "missed" },
    ],
    "target-queue results should carry through, unreached countries missed",
  );

  const typeRun = buildRunOutcome({
    quizCountryIds: ["BRA", "PER", "CHL"],
    countryResults: {},
    guessedCountryIds: ["BRA", "CHL"],
    isTargetQueueMode: false,
  });

  assertEqual(
    typeRun,
    [
      { iso: "BRA", status: "correct" },
      { iso: "PER", status: "missed" },
      { iso: "CHL", status: "correct" },
    ],
    "type-to-fill has no countryResults, so guessed is correct and the rest missed",
  );
});

await runTests("Progress model checks");
