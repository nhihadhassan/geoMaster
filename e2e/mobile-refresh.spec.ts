import { expect, test } from "@playwright/test";
import { countries } from "../src/data/countries";
import { openFresh, openQuizSetup, startConfiguredQuiz, visible } from "./helpers";

test("short-phone setup exposes all modes, timer, and explicit radio selection", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openFresh(page);
  await openQuizSetup(page);
  const rows = page.locator(".atlas-mode-row");
  await expect(rows).toHaveCount(4);
  const layout = await rows.evaluateAll((elements) => {
    const body = document.querySelector(".atlas-setup-body")!.getBoundingClientRect();
    return elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return rect.height >= 44 && rect.top >= body.top && rect.bottom <= body.bottom + 1;
    });
  });
  expect(layout).toEqual([true, true, true, true]);
  const name = page.getByRole("radio", { name: "Name countries" });
  await name.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: "Identify a country" })).toBeChecked();
  await expect(page.getByRole("group", { name: "Time limit", exact: true })).toBeVisible();
  await visible(page.locator('button[aria-controls="quiz-region-options"]')).click();
  await expect(page.locator("#quiz-region-options")).toHaveCount(1);
});

test("pause keeps focus and background inert, then restores the pause control", async ({ page }) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);
  await visible(page.getByRole("button", { name: "Pause", exact: true })).click();
  const dialog = page.getByRole("dialog", { name: "Take your time." });
  await expect(dialog.getByRole("button", { name: "Resume quiz" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Discard quiz", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Resume quiz" })).toBeFocused();
  expect(await page.locator("[data-testid=quiz-shell]").evaluate((main) => {
    const overlay = main.querySelector(".atlas-pause-backdrop");
    return Array.from(main.children).filter((child) => child !== overlay).every((child) => !(child instanceof HTMLElement) || child.inert);
  })).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(visible(page.getByRole("button", { name: "Pause", exact: true }))).toBeFocused();
  await expect(visible(page.getByRole("textbox"))).toBeEnabled();
});

test("capital answers can be checked using the visible phone button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFresh(page);
  await openQuizSetup(page);
  await page.getByRole("radio", { name: "Identify by capital" }).check();
  await startConfiguredQuiz(page);
  const target = visible(page.getByRole("complementary", { name: "Target prompt" }));
  const capital = (await target.innerText()).match(/Capital: (.+)/)?.[1]?.trim();
  const answer = countries.find((country) => country.capital === capital);
  expect(answer).toBeTruthy();
  await visible(page.getByRole("textbox")).fill(answer!.name);
  const check = page.getByRole("button", { name: "Check answer", exact: true });
  await expect(check).toBeVisible();
  const rect = await check.boundingBox();
  expect(rect!.height).toBeGreaterThanOrEqual(44);
  await check.click();
  await expect(visible(page.getByRole("textbox"))).toHaveValue("");
  await expect(visible(page.getByTestId("mobile-quiz-hud"))).toContainText("1/12");
});

for (const denial of ["read", "write"] as const) {
  test(`storage ${denial} failure keeps preferences and the quiz playable`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((operation) => {
      const fail = () => { throw new DOMException("Storage denied for regression test", "SecurityError"); };
      if (operation === "read") Storage.prototype.getItem = fail;
      else Storage.prototype.setItem = fail;
    }, denial);
    const exceptions: string[] = [];
    page.on("pageerror", (error) => exceptions.push(error.message));
    await page.goto("/");
    await page.getByRole("heading", { name: "GeoMaster", exact: true }).waitFor();
    await openQuizSetup(page);
    await page.getByRole("button", { name: "Untimed", exact: true }).click();
    await expect(page.getByRole("button", { name: "Untimed", exact: true })).toHaveAttribute("aria-pressed", "true");
    await startConfiguredQuiz(page);
    await visible(page.getByRole("textbox")).fill("Brazil");
    await expect(visible(page.getByTestId("mobile-quiz-hud"))).toContainText("1/12");
    await expect(page.getByRole("status").filter({ hasText: "Temporary progress" })).toBeVisible();
    expect(exceptions).toEqual([]);
  });
}

test("the flat country profile keeps its story reachable by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFresh(page);
  await visible(page.getByRole("button", { name: "Explore Map", exact: true })).click();
  await visible(page.getByRole("combobox")).fill("Peru");
  await visible(page.getByRole("option")).click();
  const profile = page.getByRole("dialog", { name: /Peru country profile/ });
  await expect(profile.getByRole("button", { name: "Close learning card" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(profile.locator("summary")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(profile.locator("details")).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(profile).toBeHidden();
});
