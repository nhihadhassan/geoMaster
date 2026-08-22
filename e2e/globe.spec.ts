import { expect, test } from "@playwright/test";

/**
 * The landing globe once rendered at four times its CSS size, because a
 * hardcoded width * 2 compounded with the config's devicePixelRatio: 2. On a
 * phone that was 5.1M pixels a frame for a background element. This guards the
 * scale directly, since canvas dimensions are deterministic where frame rates
 * in a headless browser are not.
 */
const readGlobeCanvas = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const globe = document.querySelector<HTMLCanvasElement>(
      'canvas[aria-label="Interactive rotating globe"]',
    );

    if (!globe || globe.offsetWidth === 0) {
      return null;
    }

    return {
      scale: globe.width / globe.offsetWidth,
      megapixels: (globe.width * globe.height) / 1e6,
    };
  });

test("the globe never renders past retina scale", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("heading", { name: "GeoMaster" }).waitFor();

  await expect.poll(() => readGlobeCanvas(page)).not.toBeNull();

  const canvas = await readGlobeCanvas(page);

  // 2x is retina-crisp; anything beyond is oversampling the display cannot
  // show. The regression this catches was 4x.
  expect(canvas!.scale).toBeLessThanOrEqual(2.01);
  expect(canvas!.megapixels).toBeLessThan(6);
});
