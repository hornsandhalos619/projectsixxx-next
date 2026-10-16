import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { amazonSections } from "../config/amazon-page";
import { guideCanonicalUrl, guideHeading, guideJsonLd, publishedGuides } from "./guides";
import {
  SHARE_IMAGE_PATH,
  SITE_ORIGIN,
  absoluteUrl,
  picksItemListJsonLd,
  shareMetadata,
} from "./seo";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relative: string) {
  return readFileSync(join(root, relative), "utf8");
}

assert.equal(SITE_ORIGIN, "https://projectsixxx.com");
assert.ok(SHARE_IMAGE_PATH.startsWith("/brand/") || SHARE_IMAGE_PATH.startsWith("/portal/"));
assert.ok(!/amazon/i.test(SHARE_IMAGE_PATH), "share image must be house art, never Amazon");
assert.ok(existsSync(join(root, "public", SHARE_IMAGE_PATH.slice(1))), "share image must exist in /public");

const picksShare = shareMetadata("/picks");
assert.equal(picksShare.alternates?.canonical, "https://projectsixxx.com/picks");
assert.equal(picksShare.openGraph?.url, "https://projectsixxx.com/picks");
const ogImages = picksShare.openGraph?.images;
assert.ok(Array.isArray(ogImages) && ogImages.length >= 1);
const ogImage = ogImages[0];
const ogUrl = typeof ogImage === "string" ? ogImage : ogImage.url;
assert.equal(String(ogUrl), SHARE_IMAGE_PATH);
assert.ok(Array.isArray(picksShare.twitter?.images));
assert.equal(picksShare.twitter?.images?.[0], SHARE_IMAGE_PATH);

const guidesShare = shareMetadata("/guides");
assert.equal(guidesShare.alternates?.canonical, "https://projectsixxx.com/guides");
assert.equal(guidesShare.openGraph?.url, "https://projectsixxx.com/guides");

for (const guide of publishedGuides()) {
  const path = `/guides/${guide.slug}`;
  const meta = shareMetadata(path, { type: "article" });
  assert.equal(meta.alternates?.canonical, absoluteUrl(path));
  assert.equal(meta.openGraph?.url, absoluteUrl(path));
  assert.equal(meta.openGraph?.type, "article");

  const jsonLd = guideJsonLd(guide);
  const article = jsonLd.find((block) => block["@type"] === "Article");
  assert.equal(article?.headline, guideHeading(guide));
  assert.equal(article?.url, guideCanonicalUrl(guide.slug));
  assert.equal(article?.image, absoluteUrl(SHARE_IMAGE_PATH));
  assert.ok(!JSON.stringify(article).includes("amazon.com"));

  const crumbs = jsonLd.find((block) => block["@type"] === "BreadcrumbList");
  const items = crumbs?.itemListElement as Array<{ item: string }>;
  assert.equal(items[0]?.item, "https://projectsixxx.com/guides");
  assert.equal(items[1]?.item, absoluteUrl(path));
}

const itemList = picksItemListJsonLd(amazonSections);
assert.equal(itemList["@type"], "ItemList");
const blob = JSON.stringify(itemList);
assert.ok(!/"offers"/i.test(blob), "ItemList must not include offers");
assert.ok(!/"price"/i.test(blob), "ItemList must not include prices");
assert.ok(!blob.includes("$"), "ItemList must not include $");
assert.equal(
  itemList.itemListElement.length,
  amazonSections.reduce((count, section) => count + section.picks.length, 0),
);
for (const item of itemList.itemListElement) {
  assert.deepEqual(Object.keys(item).sort(), ["@type", "name", "position", "url"]);
  assert.equal(item["@type"], "ListItem");
  assert.equal(typeof item.name, "string");
  assert.ok(item.name.length > 0);
  assert.equal(typeof item.url, "string");
  assert.ok(item.url.startsWith("https://"));
}

const picksPage = read("app/picks/page.tsx");
const guidesPage = read("app/guides/page.tsx");
const guidePage = read("app/guides/[slug]/page.tsx");

assert.ok(picksPage.includes('shareMetadata("/picks"'), "/picks must set per-page share metadata");
assert.ok(picksPage.includes("picksItemListJsonLd"), "/picks must mount ItemList JSON-LD");
assert.ok(picksPage.includes("<h1>Horns &amp; Halos on Amazon</h1>"), "/picks h1 is unchanged");
assert.ok(!picksPage.includes("tier.title"), "/picks still renders section.title for tiers");

assert.ok(guidesPage.includes('shareMetadata("/guides"'), "/guides must set per-page share metadata");
assert.ok(guidePage.includes("guideJsonLd"), "guide pages mount Article + BreadcrumbList JSON-LD");
assert.ok(guidePage.includes("guideCanonicalUrl"), "guide pages keep a self-canonical");
assert.ok(guidePage.includes('type: "article"'), "guide pages mark og type article");

const sitemapSource = read("lib/sitemap.ts");
for (const guide of publishedGuides()) {
  assert.ok(
    sitemapSource.includes(`"/guides/${guide.slug}"`),
    `sitemap core paths must include /guides/${guide.slug}`,
  );
}

console.log("picks + guides technical SEO ok");
