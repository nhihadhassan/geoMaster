import { expect, test } from "@playwright/test";
import {
  endQuizViaPause,
  exploreSearchBox,
  openMonitoredFresh,
  openQuizSetup,
  startConfiguredQuiz,
  visible,
} from "./helpers";

test("region and Type flow reaches results and retries without browser issues", async ({
  page,
}) => {
  const verifyHealth = await openMonitoredFresh(page);
  await openQuizSetup(page);
  await visible(
    page.getByRole("button", { name: /South America \d+ countries/ }),
  ).click();
  await visible(page.getByRole("button", { name: "Type" })).click();
  await startConfiguredQuiz(page);
  await expect(visible(page.getByRole("textbox"))).toBeVisible();
  await endQuizViaPause(page);
  await visible(page.getByRole("button", { name: "Try Again" })).click();
  await expect(visible(page.getByRole("button", { name: "Pause" }))).toBeVisible();
  await verifyHealth();
});

test("Identify mode starts with a named target and answer input", async ({
  page,
}) => {
  const verifyHealth = await openMonitoredFresh(page);
  await openQuizSetup(page);
  await visible(page.getByRole("button", { name: "Identify" })).click();
  await startConfiguredQuiz(page);
  await expect(
    visible(page.getByRole("complementary", { name: "Target prompt" })),
  ).toBeVisible();
  await expect(visible(page.getByRole("textbox"))).toBeVisible();
  await verifyHealth();
});

test("Map Click mode starts with an accessible target prompt", async ({
  page,
}) => {
  const verifyHealth = await openMonitoredFresh(page);
  await openQuizSetup(page);
  await visible(page.getByRole("button", { name: "Map Click" })).click();
  await startConfiguredQuiz(page);
  const targetPrompt = visible(
    page.getByRole("complementary", { name: "Target prompt" }),
  );
  await expect(targetPrompt).toBeVisible();
  await expect(targetPrompt).toContainText(/Find .+/);
  await verifyHealth();
});

test("Explore search opens country learning information cleanly", async ({
  page,
}) => {
  const verifyHealth = await openMonitoredFresh(page);
  await visible(page.getByRole("button", { name: "Explore Map" })).click();

  const search = exploreSearchBox(page);
  await search.waitFor();
  await search.fill("peru");

  const option = visible(page.getByRole("option"));
  await expect(option).toContainText("Peru");
  await option.click();
  await expect(visible(page.getByRole("dialog", { name: /Peru/i }))).toBeVisible();
  await expect(visible(page.getByText("Lima", { exact: false }))).toBeVisible();
  await verifyHealth();
});
