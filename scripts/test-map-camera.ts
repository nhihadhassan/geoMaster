import assert from "node:assert/strict";
import { chromium, expect, type Page } from "@playwright/test";
import type { Map as MapboxMap } from "mapbox-gl";
import { countries } from "../src/data/countries.ts";
import type { QuizProgressSnapshot } from "../src/store/quizPersistence.ts";

// Separate from the DOM-only smoke suite: this check requires real Mapbox
// resources and must fail explicitly if the map cannot load.
const baseURL = process.env.MAP_CAMERA_URL ?? "http://127.0.0.1:3107";
type Mode = "click-country" | "identify-shaded";
declare global {
  interface Window { __cameraAuditMap?: MapboxMap }
}

async function attachCameraReader(page: Page) {
  await page.waitForFunction(() => {
    // Read the existing map ref without adding a production debug API or
    // changing map/game state. All quiz and camera actions below use the UI.
    type Hook = { memoizedState?: { current?: MapboxMap }; next?: Hook };
    type Fiber = { memoizedState?: Hook; return?: Fiber };
    const element = document.querySelector(".mapboxgl-map");
    if (!element) return false;
    const key = Object.keys(element).find((name) => name.startsWith("__reactFiber$"));
    let fiber = key ? (element as unknown as Record<string, Fiber>)[key] : undefined;
    for (let depth = 0; fiber && depth < 30; depth++, fiber = fiber.return) {
      let hook = fiber.memoizedState;
      for (let count = 0; hook && count < 100; count++, hook = hook.next) {
        const map = hook.memoizedState?.current;
        if (map && typeof map.getCenter === "function" && typeof map.project === "function") {
          window.__cameraAuditMap = map;
          return Boolean(map.getLayer("geomaster-country-fill")) && !map.isMoving();
        }
      }
    }
    return false;
  }, undefined, { timeout: Number(process.env.MAP_CAMERA_LOAD_TIMEOUT ?? 60_000) });
}

const camera = (page: Page) => page.evaluate(() => {
  const map = window.__cameraAuditMap!;
  return { lng: map.getCenter().lng, lat: map.getCenter().lat,
    zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
});
const progress = (page: Page) => page.evaluate(() =>
  JSON.parse(localStorage.getItem("geomaster-quiz-progress")!) as QuizProgressSnapshot,
);
const visibleButton = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).filter({ visible: true }).first();

async function clickCountry(page: Page, iso: string) {
  const country = countries.find((item) => item.iso_a3 === iso)!;
  const point = await page.evaluate((center) => {
    const projected = window.__cameraAuditMap!.project([center.lng, center.lat]);
    const rect = window.__cameraAuditMap!.getCanvas().getBoundingClientRect();
    const x = projected.x + rect.left;
    const y = projected.y + rect.top;
    return { x, y, receiver: document.elementFromPoint(x, y)?.className,
      features: window.__cameraAuditMap!.queryRenderedFeatures(projected,
        { layers: ["geomaster-country-fill"] }).map((feature) => feature.id) };
  }, country.center);
  assert(point.features.includes(iso), `${iso} must have loaded geometry at the tap point: ${JSON.stringify(point)}`);
  assert(String(point.receiver).includes("mapboxgl-canvas"), `${iso} tap is covered: ${JSON.stringify(point)}`);
  await page.mouse.click(point.x, point.y);
}

async function panToCountry(page: Page, iso: string) {
  const drag = await page.evaluate((center) => {
    const map = window.__cameraAuditMap!;
    const rect = map.getCanvas().getBoundingClientRect();
    const target = map.project([center.lng, center.lat]);
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    return { x, y, endX: x + rect.width / 2 - target.x, endY: y + rect.height / 2 - target.y };
  }, countries.find((country) => country.iso_a3 === iso)!.center);
  await page.mouse.move(drag.x, drag.y);
  await page.mouse.down();
  await page.mouse.move(drag.endX, drag.endY, { steps: 12 });
  await page.waitForTimeout(200);
  await page.mouse.up();
  await page.waitForTimeout(700);
}

async function checkJourney(mode: Mode, mobile: boolean) {
  const page = await browser.newPage({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: mobile, hasTouch: mobile,
  });
  page.setDefaultTimeout(15_000);
  page.on("pageerror", (error) => console.error(error.message));
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "events.mapbox.com" && request.failure()?.errorText !== "net::ERR_ABORTED") {
      console.error("Request failed", url.hostname, url.pathname, request.failure()?.errorText);
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      const url = new URL(response.url());
      console.error("HTTP failure", response.status(), url.hostname, url.pathname);
    }
  });
  try {
    // A deterministic saved run gives both modes the same real questions.
    await page.addInitScript((quizMode) => {
      localStorage.clear();
      localStorage.setItem("geomaster-quiz-progress", JSON.stringify({
        v: 3, region: "south-america", mode: quizMode, status: "running",
        guessedCountryIds: [], countryResults: {}, incorrectAttempts: {},
        score: 0, total: 12, remainingSeconds: 240,
        currentTargetIso: "BOL",
        targetQueue: ["ARG", "VEN", "PRY", "BRA", "PER", "COL", "ECU", "GUY", "SUR", "URY", "CHL"],
        savedAt: Date.now(),
      }));
    }, mode);
    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    await visibleButton(page, "Resume Quiz").click();
    await visibleButton(page, "Pause").waitFor();
    await attachCameraReader(page);
    await page.waitForTimeout(1_500);
    await page.waitForFunction(() => !window.__cameraAuditMap!.isMoving());
    // Establish the regional frame explicitly rather than comparing with a
    // constructor camera that may still be visible during initial map loading.
    await visibleButton(page, "Recenter the map").click();
    await page.waitForTimeout(1_100);
    const overview = await camera(page);
    // Pan with a real drag toward the first question, then zoom until the
    // upcoming Argentina target is outside the bounds used by the old rule.
    await panToCountry(page, "BOL");
    const argentinaVisible = () => page.evaluate((center) => window.__cameraAuditMap!.getBounds()!
      .contains([center.lng, center.lat]), countries.find((country) => country.iso_a3 === "ARG")!.center);
    for (let count = 0; count < 5 && (count < 1 || await argentinaVisible()); count++) {
      await visibleButton(page, "Zoom in").click();
      await page.waitForFunction(() => !window.__cameraAuditMap!.isMoving());
    }
    const chosenCamera = await camera(page);
    assert(chosenCamera.zoom > overview.zoom + 0.5, "The learner must be zoomed in");
    assert.equal(await argentinaVisible(),
    false, "Argentina must be offscreen to exercise the previous answer-revealing pan");

    const assertStill = async (label: string) => {
      // The old pan lasts 650ms. Observe the complete transition, not only
      // the synchronous score update before an animation starts.
      await page.waitForTimeout(1_000);
      const after = await camera(page);
      for (const key of Object.keys(chosenCamera) as (keyof typeof chosenCamera)[]) {
        assert(Math.abs(after[key] - chosenCamera[key]) < 0.00001, `${label}: camera ${key} changed`);
      }
    };
    if (mode === "click-country") await clickCountry(page, "BOL");
    else {
      await page.getByRole("textbox").filter({ visible: true }).fill("Bolivia");
      await visibleButton(page, "Check answer").click();
    }
    await expect.poll(async () => (await progress(page)).currentTargetIso).toBe("ARG");
    assert.equal((await progress(page)).countryResults.BOL.status, "correct");
    await assertStill("correct BOL -> ARG");
    for (let attempt = 1; attempt <= 3; attempt++) {
      if (mode === "click-country") await clickCountry(page, "BOL");
      else {
        await page.getByRole("textbox").filter({ visible: true }).fill("Bolivia");
        await visibleButton(page, "Check answer").click();
      }
      await expect.poll(async () => (await progress(page)).incorrectAttempts.ARG).toBe(attempt);
    }
    await expect.poll(async () => (await progress(page)).currentTargetIso).toBe("VEN");
    assert.equal((await progress(page)).countryResults.ARG.status, "missed");
    await assertStill("three misses ARG -> VEN");
    await visibleButton(page, "Recenter the map").click();
    await page.waitForTimeout(1_100);
    const recentered = await camera(page);
    assert(Math.abs(recentered.zoom - overview.zoom) < 0.01, "Recenter must restore regional zoom");
    assert(Math.abs(recentered.lng - overview.lng) < 0.01 && Math.abs(recentered.lat - overview.lat) < 0.01,
      "Recenter must restore the region, rather than center the answer");
    console.log(`PASS ${mobile ? "mobile" : "desktop"} ${mode}: correct answer, three misses, regional Recenter`);
  } catch (error) {
    console.error(await page.evaluate(() => ({
      quiz: localStorage.getItem("geomaster-quiz-progress"),
      mapLayers: window.__cameraAuditMap?.getStyle()?.layers?.map((layer) => layer.id),
      styleLoaded: window.__cameraAuditMap?.isStyleLoaded(),
      mapLoaded: window.__cameraAuditMap?.loaded(),
      tilesLoaded: window.__cameraAuditMap?.areTilesLoaded(),
      screen: document.body.innerText.slice(0, 1_200),
    })));
    throw error;
  } finally { await page.close(); }
}

const browser = await chromium.launch({ channel: "chromium", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  for (const mobile of [true, false]) {
    for (const mode of ["click-country", "identify-shaded"] as const) await checkJourney(mode, mobile);
  }
} finally { await browser.close(); }
