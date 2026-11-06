import assert from "node:assert/strict";
import { selectLaneProducts } from "./horns-halos-shop";
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
console.log("Explicit product identity and lane separation passed.");
