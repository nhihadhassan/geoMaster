import { expect, test } from "@playwright/test";
import {
  openFresh,
  openQuizSetup,
  startConfiguredQuiz,
  visible,
} from "./helpers";

test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const state = {
      width: window.innerWidth,
      height: window.innerHeight,
      offsetTop: 0,
      offsetLeft: 0,
      scale: 1,
    };
    const mock = new EventTarget() as EventTarget & {
      readonly width: number;
      readonly height: number;
      readonly offsetTop: number;
      readonly offsetLeft: number;
      readonly scale: number;
    };

    for (const key of ["width", "height", "offsetTop", "offsetLeft", "scale"] as const) {
      Object.defineProperty(mock, key, { get: () => state[key] });
    }

    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: mock,
    });
    Object.defineProperty(window, "__setMockVisualViewport", {
      configurable: true,
      value: (next: Partial<typeof state>) => {
        Object.assign(state, next);
        mock.dispatchEvent(new Event("resize"));
      },
    });
  });
});

test("keeps the quiz shell anchored through repeated visual viewport changes", async ({
  page,
}) => {
  await openFresh(page);
  await openQuizSetup(page);
  await startConfiguredQuiz(page);

  const shell = page.getByTestId("quiz-shell");
  const input = visible(page.getByRole("textbox"));
  await input.focus();

  await page.evaluate(() => {
    window.__setMockVisualViewport?.({ height: 460, offsetTop: 12 });
  });
  await expect(shell).toHaveAttribute("data-keyboard-active", "true");
  await expect
    .poll(() => shell.evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(11);

  const reduced = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>('[data-testid="quiz-shell"]');
    const input = document.querySelector<HTMLElement>('#country-guess');
    const header = document.querySelector<HTMLElement>('header');
    const shellRect = shell?.getBoundingClientRect();
    const inputRect = input?.getBoundingClientRect();
    const headerRect = header?.getBoundingClientRect();
    return {
      shellTop: shellRect?.top,
      shellHeight: shellRect?.height,
      inputBottom: inputRect?.bottom,
      headerTop: headerRect?.top,
      headerBottom: headerRect?.bottom,
      scrollY: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });

  expect(reduced.shellTop).toBeCloseTo(12, 0);
  expect(reduced.shellHeight).toBeCloseTo(460, 0);
  expect(reduced.inputBottom).toBeLessThanOrEqual(472);
  expect(reduced.headerTop).toBeGreaterThanOrEqual(12);
  expect(reduced.headerBottom).toBeLessThanOrEqual(472);
  expect(reduced.scrollY).toBe(0);
  expect(reduced.scrollHeight).toBeLessThanOrEqual(844);

  await page.evaluate(() => {
    window.__setMockVisualViewport?.({ height: 390, offsetTop: 0 });
  });
  await expect(shell).toHaveAttribute("data-keyboard-active", "true");
  await expect(input).toBeVisible();

  await page.evaluate(() => {
    window.__setMockVisualViewport?.({ height: 844, offsetTop: 0 });
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await expect(shell).toHaveAttribute("data-keyboard-active", "false");
  await expect(input).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("constrains Caribbean detail between the prompt and answer dock", async ({
  page,
}) => {
  await openFresh(page);
  await openQuizSetup(page);
  await visible(page.getByRole("button", { name: "North America 23 countries" })).click();
  await visible(page.getByRole("button", { name: /Identify Name/ })).click();
  await visible(page.getByRole("button", { name: "Start Quiz" })).click();

  const shell = page.getByTestId("quiz-shell");
  const input = visible(page.getByRole("textbox"));
  await input.focus();
  await page.evaluate(() => {
    window.__setMockVisualViewport?.({ height: 430, offsetTop: 0 });
  });
  await expect(shell).toHaveAttribute("data-keyboard-active", "true");

  const panel = page.getByRole("region", { name: "Caribbean detail map" });
  const close = page.getByRole("button", { name: "Minimize Caribbean detail map" });
  const open = page.getByRole("button", { name: "Open Caribbean detail map" });
  if (await open.isVisible()) {
    await page.evaluate(() => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Open Caribbean detail map"]')
        ?.click();
    });
  }
  await expect(panel).toBeVisible();
  await expect(close).toBeVisible();

  const boxes = await page.evaluate(() => {
    const rect = (selector: string) =>
      document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
    return {
      target: rect("aside[aria-label='Target prompt']"),
      panel: rect("aside[aria-label='Caribbean detail map']"),
      region: Array.from(document.querySelectorAll("button")).find((button) =>
        button.textContent?.includes("Regions · North America"),
      )?.getBoundingClientRect(),
      input: rect("#country-guess"),
    };
  });

  expect(boxes.panel).not.toBeUndefined();
  expect(boxes.target).not.toBeUndefined();
  expect(boxes.region).not.toBeUndefined();
  expect(boxes.input).not.toBeUndefined();
  expect(boxes.panel?.top ?? 0).toBeGreaterThanOrEqual((boxes.target?.bottom ?? 0) - 1);
  expect(boxes.panel?.bottom ?? 9999).toBeLessThanOrEqual((boxes.region?.top ?? 0) + 1);
  expect(boxes.panel?.bottom ?? 9999).toBeLessThanOrEqual((boxes.input?.top ?? 0) + 1);
});

declare global {
  interface Window {
    __setMockVisualViewport?: (next: {
      width?: number;
      height?: number;
      offsetTop?: number;
      offsetLeft?: number;
      scale?: number;
    }) => void;
  }
}
