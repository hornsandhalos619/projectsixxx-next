import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { shopCategories } from "../config/affiliates";
import { visibleOutboundShops, type OutboundShop } from "../config/shops";
import React from "react";
import ShopPage, { metadata as shopMetadata } from "../app/shop/page";
import { ShopCategoryTiles } from "../components/ShopCategoryTiles";
import { TeeEditorial } from "../components/TeeEditorial";
import {
  SHOPIFY_PRODUCTS_JSON,
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
    title: "Fifth Light",
    handle: "fifth-light",
    product_type: "T-Shirt",
    tags: ["Halos"],
    body_html: "<p>Black tee.</p>",
    variants: [{ price: "35.00" }],
    images: [{ src: "https://cdn.shopify.com/fifth-light.jpg", alt: "Fifth Light listing" }],
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
  assert.deepEqual(
    tees.map((tee) => tee.handle),
    ["unbroken", "eternal-balance", "brilliance", "infinite-conflict", "fifth-light"],
  );
  assert.equal(tees.length, 5, "odd live tees all stay on the grid");
  assert.ok(tees.every((tee) => tee.url.includes(`/products/${tee.handle}`)));
  assert.ok(!tees.some((tee) => tee.handle === "oculus"));
  for (const tee of tees) {
    const listing = fixture.find((product) => product.handle === tee.handle);
    assert.equal(tee.image, listing?.images?.[0]?.src, `${tee.handle} uses the listing first image`);
    assert.ok(!tee.image.includes("/brand/"), `${tee.handle} uses the Shopify listing image`);
  }
  assert.equal(tees[4]?.imageAlt, "Fifth Light listing");
  assert.equal(tees[0]?.imageAlt, "Unbroken");

  const odd = selectShopifyTees(fixture.slice(0, 3));
  assert.equal(odd.length, 3, "odd -> all shown");

  const teeHtml = renderToStaticMarkup(createElement(TeeEditorial, { tees }));
  for (const tee of tees) {
    assert.ok(
      teeHtml.includes(`href="${tee.url}"`),
      `tee card must link ${tee.url}`,
    );
    assert.ok(teeHtml.includes(`/products/${tee.handle}`), `tee card must use /products/${tee.handle}`);
    assert.ok(teeHtml.includes(tee.title), `tee card must use Shopify title ${tee.title}`);
    assert.ok(teeHtml.includes(`src="${tee.image}"`), `tee card must render listing image ${tee.image}`);
  }
  assert.ok(!teeHtml.includes("Oculus"));
  assert.ok(!teeHtml.includes("Outer Horns"));

  const shopSource = readFileSync(join(root, "app/shop/page.tsx"), "utf8");
  assert.ok(!/PLACEHOLDER/i.test(shopSource), "shop page source omits PLACEHOLDER");
  assert.ok(!shopSource.includes("URL placeholder"));
  assert.ok(shopSource.includes("visibleOutboundShops"));
  assert.ok(shopSource.includes("loadShopifyTees"));

  const shopMeta = [shopMetadata.title, shopMetadata.description]
    .map((value) => (typeof value === "string" ? value : ""))
    .join("\n");
  assert.ok(!/Spreadshop/i.test(shopMeta), "shop metadata omits Spreadshop");
  (globalThis as { React?: typeof React }).React = React;
  const shopPageHtml = renderToStaticMarkup(await ShopPage());
  assert.ok(!/Spreadshop/i.test(shopPageHtml), "rendered /shop HTML omits Spreadshop");

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
  const liveCatalog = (await fetch(SHOPIFY_PRODUCTS_JSON).then((response) => response.json())) as {
    products?: ShopifyCatalogProduct[];
  };
  for (const tee of liveTees) {
    const listing = liveCatalog.products?.find((product) => product.handle === tee.handle);
    assert.ok(listing, `live catalog still lists ${tee.handle}`);
    assert.equal(
      tee.image,
      listing?.images?.[0]?.src,
      `${tee.handle} card image equals products.json images[0].src`,
    );
    assert.ok(!tee.image.includes("/brand/"), `${tee.handle} uses the Shopify listing image`);
  }

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

  const oddHtml = renderToStaticMarkup(createElement(TeeEditorial, { tees: odd }));
  assert.ok(oddHtml.includes("grid-tees"), "odd tee grid uses the centered leftover layout");
  assert.equal((oddHtml.match(/<h3/g) ?? []).length, 3);

  const css = readFileSync(join(root, "app/globals.css"), "utf8");
  assert.ok(
    /\.grid-tees\s*\{[^}]*justify-content:\s*center/.test(css),
    "tee grid centers an odd leftover row",
  );
  assert.ok(
    /\.grid-tees\s*>\s*:last-child:nth-child\(\s*odd\s*\)\s*\{[^}]*margin-inline:\s*auto/.test(css),
    "odd last tee card is centered at the same card width",
  );
  const teeSource = readFileSync(join(root, "lib/shopify-tees.ts"), "utf8");
  assert.ok(!teeSource.includes("EDITORIAL_BY_HANDLE"), "listing images come from products.json");
  assert.ok(!teeSource.includes("/brand/"), "house editorial plates stay unused");

  assert.ok(
    /\.grid-shelves\s*\{[^}]*display:\s*grid/.test(css),
    "shelf tiles use a grid so every card can stretch to one row height",
  );
  assert.ok(
    /\.grid-shelves\s*\{[^}]*align-items:\s*stretch/.test(css),
    "shelf grid stretches tiles to equal height",
  );
  assert.ok(
    /\.grid-shelves\s*>\s*\*\s*\{[^}]*height:\s*100%/.test(css),
    "shelf cards fill the grid cell",
  );
  assert.ok(
    /\.grid-shelves\s+\.card\s+h3\s*\{[^}]*white-space:\s*nowrap/.test(css),
    "shelf titles stay on one line in the five-up row",
  );
  assert.ok(
    /@media\s*\(\s*max-width:\s*1100px\s*\)\s*\{[^}]*\.grid-shelves\s*\{[^}]*grid-template-columns:\s*1fr/.test(
      css,
    ),
    "shelf grid goes from five-up to a single column",
  );

  console.log(
    `shop hub ok (${liveTees.map((tee) => tee.title).join(" / ")}; ${shopCategories.length} shelves)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
