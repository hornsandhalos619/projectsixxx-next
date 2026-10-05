import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { shopCategories } from "../config/affiliates";
import { visibleOutboundShops, type OutboundShop } from "../config/shops";
import { ShopCategoryTiles } from "../components/ShopCategoryTiles";
import { TeeEditorial } from "../components/TeeEditorial";
import {
  catalogPrice,
  loadShopifyTees,
  selectShopifyTees,
  shopifyProductUrl,
  type ShopifyCatalogProduct,
} from "./shopify-tees";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const fixture: ShopifyCatalogProduct[] = [
  {
    title: "Unbroken",
    handle: "unbroken",
    tags: ["Halos"],
    body_html: "<p>Black tee. Centered chest print.</p>",
    variants: [{ price: "35.00" }],
    images: [{ src: "https://cdn.shopify.com/unbroken.jpg" }],
  },
  {
    title: "Eternal Balance.",
    handle: "eternal-balance",
    tags: ["Halos"],
    body_html: "<p>Two words. One period.</p>",
    variants: [{ price: "35.00" }],
    images: [{ src: "https://cdn.shopify.com/unisex-staple-t-shirt-eternal.jpg" }],
  },
  {
    title: "Brilliance",
    handle: "brilliance",
    tags: [],
    body_html: "<p>Halos wordmark.</p>",
    variants: [{ price: "35.00" }],
    images: [{ src: "https://cdn.shopify.com/unisex-staple-t-shirt-brilliance.jpg" }],
  },
  {
    title: "Infinite Conflict.",
    handle: "infinite-conflict",
    product_type: "T-Shirt",
    tags: ["Horns", "Release 001"],
    body_html: "<p>Horns-alone slogan on the garment.</p>",
    variants: [{ price: "35.00" }],
    images: [{ src: "https://cdn.shopify.com/infinite-conflict.jpg" }],
  },
  {
    title: "Oculus",
    handle: "oculus",
    product_type: "Poster",
    tags: ["Print"],
    body_html: "<p>A wall print.</p>",
    variants: [{ price: "45.00" }],
    images: [{ src: "https://cdn.shopify.com/oculus-poster.jpg" }],
  },
];

async function main() {
  assert.equal(
    shopifyProductUrl("unbroken"),
    "https://hornshalosshop.myshopify.com/products/unbroken",
  );
  assert.equal(
    shopifyProductUrl("eternal-balance"),
    "https://hornshalosshop.myshopify.com/products/eternal-balance",
  );
  assert.equal(catalogPrice({ title: "X", handle: "x" }), null);
  assert.equal(catalogPrice({ title: "X", handle: "x", variants: [{ price: "35.00" }] }), "$35.00");

  const tees = selectShopifyTees(fixture);
  assert.equal(tees.length % 2, 0, "tee grid stays even");
  assert.deepEqual(
    tees.map((tee) => tee.handle),
    ["unbroken", "eternal-balance", "brilliance", "infinite-conflict"],
  );
  assert.ok(tees.every((tee) => tee.url.includes(`/products/${tee.handle}`)));
  assert.ok(!tees.some((tee) => tee.handle === "oculus"));

  const odd = selectShopifyTees(fixture.slice(0, 3));
  assert.equal(odd.length, 2);

  const teeHtml = renderToStaticMarkup(createElement(TeeEditorial, { tees }));
  for (const tee of tees) {
    assert.ok(
      teeHtml.includes(`href="${tee.url}"`),
      `tee card must link ${tee.url}`,
    );
    assert.ok(teeHtml.includes(`/products/${tee.handle}`), `tee card must use /products/${tee.handle}`);
    assert.ok(teeHtml.includes(tee.title), `tee card must use Shopify title ${tee.title}`);
  }
  assert.ok(!teeHtml.includes("Oculus"));
  assert.ok(!teeHtml.includes("Outer Horns"));

  const shopSource = readFileSync(join(root, "app/shop/page.tsx"), "utf8");
  assert.ok(!/PLACEHOLDER/i.test(shopSource), "shop page source omits PLACEHOLDER");
  assert.ok(!shopSource.includes("URL placeholder"));
  assert.ok(shopSource.includes("visibleOutboundShops"));
  assert.ok(shopSource.includes("loadShopifyTees"));

  const hiddenSpreadshop: OutboundShop[] = [
    {
      id: "shopify",
      title: "Shopify",
      dek: "Primary.",
      url: "https://hornshalosshop.myshopify.com/",
      cta: "Enter Shopify store",
    },
    {
      id: "spreadshop",
      title: "Spreadshop",
      dek: "Paused.",
      url: "",
      cta: "Open Spreadshop",
    },
  ];
  assert.deepEqual(
    visibleOutboundShops(hiddenSpreadshop).map((shop) => shop.id),
    ["shopify"],
  );

  const liveTees = await loadShopifyTees();
  assert.ok(liveTees.length > 0, "live products.json must yield apparel tees");
  assert.equal(liveTees.length % 2, 0);

  const shopHtml = renderToStaticMarkup(createElement(TeeEditorial, { tees: liveTees }));
  assert.ok(!/PLACEHOLDER/i.test(shopHtml), "rendered /shop tee editorial omits PLACEHOLDER");
  assert.ok(!shopHtml.includes("URL placeholder"));
  for (const tee of liveTees) {
    assert.ok(
      shopHtml.includes(`/products/${tee.handle}`),
      `rendered /shop must link /products/${tee.handle}`,
    );
    assert.ok(shopHtml.includes(tee.title), `rendered /shop must use live title ${tee.title}`);
  }
  assert.ok(!shopHtml.includes("Oculus"));
  assert.ok(!shopHtml.includes("Outer Horns"));
  assert.ok(!shopHtml.includes("Open Spreadshop"));

  const tiles = renderToStaticMarkup(createElement(ShopCategoryTiles));
  assert.equal(shopCategories.length, 5);
  for (const category of shopCategories) {
    assert.ok(tiles.includes(category.title), `homepage tiles must include ${category.title}`);
    assert.ok(
      tiles.includes(`/shop/${category.slug}`),
      `homepage tiles must link /shop/${category.slug}`,
    );
  }
  assert.equal((tiles.match(/<h3>/g) ?? []).length, 5);

  const home = readFileSync(join(root, "app/page.tsx"), "utf8");
  assert.ok(home.includes("ShopCategoryTiles"));
  assert.ok(!home.includes("shopTeaser"));
  assert.ok(!home.includes("shopCategories.slice"));

  console.log(
    `shop hub ok (${liveTees.map((tee) => tee.title).join(" / ")}; ${shopCategories.length} shelves)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
