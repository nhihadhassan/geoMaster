import { expect, test } from "@playwright/test";

const SITE_URL = "https://geo-master-livid.vercel.app";
const DESCRIPTION =
  "Master world countries with interactive maps, geography quizzes, and focused practice.";
const SOCIAL_IMAGE_PATH = "/brand/geomaster-social.png";

test("publishes canonical, social, and structured metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    SITE_URL,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    DESCRIPTION,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "GeoMaster",
  );
  await expect(
    page.locator('meta[property="og:description"]'),
  ).toHaveAttribute("content", DESCRIPTION);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    SITE_URL,
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "GeoMaster",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `${SITE_URL}${SOCIAL_IMAGE_PATH}`,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "GeoMaster",
  );
  await expect(
    page.locator('meta[name="twitter:description"]'),
  ).toHaveAttribute("content", DESCRIPTION);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    `${SITE_URL}${SOCIAL_IMAGE_PATH}`,
  );

  const structuredDataText = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  const structuredData = JSON.parse(structuredDataText ?? "{}") as Record<
    string,
    unknown
  >;

  expect(structuredData).toMatchObject({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GeoMaster",
    url: SITE_URL,
    description: DESCRIPTION,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    inLanguage: "en",
  });
  expect(structuredData).not.toHaveProperty("offers");
  expect(structuredData).not.toHaveProperty("aggregateRating");
  expect(structuredData).not.toHaveProperty("review");
  expect(structuredData).not.toHaveProperty("author");
});

test("serves a one-route sitemap, open robots policy, and exact social image", async ({
  request,
}) => {
  const robotsResponse = await request.get("/robots.txt");
  const sitemapResponse = await request.get("/sitemap.xml");
  const imageResponse = await request.get(SOCIAL_IMAGE_PATH);

  expect(robotsResponse.status()).toBe(200);
  expect(await robotsResponse.text()).toContain("Allow: /");
  expect(await robotsResponse.text()).toContain(
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  );
  expect(sitemapResponse.status()).toBe(200);

  const sitemap = await sitemapResponse.text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(1);
  expect(sitemap).toContain(`<loc>${SITE_URL}</loc>`);

  expect(imageResponse.status()).toBe(200);
  expect(imageResponse.headers()["content-type"]).toContain("image/png");

  const image = await imageResponse.body();
  expect(image.subarray(1, 4).toString("ascii")).toBe("PNG");
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(630);
});

test("renders an accessible branded 404", async ({ page }) => {
  const response = await page.goto("/not-a-real-geomaster-route");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByText("This page could not be found.", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  const returnLink = page.getByRole("link", { name: "Return to GeoMaster" });
  await expect(returnLink).toHaveAttribute("href", "/");
  await page.keyboard.press("Tab");
  await expect(returnLink).toBeFocused();
});
