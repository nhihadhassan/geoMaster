import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Smoke coverage for the journeys that matter, run against a production build.
 *
 * Deliberately narrow: these assert on DOM and HUD state only. Mapbox tiles
 * come from the network and have been intermittently unreachable from
 * verification browsers, so no spec may depend on tiles, canvas pixels, or the
 * map having finished loading - otherwise the suite reports environment
 * problems as product failures.
 */
export default defineConfig({
  testDir: "./e2e",
  // These smoke journeys all drive one app server and a real Mapbox style, so
  // heavy parallelism produced timeouts that looked like product failures
  // rather than the contention they were. Two workers is plenty for five
  // journeys and keeps runs deterministic.
  fullyParallel: false,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
