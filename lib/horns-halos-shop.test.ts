import assert from "node:assert/strict";
import { HH_FULL_SHOP_URL, HH_REFUND_POLICY_URL, selectLaneProducts, taggedProductUrl } from "./horns-halos-shop";
import { readFileSync } from "node:fs";

const snapshot = readFileSync(new URL("./__fixtures__/release-001-products.json", import.meta.url), "utf8");
const catalog = JSON.parse(snapshot).products;
const horns = selectLaneProducts(catalog, "horns");
const halos = selectLaneProducts(catalog, "halos");
assert.deepEqual(horns.map((p) => p.handle), ["infinite-conflict"]);
assert.deepEqual(halos.map((p) => p.handle), ["eternal-balance", "unbroken", "brilliance"]);
assert.ok(halos.every((product) => product.url.match(/^https:\/\/hornshalosshop.myshopify.com\/products\//)));
assert.ok([...horns, ...halos].every((product) => product.image === undefined));
assert.ok(!horns.some((product) => product.handle === "unbroken"));
assert.ok(!halos.some((product) => product.handle === "infinite-conflict"));

const rawUrl = (handle: string) => `https://hornshalosshop.myshopify.com/products/${handle}`;
const expectedTag = (handle: string, lane: "horns" | "halos", spot: "card" | "guide") =>
  `${rawUrl(handle)}?utm_source=projectsixxx&utm_medium=referral&utm_campaign=release-001&utm_content=${lane}-${spot}`;

assert.equal(horns[0].url, rawUrl("infinite-conflict"));
assert.deepEqual(halos.map((product) => product.url), [
  rawUrl("eternal-balance"),
  rawUrl("unbroken"),
  rawUrl("brilliance"),
]);
assert.ok([...horns, ...halos].every((product) => !product.url.includes("utm_")));

for (const product of horns) {
  assert.equal(taggedProductUrl(product.url, "horns", "card"), expectedTag(product.handle, "horns", "card"));
  assert.equal(taggedProductUrl(product.url, "horns", "guide"), expectedTag(product.handle, "horns", "guide"));
  assert.equal(product.url, rawUrl(product.handle));
}
for (const product of halos) {
  assert.equal(taggedProductUrl(product.url, "halos", "card"), expectedTag(product.handle, "halos", "card"));
  assert.equal(taggedProductUrl(product.url, "halos", "guide"), expectedTag(product.handle, "halos", "guide"));
  assert.equal(product.url, rawUrl(product.handle));
}

assert.equal(HH_FULL_SHOP_URL, "https://hornshalosshop.myshopify.com/collections/all");
assert.equal(HH_REFUND_POLICY_URL, "https://hornshalosshop.myshopify.com/policies/refund-policy");
assert.equal(new URL(HH_FULL_SHOP_URL).search, "");
assert.equal(new URL(HH_REFUND_POLICY_URL).search, "");
assert.ok(!HH_FULL_SHOP_URL.includes("utm_"));
assert.ok(!HH_REFUND_POLICY_URL.includes("utm_"));

console.log("Explicit product identity and lane separation passed.");
console.log("UTM tagging for card and guide spots passed; raw product, refund, and full-shop URLs stay untagged.");
