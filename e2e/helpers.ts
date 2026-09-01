import { expect, type Locator, type Page } from "@playwright/test";

const isExtensionUrl = (url: string) =>
  url.startsWith("chrome-extension://") ||
  url.startsWith("moz-extension://") ||
  url.startsWith("safari-web-extension://");

/**
 * Captures application-owned browser failures without treating extension
 * injections or third-party map-tile availability as first-party regressions.
 */
export const monitorPageHealth = (page: Page) => {
  const issues: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") {
      return;
    }

    const sourceUrl = message.location().url;
    const text = message.text();

    // Chromium emits these from the local GPU process during WebGL readback;
    // they are environmental diagnostics rather than application warnings.
    if (text.includes("GL Driver Message") && text.includes("ReadPixels")) {
      return;
    }

    // A blocked/unavailable third-party Mapbox tile also produces this generic
    // console line. First-party failures are still captured by requestfailed.
    if (text === "Failed to load resource: net::ERR_NAME_NOT_RESOLVED") {
      return;
    }

    if (!isExtensionUrl(sourceUrl)) {
      issues.push(`console ${message.type()}: ${text}`);
    }
  });
  page.on("pageerror", (error) => {
    issues.push(`page error: ${error.stack ?? error.message}`);
  });
  page.on("requestfailed", (request) => {
    const currentUrl = page.url();

    if (!currentUrl.startsWith("http")) {
      return;
    }

    const requestedUrl = new URL(request.url());
    const currentOrigin = new URL(currentUrl).origin;
    const failure = request.failure()?.errorText ?? "unknown failure";

    if (
      requestedUrl.origin === currentOrigin &&
      failure !== "net::ERR_ABORTED"
    ) {
      issues.push(
        `first-party request failed: ${requestedUrl.pathname} (${failure})`,
      );
    }
  });

  return async () => {
    const duplicateIds = await page.locator("[id]").evaluateAll((elements) => {
      const counts = new Map<string, number>();

      elements.forEach((element) => {
        counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
      });

      return [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([id]) => id);
    });

    expect(duplicateIds, "duplicate DOM ids").toEqual([]);
    expect(issues, "browser health issues").toEqual([]);
  };
};

/** Opens a clean document once, with health capture active before hydration. */
export const openMonitoredFresh = async (page: Page) => {
  await page.addInitScript(() => window.localStorage.clear());
  const verifyHealth = monitorPageHealth(page);
  await page.goto("/");
  await page.getByRole("heading", { name: "GeoMaster" }).waitFor();

  return verifyHealth;
};

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
