import assert from "node:assert/strict";
import { isPublishedProduct, products } from "../config/affiliates";
import sitemap from "../app/sitemap";
import ProductPage, { generateStaticParams } from "../app/shop/[category]/[slug]/page";
import { site } from "../config/site";

const hiddenShopPaths = [
  { category: "guitars", slug: "ibanez-rg-sample" },
  { category: "synths", slug: "synth-placeholder" },
  { category: "tablets", slug: "tablet-placeholder" },
  { category: "art-supplies", slug: "art-supplies-placeholder" },
  { category: "computer-gear", slug: "computer-gear-placeholder" },
] as const;

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: string }).digest ?? "";
  const message = error instanceof Error ? error.message : "";
  return digest.includes("404") || message.includes("404") || message.includes("NEXT_NOT_FOUND");
}

async function main() {
  for (const { category, slug } of hiddenShopPaths) {
    const seed = products.find((product) => product.category === category && product.slug === slug);
    assert.ok(seed, `seed must keep ${slug}`);
    assert.equal(seed.published, false, `${slug} must stay unpublished until a live SKU lands`);
    assert.equal(isPublishedProduct(seed), false);
  }

  assert.ok(
    products.some((product) => product.slug === "line-6-helix-lt" && isPublishedProduct(product)),
    "Helix LT stays on the public shop",
  );
  assert.ok(
    products.some((product) => product.slug === "line-6-stadium-xl" && isPublishedProduct(product)),
    "Stadium XL stays on the public shop",
  );

  const staticParams = generateStaticParams();
  for (const { slug } of hiddenShopPaths) {
    assert.ok(
      !staticParams.some((param) => param.slug === slug),
      `generateStaticParams must omit ${slug}`,
    );
  }

  const entries = await sitemap();
  const urls = entries.map((item) => item.url);
  for (const { category, slug } of hiddenShopPaths) {
    const path = `/shop/${category}/${slug}`;
    assert.ok(
      !urls.some((url) => url === `${site.url}${path}` || url.startsWith(`${site.url}${path}/`)),
      `sitemap must not list ${path}`,
    );
  }
  assert.ok(urls.includes(`${site.url}/library/est-in-darkness/sample`));
  assert.ok(urls.includes(`${site.url}/shop/guitars/line-6-helix-lt`));
  assert.ok(urls.includes(`${site.url}/shop/guitars/line-6-stadium-xl`));

  for (const { category, slug } of hiddenShopPaths) {
    try {
      await ProductPage({ params: Promise.resolve({ category, slug }) });
      throw new Error(`expected notFound for /shop/${category}/${slug}`);
    } catch (error) {
      assert.ok(isNotFound(error), `/shop/${category}/${slug} must notFound, got ${String(error)}`);
    }
  }

  console.log("public shop placeholders hidden ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
