import { expect, test } from "@playwright/test";
import {
  openFresh,
  openQuizSetup,
  startConfiguredQuiz,
  visible,
} from "./helpers";

test("an in-progress quiz survives a reload and can be resumed", async ({
  page,
}) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);

  // The snapshot is written by a store subscriber, so give it a beat.
  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean(window.localStorage.getItem("geomaster-quiz-progress")),
      ),
    )
    .toBe(true);

  await page.reload();

  // The landing offers to pick the run back up rather than starting over.
  const resume = visible(page.getByRole("button", { name: "Resume Quiz" }));
  await resume.waitFor();
  await resume.click();

  await expect(visible(page.getByRole("button", { name: "Pause" }))).toBeVisible();
});
