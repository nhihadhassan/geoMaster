import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3107);

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
  // parallel Mapbox/WebGL canvases produced GPU-session closures and timeouts
  // that looked like product failures rather than the contention they were.
  // One worker keeps page-health and visual-viewport results deterministic.
  fullyParallel: false,
  workers: 1,
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
    // Never silently test another local Next app that happens to own this
    // port. A bind failure is actionable; false-positive coverage is not.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
