import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXCLUDED_TAPESTRY_HANDLES,
  FLAGGED_TAPESTRY_HANDLES,
  TAPESTRY_COPY,
  landingCopy,
  listTapestryLandingsFrom,
  pickHeroImage,
  relatedTapestries,
  tapestryBuyUrl,
  tapestryCollectionLandingUrl,
  tapestryLandingPath,
  type CrestTapestryProduct,
} from "./tapestry-drop";

function product(
  handle: string,
  extras: Partial<CrestTapestryProduct> = {},
): CrestTapestryProduct {
  return {
    title: `Title for ${handle}`,
    handle,
    published_at: "2026-11-08T20:48:21-08:00",
    variants: [{ price: "48.00", available: true }],
    images: [{ src: `https://cdn.shopify.com/s/files/1/x/${handle}.jpg` }],
    ...extras,
  };
}

const raven = "horns-halos-crest-tapestry-iv-the-raven-moon";
const fallen = "horns-halos-crest-tapestry-i-the-fallen-and-the-crowned";
const reliquary = "horns-halos-crest-tapestry-v-the-cathedral-reliquary";
const wyrms = "horns-halos-crest-tapestry-ii-the-cathedral-of-wyrms";
const storm = "project-sixxx-crest-tapestry-ii-the-storm-wyrm";
const blood = "project-sixxx-crest-tapestry-iv-the-blood-moon";
const stair = "project-sixxx-crest-tapestry-ix-the-endless-stair";

const buy = tapestryBuyUrl(raven);
assert.equal(tapestryLandingPath(raven), `/drop/${raven}`);
assert.ok(buy.startsWith("https://hornshalosshop.myshopify.com/products/"));
assert.ok(buy.includes(`/products/${raven}`));
assert.ok(buy.includes("utm_source=projectsixxx"));
assert.ok(buy.includes("utm_medium=referral"));
assert.ok(buy.includes("utm_campaign=tapestry-drop"));
assert.ok(buy.includes(`utm_content=landing-${raven}`));

const collection = tapestryCollectionLandingUrl("landing-index");
assert.ok(collection.includes("/collections/crest-tapestries"));
assert.ok(collection.includes("utm_campaign=tapestry-drop"));

const hero = pickHeroImage({
  title: "Unicorn",
  handle: "horns-halos-crest-tapestry-iii-the-unicorn-and-the-goat-king",
  images: [
    { src: "https://cdn.shopify.com/s/files/1/x/indoor-wall-tapestry.jpg" },
    { src: "https://cdn.shopify.com/s/files/1/x/inroom-hh-crest-3.jpg" },
  ],
});
assert.ok(hero.src.includes("inroom-hh-crest-3"));

const fallbackHero = pickHeroImage({
  title: "Raven Moon",
  handle: raven,
  images: [{ src: "https://cdn.shopify.com/s/files/1/x/indoor-wall-tapestry-raven.jpg" }],
});
assert.ok(fallbackHero.src.includes("indoor-wall-tapestry-raven"));

const listed = listTapestryLandingsFrom([
  product(EXCLUDED_TAPESTRY_HANDLES[0]),
  product(EXCLUDED_TAPESTRY_HANDLES[1]),
  product(EXCLUDED_TAPESTRY_HANDLES[2]),
  product(fallen),
  product(reliquary),
  product(raven),
  product(wyrms),
  product(storm),
  product(blood),
  product(stair),
  product("not-a-tapestry-hoodie", { title: "Hoodie" }),
  product("project-sixxx-crest-tapestry-x-the-black-millefleur", {
    variants: [{ price: "48.00", available: false }],
  }),
]);

const slugs = listed.map((item) => item.slug);
assert.ok(slugs.includes(raven));
assert.ok(slugs.includes(fallen), "borderline Fallen and the Crowned stays listed");
assert.ok(slugs.includes(reliquary), "borderline Cathedral Reliquary stays listed");
assert.ok(!slugs.includes(EXCLUDED_TAPESTRY_HANDLES[0]));
assert.ok(!slugs.includes(EXCLUDED_TAPESTRY_HANDLES[1]));
assert.ok(!slugs.includes(EXCLUDED_TAPESTRY_HANDLES[2]));
assert.ok(!slugs.includes("not-a-tapestry-hoodie"));
assert.ok(!slugs.includes("project-sixxx-crest-tapestry-x-the-black-millefleur"));
assert.equal(
  listed.find((item) => item.slug === raven)?.price,
  "$48.00",
);
assert.equal(listed.find((item) => item.slug === raven)?.series, "Horns & Halos");
assert.equal(listed.find((item) => item.slug === storm)?.series, "Project SiXXX");

for (const handle of EXCLUDED_TAPESTRY_HANDLES) {
  assert.ok(!slugs.includes(handle), `excluded ${handle} must not be listed`);
}
for (const handle of FLAGGED_TAPESTRY_HANDLES) {
  assert.ok(FLAGGED_TAPESTRY_HANDLES.includes(handle));
}

const related = relatedTapestries(listed, raven, 3);
assert.equal(related.length, 3);
assert.ok(related.every((item) => item.slug !== raven));
assert.ok(related.every((item) => item.series === "Horns & Halos"));
assert.ok(related.every((item) => !EXCLUDED_TAPESTRY_HANDLES.includes(item.slug as (typeof EXCLUDED_TAPESTRY_HANDLES)[number])));

for (const [handle, copy] of Object.entries(TAPESTRY_COPY)) {
  assert.ok(!/christmas|nativity|jesus|gospel|scripture/i.test(copy), `copy for ${handle} drifted into doctrine`);
  assert.ok(copy.split(/[.!?]/).filter(Boolean).length <= 3, `copy for ${handle} should stay short`);
  assert.equal(landingCopy(handle), copy);
}

const page = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../app/drop/[slug]/page.tsx"), "utf8");
const index = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../app/drop/page.tsx"), "utf8");
assert.ok(page.includes("Buy on the shop"));
assert.ok(page.includes('spot="home"'));
assert.ok(page.includes("summary_large_image"));
assert.ok(page.includes("FollowTheHouse"));
assert.ok(!page.includes("/pages/contact"));
assert.ok(!index.includes("/pages/contact"));
assert.ok(index.includes('spot="home"'));
assert.ok(index.includes("/drop/"));

const sitemap = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "./sitemap.ts"), "utf8");
assert.ok(sitemap.includes('"/drop"'));
assert.ok(sitemap.includes("tapestryDrop"));
assert.ok(sitemap.includes("excludedTapestryHandleSet"));

console.log(`tapestry drop landings ok (${listed.length} listed from fixture)`);
