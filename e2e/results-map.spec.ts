import { expect, test, type Locator, type Page } from "@playwright/test";
import { getCountriesForRegion } from "../src/data/countries";
import { endQuizViaPause, openFresh, openQuizSetup, startConfiguredQuiz, visible } from "./helpers";

// Send browser touch input rather than calling React handlers: a real swipe
// must survive pointer capture and the browser's follow-up click behaviour.
async function swipe(page: Page, handle: Locator, distanceY: number, distanceX = 0) {
  const box = await handle.boundingBox();
  if (!box) throw new Error("Results handle is not visible");
  const session = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = box.y + 16;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart", touchPoints: [{ x, y, id: 1 }],
  });
  for (let step = 1; step <= 5; step++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + distanceX * step / 5, y: y + distanceY * step / 5, id: 1 }],
    });
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
}

async function finishWithOneCorrectAnswer(page: Page) {
  await openFresh(page);
  await openQuizSetup(page);
  await visible(page.locator('button[aria-controls="quiz-region-options"]')).click();
  await visible(page.locator("#quiz-region-options").getByRole("button", { name: /South America \d+ countries/ })).click();
  await visible(page.getByRole("button", { name: "Name countries" })).click();
  await startConfiguredQuiz(page);
  await visible(page.getByRole("textbox")).fill("Brazil");
  await endQuizViaPause(page);
  await expect(page.getByRole("heading", { name: "1 of 12" })).toBeVisible();
}

test("mobile results swipe away to reveal the map and reopen with the score intact", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Native touch input belongs to the mobile journey");
  await finishWithOneCorrectAnswer(page);
  const panel = page.getByRole("region", { name: "Quiz results", exact: true });
  const showMap = page.getByRole("button", { name: "Show map", exact: true });
  await expect(showMap).toBeVisible();

  // Short and horizontal drags must not hide results.
  await swipe(page, showMap, 20);
  await expect(page.getByRole("heading", { name: "1 of 12" })).toBeVisible();
  await swipe(page, showMap, 60, 100);
  await expect(page.getByRole("heading", { name: "1 of 12" })).toBeVisible();

  await swipe(page, showMap, 90);
  const showResults = page.getByRole("button", { name: "Show results", exact: true });
  await expect(showResults).toBeVisible();
  await expect(page.getByRole("heading", { name: "1 of 12" })).toBeHidden();
  await expect(showResults).toContainText("1/12");
  await expect(panel).toContainText("1 correct");
  await expect(panel).toContainText("11 missed");
  await expect.poll(() => panel.evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(120);

  await swipe(page, showResults, -90);
  await expect(page.getByRole("heading", { name: "1 of 12" })).toBeVisible();
  await expect(visible(page.getByRole("button", { name: "Retry South America" }))).toBeVisible();

  // The handle also works from answer review; ordinary list scrolling stays native.
  await page.getByRole("button", { name: /See the countries you missed/ }).click();
  const review = page.getByRole("region", { name: "Review quiz answers" });
  await expect(review).toBeVisible();
  await expect(review.getByRole("heading", { name: "11 countries to learn" })).toBeVisible();
  const content = review.locator("div.overflow-y-auto");
  await swipe(page, content, -110);
  await expect.poll(() => content.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await expect(review).toBeVisible();
  await swipe(page, showMap, 90);
  await expect(showResults).toBeVisible();
  await showResults.click();
  await expect(page.getByRole("heading", { name: "1 of 12" })).toBeVisible();
  await visible(page.getByRole("button", { name: "Retry South America" })).click();
  await expect(visible(page.getByRole("button", { name: "Pause", exact: true }))).toBeVisible();
  await endQuizViaPause(page);
  await expect(showMap).toBeVisible();
});

test("desktop keeps the full results panel and retry controls", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop layout regression coverage");
  await finishWithOneCorrectAnswer(page);
  await expect(page.getByRole("button", { name: "Show map", exact: true })).toBeHidden();
  await expect(page.getByRole("heading", { name: "1 of 12" })).toBeVisible();
  await visible(page.getByRole("button", { name: "Retry South America" })).click();
  await expect(visible(page.getByRole("button", { name: "Pause", exact: true }))).toBeVisible();
});

test("a completed mobile quiz can reveal the all-correct map", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile completion journey");
  await openFresh(page);
  await openQuizSetup(page);
  await visible(page.getByRole("button", { name: "Name countries" })).click();
  await startConfiguredQuiz(page);
  for (const country of getCountriesForRegion("south-america")) {
    await visible(page.getByRole("textbox")).fill(country.name);
  }
  await expect(page.getByRole("heading", { name: "12 of 12" })).toBeVisible();
  const showMap = page.getByRole("button", { name: "Show map", exact: true });
  await swipe(page, showMap, 90);
  await expect(page.getByRole("button", { name: "Show results", exact: true })).toContainText("12/12");
  const results = page.getByRole("region", { name: "Quiz results", exact: true });
  await expect(results).toContainText("12 correct");
  await expect(results).toContainText("0 missed");
});
