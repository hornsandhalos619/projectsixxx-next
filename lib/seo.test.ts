import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { journalTaxonomy, site } from "../config/site";
import { shopCategories } from "../config/affiliates";
import robots from "../app/robots";
import sitemap from "../app/sitemap";

const layoutSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../app/layout.tsx"),
  "utf8",
);
assert.ok(
  /verification:\s*\{[\s\S]*google:\s*"gyXQTr7AzMIDkSVuWKw23dD_1QyqJ_fduppUTNMDo14"/.test(
    layoutSource,
  ),
  "root layout must export the Search Console google verification token",
);
assert.ok(
  layoutSource.includes('from "@vercel/analytics/next"'),
  "house layout must keep the Vercel Analytics mount",
);

const robotsDoc = robots();
assert.equal(site.url, "https://projectsixxx.com");
assert.equal(robotsDoc.sitemap, "https://projectsixxx.com/sitemap.xml");
assert.equal(robotsDoc.host, site.url);

const rules = Array.isArray(robotsDoc.rules) ? robotsDoc.rules[0] : robotsDoc.rules;
assert.equal(rules?.userAgent, "*");
assert.equal(rules?.allow, "/");

const disallow = Array.isArray(rules?.disallow) ? rules.disallow : [rules?.disallow];
for (const path of ["/admin", "/account", "/api", "/signin", "/signout"]) {
  assert.ok(disallow.includes(path), `robots must disallow ${path}`);
}

async function checkSitemap() {
  const entries = await sitemap();
  const urls = entries.map((item) => item.url);

  const required = [
    "https://projectsixxx.com",
    "https://projectsixxx.com/horns-and-halos",
    "https://projectsixxx.com/journal",
    "https://projectsixxx.com/library",
    "https://projectsixxx.com/gallery",
    "https://projectsixxx.com/shop",
    "https://projectsixxx.com/services",
    "https://projectsixxx.com/services/web-design",
    "https://projectsixxx.com/services/agentic-bots",
    "https://projectsixxx.com/services/b2b",
    "https://projectsixxx.com/contact",
    "https://projectsixxx.com/schedule",
    "https://projectsixxx.com/links",
    "https://projectsixxx.com/studio",
    "https://projectsixxx.com/overmind/journal",
    "https://projectsixxx.com/legal/privacy",
    "https://projectsixxx.com/legal/terms",
    "https://projectsixxx.com/journal/fine-art",
    "https://projectsixxx.com/journal/fine-art/what-makes-art-fine",
    "https://projectsixxx.com/overmind/journal/who-i-am",
    "https://projectsixxx.com/library/est-in-darkness",
    "https://projectsixxx.com/library/est-in-darkness/sample",
    "https://projectsixxx.com/gallery/project-sixxx",
    "https://projectsixxx.com/shop/guitars",
    "https://projectsixxx.com/shop/guitars/line-6-helix-lt",
  ];

  for (const url of required) {
    assert.ok(urls.includes(url), `sitemap missing ${url}`);
  }

  for (const category of journalTaxonomy) {
    assert.ok(urls.includes(`https://projectsixxx.com/journal/${category}`));
  }

  for (const category of shopCategories) {
    assert.ok(urls.includes(`https://projectsixxx.com/shop/${category.slug}`));
  }

  const blocked = [
    "/admin",
    "/account",
    "/api",
    "/signin",
    "/signout",
    "/login",
    "/manifesto",
    "/overmind/journal/soft-launch-discipline",
  ];

  for (const path of blocked) {
    assert.ok(
      !urls.some((url) => url === `${site.url}${path}` || url.startsWith(`${site.url}${path}/`)),
      `sitemap must not list ${path}`,
    );
  }

  assert.equal(new Set(urls).size, urls.length, "sitemap urls must be unique");
  assert.ok(urls.every((url) => url.startsWith("https://projectsixxx.com")));
  console.log(`seo ok (${urls.length} sitemap urls)`);
}

checkSitemap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
