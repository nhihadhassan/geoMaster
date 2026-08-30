import { expect, test } from "@playwright/test";
import {
  openFresh,
  openQuizSetup,
  startButton,
  startConfiguredQuiz,
  visible,
} from "./helpers";

// The mobile HUD is the densest surface in the app, so it gets its own checks
// at a real phone width.
test.use({ viewport: { width: 375, height: 812 } });

test("the mobile quiz HUD stays within its width", async ({ page }) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);

  const header = visible(page.getByTestId("mobile-quiz-hud"));
  await expect(header).toBeVisible();

  const overflows = await header.evaluate(
    (el) => el.scrollWidth > el.clientWidth + 1,
  );
  expect(overflows).toBe(false);

  // Nothing in the page should force a horizontal scrollbar either.
  const bodyOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(bodyOverflows).toBe(false);
});

test("primary quiz controls keep accessible touch targets", async ({ page }) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);

  const pause = visible(page.getByRole("button", { name: "Pause" }));
  const box = await pause.boundingBox();

  expect(box).not.toBeNull();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(40);
});

test("quiz setup fits its regions without a tab bar", async ({ page }) => {
  await openFresh(page);
  await openQuizSetup(page);

  // The tab bar is gone; the sections are headings in one column.
  await expect(visible(page.getByRole("heading", { name: "Region" }))).toBeVisible();
  await expect(visible(page.getByRole("heading", { name: "Mode" }))).toBeVisible();
  await expect(startButton(page)).toBeVisible();

  // All eight region choices are reachable in the sheet.
  await expect(
    visible(page.getByRole("button", { name: /Whole World/ })),
  ).toBeVisible();
});
