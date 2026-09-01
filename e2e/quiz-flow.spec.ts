import { expect, test } from "@playwright/test";
import {
  endQuizViaPause,
  openFresh,
  openQuizSetup,
  startConfiguredQuiz,
  visible,
} from "./helpers";

test("landing leads into quiz setup and a running quiz", async ({ page }) => {
  await openFresh(page);

  // The landing is deliberately bare: wordmark, globe, actions. No caption.
  await expect(
    visible(page.getByRole("button", { name: "Explore Map" })),
  ).toBeVisible();
  await expect(
    page.getByText("Learn every country on a real world map", { exact: false }),
  ).toHaveCount(0);

  await openQuizSetup(page);

  // Setup reads as one linear flow rather than tabs.
  await expect(visible(page.getByRole("heading", { name: "Region" }))).toBeVisible();
  await expect(visible(page.getByRole("heading", { name: "Mode" }))).toBeVisible();

  await startConfiguredQuiz(page);

  await expect(visible(page.getByRole("button", { name: "Pause" }))).toBeVisible();
  // Give Up no longer competes for HUD space; ending is Pause -> End Quiz.
  await expect(page.getByRole("button", { name: /Give Up/ })).toHaveCount(0);
});

test("a finished quiz offers the next action and can be retried", async ({
  page,
}) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);
  await endQuizViaPause(page);

  await expect(
    visible(page.getByRole("button", { name: "Try Again" })),
  ).toBeVisible();
  await expect(
    visible(page.getByRole("button", { name: /^Practice \d+$/ })),
  ).toBeVisible();

  await visible(page.getByRole("button", { name: "Try Again" })).click();
  await expect(page.getByText("Quiz ended", { exact: false })).toHaveCount(0);
});

test("pausing stops the clock and resuming restarts it", async ({ page }) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);

  const timer = visible(page.locator("p.font-mono"));
  await expect(timer).toBeVisible();

  await visible(page.getByRole("button", { name: "Pause" })).click();
  const paused = await timer.textContent();

  // The timer is derived from a deadline, so a pause must genuinely freeze it.
  await page.waitForTimeout(2_200);
  await expect(timer).toHaveText(paused ?? "");

  await page
    .getByRole("dialog", { name: "Take your time." })
    .getByRole("button", { name: "Resume" })
    .click();
  await page.waitForTimeout(2_200);
  await expect(timer).not.toHaveText(paused ?? "");
});

test("type mode gives clear duplicate feedback and mobile-safe input hints", async ({
  page,
}) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);

  const input = visible(page.getByRole("textbox"));
  await expect(input).toHaveAttribute("autocomplete", "off");
  await expect(input).toHaveAttribute("autocorrect", "off");
  await expect(input).toHaveAttribute("enterkeyhint", "done");

  await input.fill("Brazil");
  await input.fill("Brazil");
  await input.press("Enter");

  await expect(visible(page.getByText("Already guessed Brazil"))).toBeVisible();
});
