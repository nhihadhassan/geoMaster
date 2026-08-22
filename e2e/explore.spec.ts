import { expect, test } from "@playwright/test";
import { exploreSearchBox, openFresh, visible } from "./helpers";

test("explore search finds a country and opens its details", async ({
  page,
}) => {
  await openFresh(page);
  await visible(page.getByRole("button", { name: "Explore Map" })).click();

  const search = exploreSearchBox(page);
  await search.waitFor();
  await search.fill("peru");

  const option = visible(page.getByRole("option"));
  await expect(option).toContainText("Peru");
  await option.click();

  // The result opens the existing learning card rather than a new surface.
  await expect(visible(page.getByRole("dialog", { name: /Peru/i }))).toBeVisible();
  await expect(visible(page.getByText("Lima", { exact: false }))).toBeVisible();
});

test("explore search reaches beyond countries", async ({ page }) => {
  await openFresh(page);
  await visible(page.getByRole("button", { name: "Explore Map" })).click();

  const search = exploreSearchBox(page);
  await search.waitFor();
  await search.fill("sahara");

  await expect(visible(page.getByRole("option"))).toContainText("Sahara");
});
