import { expect, type Locator, type Page } from "@playwright/test";

/**
 * The HUD renders a mobile and a desktop header at once and hides one by
 * breakpoint, so nearly every control exists twice in the DOM. Specs must
 * always act on the one the user can actually see.
 */
export const visible = (locator: Locator) =>
  locator.filter({ visible: true }).first();

/**
 * Opens the app in a known state. Storage is cleared first so a spec never
 * inherits a saved quiz or progress from an earlier run.
 */
export const openFresh = async (page: Page) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.getByRole("heading", { name: "GeoMaster" }).waitFor();
};

/**
 * The start control is labelled "Start Quiz" in the mobile sheet header and
 * "Start Quiz · <region>" in the desktop panel, so match the common prefix and
 * let the visible filter pick the right one.
 */
export const startButton = (page: Page) =>
  visible(page.getByRole("button", { name: /^Start Quiz/ }));

/** Landing -> quiz setup sheet/panel open. */
export const openQuizSetup = async (page: Page) => {
  await visible(
    page.getByRole("button", { name: /^(Choose a Quiz|New Quiz)$/ }),
  ).click();
  await expect(startButton(page)).toBeVisible();
};

/** Starts the currently configured quiz and waits for the running HUD. */
export const startConfiguredQuiz = async (page: Page) => {
  await startButton(page).click();
  await expect(visible(page.getByRole("button", { name: "Pause" }))).toBeVisible();
};

/** Ends a running quiz the way the UI now requires: Pause, then End Quiz. */
export const endQuizViaPause = async (page: Page) => {
  await visible(page.getByRole("button", { name: "Pause" })).click();
  await visible(page.getByRole("button", { name: "End Quiz" })).click();
  await expect(visible(page.getByText("Quiz ended"))).toBeVisible();
};

/** The explore-mode search box for whichever breakpoint is showing. */
export const exploreSearchBox = (page: Page) =>
  visible(page.getByRole("combobox"));
