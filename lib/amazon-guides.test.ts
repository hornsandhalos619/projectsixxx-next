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
import { getGuide, guideCanonicalUrl, guideHeading, guideJsonLd, publishedGuides } from "./guides";

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
  assert.ok(
    pageSource.includes("<h1>Horns &amp; Halos on Amazon</h1>"),
    "/picks h1 stays Horns & Halos on Amazon",
  );
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
  assert.equal(guides.length, 6, "six editorial guides must publish");
  const slugs = new Set(guides.map((guide) => guide.slug));
  assert.ok(slugs.has("halloween-samhain-guide"));
  assert.ok(slugs.has("choose-your-side-holiday-guide"));
  assert.ok(slugs.has("gothic-reading-comparison"));
  assert.ok(slugs.has("gothic-jewelry-gifts-under-50"));
  assert.ok(slugs.has("last-minute-halloween-goth-jewelry"));
  assert.ok(slugs.has("dark-aesthetic-desk-setup"));

  const jewelry = getGuide("gothic-jewelry-gifts-under-50");
  const halloween = getGuide("last-minute-halloween-goth-jewelry");
  const desk = getGuide("dark-aesthetic-desk-setup");
  assert.equal(jewelry?.title, "Best Gothic Jewelry Gifts Under $50 (2026)");
  assert.equal(jewelry?.heading, "Best Gothic Jewelry Gifts Under $50 (2026)");
  assert.equal(
    jewelry?.description,
    "Obsidian, crimson, silver and gold gothic jewelry gifts under $50. Choose your side: Horns or Halos. Check today's price on each pick.",
  );
  assert.equal(halloween?.title, "Last-Minute Halloween Goth Jewelry (Fast Shipping)");
  assert.equal(halloween?.heading, "Last-Minute Halloween Goth Jewelry");
  assert.equal(
    halloween?.description,
    "Gothic chokers, signet rings and sterling chains on a shelf that ships fast. Horns or Halos, choose fast.",
  );
  assert.equal(desk?.title, "Dark Aesthetic Desk Setup Guide (2026)");
  assert.equal(desk?.heading, "Dark Aesthetic Desk Setup Guide");
  assert.equal(
    desk?.description,
    "Build an obsidian and crimson desk: a black desk mat, a black mechanical keyboard, a glass chess set and black candelabra flame, plus a silver and gold Halos variant.",
  );

  const PRICE_LOCKED_SLUGS = new Set([
    "gothic-jewelry-gifts-under-50",
    "last-minute-halloween-goth-jewelry",
    "dark-aesthetic-desk-setup",
  ]);

  for (const guide of guides) {
    const blob = `${guide.title}\n${guide.description}\n${guide.content}`;
    assert.ok(!AMAZON_HOST.test(blob), `${guide.slug} must not contain amazon.com links`);
    assert.ok(!FORBIDDEN.test(blob), `${guide.slug} must not contain tarot, Christian, or Christmas copy`);
    assert.ok(!guide.content.includes("$"), `${guide.slug} body must not include $ or per-item prices`);
    assert.ok(!PRICE_MARK.test(guide.content), `${guide.slug} body must not include a per-item price`);
    if (guide.slug !== "gothic-jewelry-gifts-under-50") {
      assert.ok(!guide.title.includes("$"), `${guide.slug} title must not include $`);
      assert.ok(!PRICE_MARK.test(guide.title), `${guide.slug} title must not include a per-item price`);
      assert.ok(!guide.description.includes("$"), `${guide.slug} meta must not include $`);
      assert.ok(!PRICE_MARK.test(guide.description), `${guide.slug} meta must not include a per-item price`);
    }
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
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(guide.date), `${guide.slug} date must be YYYY-MM-DD`);
    if (PRICE_LOCKED_SLUGS.has(guide.slug)) {
      assert.ok(
        guide.content.includes("Check today's price"),
        `${guide.slug} must say Check today's price where products are mentioned`,
      );
    }

    const jsonLd = guideJsonLd(guide);
    const types = jsonLd.map((block) => block["@type"]);
    assert.ok(types.includes("Article"), `${guide.slug} JSON-LD must include Article`);
    assert.ok(types.includes("BreadcrumbList"), `${guide.slug} JSON-LD must include BreadcrumbList`);
    const article = jsonLd.find((block) => block["@type"] === "Article");
    assert.equal(article?.headline, guideHeading(guide));
    assert.equal(article?.url, guideCanonicalUrl(guide.slug));
    const crumbs = jsonLd.find((block) => block["@type"] === "BreadcrumbList");
    const items = crumbs?.itemListElement as Array<{ item: string }>;
    assert.equal(items[items.length - 1]?.item, guideCanonicalUrl(guide.slug));
  }

  const nav = readFileSync(join(root, "config/site.ts"), "utf8");
  assert.ok(!primaryNav.some((item) => item.href === "/picks" || item.href === "/amazon"), "primary nav must not add Amazon");
  assert.ok(!nav.includes('href: "/guides"'), "primary nav must not add Guides");

  const footer = readFileSync(join(root, "components/Footer.tsx"), "utf8");
  assert.ok(footer.includes('href="/picks">Amazon</Link>'), "footer keeps a small Amazon link to /picks");
  assert.ok(footer.includes("AMAZON_ASSOCIATE_LINE"), "footer shows the disclosure next to the Amazon link");

  const guidePage = readFileSync(join(root, "app/guides/[slug]/page.tsx"), "utf8");
  assert.ok(guidePage.includes('href="/picks"'), "guide pages keep the /guides/[slug] route and point at /picks");
  assert.ok(guidePage.includes("application/ld+json"), "guide pages emit JSON-LD");
  assert.ok(guidePage.includes("guideJsonLd"), "guide pages use shared Article + BreadcrumbList JSON-LD");
  assert.ok(guidePage.includes("alternates"), "guide pages set a self-canonical");
  assert.ok(guidePage.includes("guideCanonicalUrl"), "guide canonicals are self URLs on /guides/[slug]");
  assert.ok(guidePage.includes("guideHeading"), "guide H1 uses heading with title fallback");

  const lastGrid = pageSource.lastIndexOf("picks-grid");
  const guidesBlock = pageSource.indexOf('aria-label="Guides"');
  assert.ok(lastGrid !== -1 && guidesBlock !== -1, "/picks must keep picks-grid and a Guides block");
  assert.ok(guidesBlock > lastGrid, "/picks Guides block must sit outside the affiliate card grid");
  assert.ok(pageSource.includes('href="/guides"'), "/picks Guides block links to /guides");
  assert.ok(
    pageSource.includes("`/guides/${guide.slug}`"),
    "/picks Guides block links to each published guide",
  );
  const cardSlice = pageSource.slice(
    pageSource.indexOf("section.picks.map"),
    pageSource.lastIndexOf("</article>"),
  );
  assert.ok(!cardSlice.includes("/guides"), "/picks Guides links must not live inside affiliate cards");

  console.log("amazon page + dark gift guides ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
