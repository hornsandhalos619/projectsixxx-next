import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AffiliateDisclosure, AMAZON_ASSOCIATE_LINE } from "../components/AffiliateDisclosure";
import {
  AMAZON_TAG,
  TIER_CHECKED_AT,
  TIER_DEFS,
  amazonLink,
  amazonPicks,
  amazonSections,
  tierIdForPrice,
} from "../config/amazon-page";
import { primaryNav } from "../config/site";
import { publishedGuides } from "./guides";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const REMOVED_ASINS = ["091386613X", "B0BXHHFQLL", "B0771RKRBW", "B0GXV18FQ3"] as const;
const FORBIDDEN = /\b(tarot|christmas|christian|nativity|advent|xmas)\b/i;
const AMAZON_HOST = /amazon\.com/i;

async function main() {
  const asins = amazonSections.flatMap((section) => section.picks.map((pick) => pick.asin));
  const UNPRICED_ASINS = ["B074274RH9", "B0105VZ4GI", "0345337662"] as const;
  for (const asin of REMOVED_ASINS) {
    assert.ok(!asins.includes(asin), `amazon-page must not list removed ASIN ${asin}`);
  }
  for (const asin of UNPRICED_ASINS) {
    assert.ok(!asins.includes(asin), `picks.md recorded no price for ${asin}; omit from budget tiers`);
  }
  assert.ok(amazonSections.length >= 1, "amazon page must keep its sections");
  for (const section of amazonSections) {
    assert.ok(section.picks.length >= 1, `${section.id} must keep remaining picks`);
  }
  assert.ok(!amazonSections.some((section) => section.id === "100-and-up"), "empty $100 and up tier must be omitted");
  assert.equal(TIER_CHECKED_AT, "2026-10-16");
  for (const pick of amazonPicks) {
    assert.equal(pick.checkedAt, TIER_CHECKED_AT, `${pick.asin} needs a checkedAt date`);
    assert.equal(typeof pick.tierPrice, "number");
    assert.ok(Number.isFinite(pick.tierPrice), `${pick.asin} needs a finite tierPrice`);
    const expected = tierIdForPrice(pick.tierPrice);
    const home = amazonSections.find((section) => section.picks.some((item) => item.asin === pick.asin));
    assert.equal(home?.id, expected, `${pick.asin} must sit in the lowest tier ${expected}`);
    const tier = TIER_DEFS.find((item) => item.id === expected);
    assert.ok(tier);
    if (expected === "100-and-up") {
      assert.ok(pick.tierPrice >= 100, `${pick.asin} $100 and up must be >= 100`);
    } else {
      assert.ok(pick.tierPrice < tier.max, `${pick.asin} must fit ${tier.title}`);
      const lower = TIER_DEFS.find((item) => item.max < tier.max && pick.tierPrice < item.max);
      assert.equal(lower, undefined, `${pick.asin} must use the lowest fitting tier`);
    }
  }

  assert.equal(AMAZON_TAG, "hornsandhal0b-20");
  const configSource = readFileSync(join(root, "config/amazon-page.ts"), "utf8");
  assert.ok(configSource.includes('export const AMAZON_TAG = "hornsandhal0b-20"'));
  assert.ok(
    configSource.includes("amazonLink") && configSource.includes("${AMAZON_TAG}"),
    "amazon links must be built from AMAZON_TAG",
  );
  for (const asin of asins) {
    const href = amazonLink(asin);
    const parsed = new URL(href);
    assert.equal(parsed.searchParams.get("tag"), AMAZON_TAG, `${asin} must carry the house tag`);
  }

  const disclosureHtml = renderToStaticMarkup(createElement(AffiliateDisclosure));
  assert.ok(disclosureHtml.includes(AMAZON_ASSOCIATE_LINE), "disclosure must render the Amazon Associate line");
  assert.ok(disclosureHtml.includes('class="ftc"'), "disclosure must use existing .ftc type");

  const pageSource = readFileSync(join(root, "app/picks/page.tsx"), "utf8");
  assert.ok(pageSource.includes("<h1>Six Picks</h1>"), "/picks headline must be Six Picks");
  assert.ok(pageSource.includes('title: "Six Picks"'), "/picks metadata title must be Six Picks");
  assert.ok(!pageSource.includes("Horns &amp; Halos on Amazon"), "old /picks headline must be gone");
  assert.ok(pageSource.includes("AffiliateDisclosure"), "/picks must mount the affiliate disclosure");
  assert.ok(pageSource.includes("amazonLink(p.asin)"), "/picks must build doors from amazonLink");
  assert.ok(pageSource.includes('rel="sponsored nofollow"'), "/picks outbound doors must use rel=sponsored nofollow");
  assert.ok(!pageSource.includes("noopener"), "/picks affiliate rel must be sponsored nofollow only");
  assert.ok(
    pageSource.includes("Check today&apos;s price"),
    "/picks must keep Check today's price on each item",
  );

  const PRICE_MARK = /\$\s*\d|\d+\s*(?:dollars?|usd|bucks)\b|~\s*\$|about\s+\$|around\s+\$|under\s+\$/i;
  const ALLOWED_TIER_IDS = new Set(TIER_DEFS.map((tier) => tier.id));
  const userCopy = amazonSections.flatMap((section) => [
    section.dek,
    ...section.picks.flatMap((pick) => [pick.name, pick.note, pick.lane, pick.theme]),
  ]);
  for (const field of userCopy) {
    assert.ok(!field.includes("$"), `picks copy must not include $: ${field}`);
    assert.ok(!PRICE_MARK.test(field), `picks copy must not include a per-item price: ${field}`);
  }
  for (const section of amazonSections) {
    assert.ok(ALLOWED_TIER_IDS.has(section.id), `unexpected tier id ${section.id}`);
    assert.ok(
      (pageSource.match(/className="grid-2 picks-grid"/g) ?? []).length >= 1,
      "/picks must use the same picks-grid in every tier",
    );
  }
  assert.ok(!pageSource.includes("tierPrice"), "/picks must not render tierPrice");
  assert.ok(!pageSource.includes("checkedAt"), "/picks must not render checkedAt");
  assert.equal(new Set(amazonSections.map((section) => section.id)).size, amazonSections.length);

  const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.ok(
    nextConfig.includes('source: "/amazon"') &&
      nextConfig.includes('destination: "/picks"') &&
      nextConfig.includes("permanent: true"),
    "/amazon must permanently redirect to /picks",
  );

  const guides = publishedGuides();
  assert.equal(guides.length, 3, "three editorial guides must publish");
  const slugs = new Set(guides.map((guide) => guide.slug));
  assert.ok(slugs.has("halloween-samhain-guide"));
  assert.ok(slugs.has("choose-your-side-holiday-guide"));
  assert.ok(slugs.has("gothic-reading-comparison"));

  for (const guide of guides) {
    const blob = `${guide.title}\n${guide.description}\n${guide.content}`;
    assert.ok(!AMAZON_HOST.test(blob), `${guide.slug} must not contain amazon.com links`);
    assert.ok(!FORBIDDEN.test(blob), `${guide.slug} must not contain tarot, Christian, or Christmas copy`);
    assert.ok(!blob.includes("$"), `${guide.slug} must not include $ or per-item prices`);
    assert.ok(!PRICE_MARK.test(blob), `${guide.slug} must not include a per-item price`);
    for (const asin of REMOVED_ASINS) {
      assert.ok(!blob.includes(asin), `${guide.slug} must not mention removed ASIN ${asin}`);
    }
    const links = [...guide.content.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
    assert.ok(links.length >= 1, `${guide.slug} must link to a picks section`);
    for (const href of links) {
      assert.ok(
        /^\/picks#(under-10|under-25|under-50|under-75|under-100|100-and-up)$/.test(href),
        `${guide.slug} outbound editorial links must be /picks#<tier>, got ${href}`,
      );
    }
  }

  const nav = readFileSync(join(root, "config/site.ts"), "utf8");
  assert.ok(!primaryNav.some((item) => item.href === "/picks" || item.href === "/amazon"), "primary nav must not add Amazon");
  assert.ok(!nav.includes('href: "/guides"'), "primary nav must not add Guides");

  const footer = readFileSync(join(root, "components/Footer.tsx"), "utf8");
  assert.ok(footer.includes('href="/picks">Amazon</Link>'), "footer keeps a small Amazon link to /picks");
  assert.ok(footer.includes("AMAZON_ASSOCIATE_LINE"), "footer shows the disclosure next to the Amazon link");

  const guidePage = readFileSync(join(root, "app/guides/[slug]/page.tsx"), "utf8");
  assert.ok(guidePage.includes('href="/picks"'), "guide pages keep the /guides/[slug] route and point at /picks");

  console.log("amazon page + dark gift guides ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
