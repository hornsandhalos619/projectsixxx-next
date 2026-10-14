import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AffiliateDisclosure, AMAZON_ASSOCIATE_LINE } from "../components/AffiliateDisclosure";
import { AMAZON_TAG, amazonLink, amazonSections } from "../config/amazon-page";
import { primaryNav } from "../config/site";
import { publishedGuides } from "./guides";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const REMOVED_ASINS = ["091386613X", "B0BXHHFQLL", "B0771RKRBW", "B0GXV18FQ3"] as const;
const FORBIDDEN = /\b(tarot|christmas|christian|nativity|advent|xmas)\b/i;
const AMAZON_HOST = /amazon\.com/i;

async function main() {
  const asins = amazonSections.flatMap((section) => section.picks.map((pick) => pick.asin));
  for (const asin of REMOVED_ASINS) {
    assert.ok(!asins.includes(asin), `amazon-page must not list removed ASIN ${asin}`);
  }
  assert.ok(amazonSections.length >= 1, "amazon page must keep its sections");
  for (const section of amazonSections) {
    assert.ok(section.picks.length >= 1, `${section.id} must keep remaining picks`);
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
  assert.ok(pageSource.includes("AffiliateDisclosure"), "/picks must mount the affiliate disclosure");
  assert.ok(pageSource.includes("amazonLink(p.asin)"), "/picks must build doors from amazonLink");
  assert.ok(pageSource.includes('rel="sponsored nofollow"'), "/picks outbound doors must use rel=sponsored nofollow");
  assert.ok(!pageSource.includes("noopener"), "/picks affiliate rel must be sponsored nofollow only");

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
    for (const asin of REMOVED_ASINS) {
      assert.ok(!blob.includes(asin), `${guide.slug} must not mention removed ASIN ${asin}`);
    }
    const links = [...guide.content.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
    assert.ok(links.length >= 1, `${guide.slug} must link to a picks section`);
    for (const href of links) {
      assert.ok(
        href.startsWith("/picks#"),
        `${guide.slug} outbound editorial links must be /picks#<section>, got ${href}`,
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
