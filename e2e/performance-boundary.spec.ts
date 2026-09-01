import { expect, test } from "@playwright/test";
import { openMonitoredFresh, visible } from "./helpers";

const TOPOLOGY_PATH = "/data/world-countries.topo.json";
const isMapboxRequest = (url: string) => {
  const hostname = new URL(url).hostname;

  return hostname === "api.mapbox.com" || hostname.endsWith(".mapbox.com");
};

test("keeps Mapbox and country geometry off the landing network", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const verifyHealth = await openMonitoredFresh(page);

  await page.waitForTimeout(2_200);

  expect(requests.some((url) => url.endsWith(TOPOLOGY_PATH))).toBe(false);
  expect(requests.some(isMapboxRequest)).toBe(false);

  await visible(page.getByRole("button", { name: "Explore Map" })).click();

  await expect
    .poll(() => requests.some((url) => url.endsWith(TOPOLOGY_PATH)))
    .toBe(true);
  await expect.poll(() => requests.some(isMapboxRequest)).toBe(true);
  await verifyHealth();
});
