// The daily challenge must be identical for everyone on a given day, and the
// streak must only extend on consecutive days.
import { assert, assertEqual, runTests, test } from "./test-harness.ts";

const { getDailyCountryIds, recordDailyCompletion, isDailyDoneToday } =
  await import("../src/utils/dailyChallenge.ts");

const emptyRecord = { lastPlayedDay: null, streak: 0, bestStreak: 0 };

test("the same day always yields the same roster", () => {
  assertEqual(
    getDailyCountryIds("2026-08-20"),
    getDailyCountryIds("2026-08-20"),
    "a day's set must be reproducible so scores are comparable",
  );
});

test("different days yield different rosters", () => {
  assert(
    JSON.stringify(getDailyCountryIds("2026-08-20")) !==
      JSON.stringify(getDailyCountryIds("2026-08-21")),
    "consecutive days should not repeat the same set",
  );
});

test("a roster is twelve distinct countries", () => {
  const ids = getDailyCountryIds("2026-08-20");

  assertEqual(ids.length, 12, "twelve countries per day");
  assertEqual(new Set(ids).size, 12, "no duplicates in a day's set");
});

test("streaks extend on consecutive days and reset after a gap", () => {
  const day1 = recordDailyCompletion(emptyRecord, "2026-08-20");
  const day2 = recordDailyCompletion(day1, "2026-08-21");
  const afterGap = recordDailyCompletion(day2, "2026-08-23");

  assertEqual(day1.streak, 1, "the first day starts a streak");
  assertEqual(day2.streak, 2, "a consecutive day extends it");
  assertEqual(afterGap.streak, 1, "a missed day restarts it");
  assertEqual(afterGap.bestStreak, 2, "the best streak is remembered");
});

test("replaying the same day does not inflate the streak", () => {
  const day1 = recordDailyCompletion(emptyRecord, "2026-08-20");
  const again = recordDailyCompletion(day1, "2026-08-20");

  assertEqual(again.streak, 1, "the same day counts once");
  assertEqual(isDailyDoneToday(again, "2026-08-20"), true, "marked as done");
  assertEqual(
    isDailyDoneToday(again, "2026-08-21"),
    false,
    "a new day is not done yet",
  );
});

await runTests("Daily challenge checks");
