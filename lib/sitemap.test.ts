import assert from "node:assert/strict";
import { journalTaxonomy, site } from "../config/site";
import { shopCategories } from "../config/affiliates";
import {
  buildSitemap,
  coreSitemapEntries,
  isValidSitemapEntry,
  SITEMAP_CORE_PATHS,
} from "./sitemap";

function throwSync(label: string): () => never {
  return () => {
    throw new Error(`${label} exploded synchronously`);
  };
}

function urlsOf(entries: Awaited<ReturnType<typeof buildSitemap>>): string[] {
  return entries.map((item) => item.url);
}

function coreUrls(): string[] {
  return [
    ...SITEMAP_CORE_PATHS.map((path) => (path === "/" ? site.url : `${site.url}${path}`)),
    ...journalTaxonomy.map((category) => `${site.url}/journal/${category}`),
    ...shopCategories.map((category) => `${site.url}/shop/${category.slug}`),
  ];
}

async function main() {
  const entries = await buildSitemap({
    journal: throwSync("journal"),
    overmind: throwSync("overmind"),
    library: throwSync("library"),
    gallery: throwSync("gallery"),
    affiliates: throwSync("affiliates"),
  });
  const urls = urlsOf(entries);

  for (const url of coreUrls()) {
    assert.ok(urls.includes(url), `core sitemap missing ${url} when every source throws`);
  }

  assert.equal(urls.length, coreUrls().length, "throwing sources must not add live-derived urls");
  assert.ok(entries.every(isValidSitemapEntry), "every fallback entry needs a string url and valid Date");
  assert.equal(new Set(urls).size, urls.length, "fallback urls must be unique");

  const core = coreSitemapEntries();
  assert.ok(core.every(isValidSitemapEntry));
  assert.ok(core.length >= SITEMAP_CORE_PATHS.length);

  const mixed = await buildSitemap({
    journal: () => {
      throw new Error("journal sync");
    },
    overmind: () => [
      { slug: "ok-overmind", date: "2024-02-02" },
      { slug: undefined, date: "not-a-date" },
      { slug: "BAD SLUG", date: "2024-02-02" },
    ],
    library: () => ({ not: "an-array" }),
    gallery: () => [{ slug: "house-artist" }, { slug: "" }, null, "nope"],
    affiliates: () => {
      throw new Error("affiliates sync");
    },
  });
  const mixedUrls = urlsOf(mixed);
  for (const url of coreUrls()) {
    assert.ok(mixedUrls.includes(url), `mixed sitemap missing core ${url}`);
  }
  assert.ok(mixedUrls.includes(`${site.url}/overmind/journal/ok-overmind`));
  assert.ok(mixedUrls.includes(`${site.url}/gallery/house-artist`));
  assert.ok(!mixedUrls.includes(`${site.url}/overmind/journal/BAD SLUG`));
  assert.ok(mixed.every(isValidSitemapEntry), "garbage live rows must not emit invalid entries");

  console.log(`sitemap resilience ok (${entries.length} core urls when every source throws)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
