import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AMAZON_ASSOCIATE_TAG,
  FOUNDER_PICK_SLUG,
  isFounderPick,
  isPublishedProduct,
  products,
  productsIn,
  publishedProducts,
  ZZOUNDS_AFFILIATE_BASE,
} from "../config/affiliates";
import sitemap from "../app/sitemap";
import ProductPage, { generateStaticParams } from "../app/shop/[category]/[slug]/page";
import { AffiliateDisclosure, AMAZON_ASSOCIATE_LINE } from "../components/AffiliateDisclosure";
import { isValidSlug } from "./cms/slug";
import { site } from "../config/site";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const hiddenShopPaths = [
  { category: "guitars", slug: "ibanez-rg-sample" },
  { category: "synths", slug: "synth-placeholder" },
  { category: "tablets", slug: "tablet-placeholder" },
  { category: "art-supplies", slug: "art-supplies-placeholder" },
  { category: "computer-gear", slug: "computer-gear-placeholder" },
] as const;

const HELIX_LT_FOUNDER_COPY =
  "I owned this for years, cleaner than the full HELIX, less unused ports on the back. It's amazing — hands down one of the greatest tone control units ever made for electric guitar. A wonderful start before you get your hands on the Stadium HX.";

const STADIUM_XL_FOUNDER_COPY =
  "This is literally the finest addition to my arsenal ever created. As if the Helix ever came short (which it NEVER DID) the Stadium literally rocks my socks off. Tremendous depth, clarity, punch, everything was refined to the utmost. I play a 9 string and my sound got a little muddy (I admit it) when I play her bottom end. The Stadium took that MUD and turned into clean THUD. It was like night and day. OMGZ. I can't tell you what that does for my tone: My metal is so heavy it's unreal. Crunch... haha.... it's not crunch it's more like Pulp and Mulch. And the funk. Where is Les Claypool. I think he might appreciate this thing more than I do. And that is saying something. From the blackest metal I can summon to the most twinkling footsteps of fairies and the haunting shimmer of ethereal magick, this is the finest tone control I've ever dreamed of. You want it. Trust me. It's worth every penny.";

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: string }).digest ?? "";
  const message = error instanceof Error ? error.message : "";
  return digest.includes("404") || message.includes("404") || message.includes("NEXT_NOT_FOUND");
}

async function main() {
  assert.ok(
    (["amazon", "zzounds"] as const).every((network) =>
      products.some((product) => product.network === network),
    ),
    "catalog must include amazon and zzounds networks",
  );

  for (const { category, slug } of hiddenShopPaths) {
    const seed = products.find((product) => product.category === category && product.slug === slug);
    assert.ok(seed, `seed must keep ${slug}`);
    assert.equal(seed.published, false, `${slug} must stay unpublished until a live SKU lands`);
    assert.equal(isPublishedProduct(seed), false);
  }

  const helixLt = products.find((product) => product.slug === "line-6-helix-lt");
  const stadiumXl = products.find((product) => product.slug === "line-6-stadium-xl");
  assert.ok(helixLt && isPublishedProduct(helixLt), "Helix LT stays on the public shop");
  assert.ok(stadiumXl && isPublishedProduct(stadiumXl), "Stadium XL stays on the public shop");
  assert.equal(helixLt.dek, HELIX_LT_FOUNDER_COPY);
  assert.equal(helixLt.belief, HELIX_LT_FOUNDER_COPY);
  assert.equal(helixLt.body, HELIX_LT_FOUNDER_COPY);
  assert.equal(stadiumXl.dek, STADIUM_XL_FOUNDER_COPY);
  assert.equal(stadiumXl.belief, STADIUM_XL_FOUNDER_COPY);
  assert.equal(stadiumXl.body, STADIUM_XL_FOUNDER_COPY);

  const live = publishedProducts();
  assert.ok(live.length >= 29, `expected the founder shortlist on the public shop, got ${live.length}`);

  for (const product of live) {
    assert.ok(
      product.merchantUrl.startsWith("https://"),
      `${product.slug} needs a valid https merchantUrl`,
    );
    assert.doesNotThrow(() => new URL(product.merchantUrl), `${product.slug} merchantUrl must parse`);
    assert.equal(product.status, "live", `${product.slug} must be live`);
    assert.equal(product.published, true, `${product.slug} must be published`);
    assert.ok(isValidSlug(product.slug), `${product.slug} must be a sitemap-safe slug`);
    assert.ok(isValidSlug(product.category), `${product.category} must be a sitemap-safe slug`);

    if (product.network === "amazon" || product.merchantUrl.includes("amazon.com")) {
      const parsed = new URL(product.merchantUrl);
      assert.equal(
        parsed.searchParams.get("tag"),
        AMAZON_ASSOCIATE_TAG,
        `${product.slug} Amazon URL must carry tag=${AMAZON_ASSOCIATE_TAG}`,
      );
    }

    if (product.network === "zzounds" || product.merchantUrl.includes("zzounds.com")) {
      assert.ok(
        product.merchantUrl.includes("a--4000088"),
        `${product.slug} zZounds URL must carry a--4000088`,
      );
      assert.ok(
        product.merchantUrl.startsWith(ZZOUNDS_AFFILIATE_BASE),
        `${product.slug} must use the founder zZounds base`,
      );
    }
  }

  const computerGear = productsIn("computer-gear");
  assert.equal(computerGear[0]?.slug, FOUNDER_PICK_SLUG, "Legion 5i goes first on computer-gear");
  assert.ok(isFounderPick(computerGear[0]));
  assert.equal(computerGear[0].dek, "The machine behind the house.");
  assert.equal(computerGear[0].belief, "I built this website and every piece of content on it on my Legion 5.");
  assert.equal(computerGear[0].body, "Mine runs an i9, an RTX 5060, 64GB of RAM, and a 2TB drive.");
  assert.equal(
    computerGear[0].merchantUrl,
    "https://www.amazon.com/dp/B0FQTYSHW8?tag=hornsandhal0b-20",
  );

  const disclosureHtml = renderToStaticMarkup(createElement(AffiliateDisclosure));
  assert.ok(
    disclosureHtml.includes(AMAZON_ASSOCIATE_LINE),
    "disclosure must render the Amazon Associate line",
  );
  assert.ok(disclosureHtml.includes('class="ftc"'), "disclosure must use existing .ftc type");

  const shopSurfaces = [
    "app/shop/page.tsx",
    "app/shop/[category]/page.tsx",
    "app/shop/[category]/[slug]/page.tsx",
  ];
  for (const relative of shopSurfaces) {
    const source = readFileSync(join(root, relative), "utf8");
    assert.ok(
      source.includes("AffiliateDisclosure"),
      `${relative} must mount the affiliate disclosure`,
    );
    assert.ok(
      source.includes("sponsored nofollow noopener") || relative === "app/shop/page.tsx",
      `${relative} outbound doors keep rel=sponsored nofollow noopener when they link merchants`,
    );
  }

  const homepage = readFileSync(join(root, "app/page.tsx"), "utf8");
  for (const product of live) {
    assert.ok(!homepage.includes(product.slug), `homepage must stay free of product CTA ${product.slug}`);
    assert.ok(
      !homepage.includes(product.merchantUrl),
      `homepage must stay free of merchant URL for ${product.slug}`,
    );
  }
  assert.ok(!homepage.includes("zzounds.com"), "homepage must stay free of zZounds product doors");

  const staticParams = generateStaticParams();
  assert.equal(staticParams.length, live.length);
  for (const { slug } of hiddenShopPaths) {
    assert.ok(
      !staticParams.some((param) => param.slug === slug),
      `generateStaticParams must omit ${slug}`,
    );
  }
  for (const product of live) {
    assert.ok(
      staticParams.some((param) => param.category === product.category && param.slug === product.slug),
      `generateStaticParams must include ${product.category}/${product.slug}`,
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
  for (const product of live) {
    assert.ok(
      urls.includes(`${site.url}/shop/${product.category}/${product.slug}`),
      `sitemap must list /shop/${product.category}/${product.slug}`,
    );
  }

  for (const { category, slug } of hiddenShopPaths) {
    try {
      await ProductPage({ params: Promise.resolve({ category, slug }) });
      throw new Error(`expected notFound for /shop/${category}/${slug}`);
    } catch (error) {
      assert.ok(isNotFound(error), `/shop/${category}/${slug} must notFound, got ${String(error)}`);
    }
  }

  const productPageSource = readFileSync(join(root, "app/shop/[category]/[slug]/page.tsx"), "utf8");
  assert.ok(productPageSource.includes("AffiliateDisclosure"), "product page must render the disclosure");
  assert.ok(productPageSource.includes("Founder") && productPageSource.includes("pick"));
  assert.ok(productPageSource.includes('rel="sponsored nofollow noopener noreferrer"'));
  assert.ok(productPageSource.includes('target="_blank"'));

  console.log(`public shop catalog ok (${live.length} published, placeholders hidden)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
