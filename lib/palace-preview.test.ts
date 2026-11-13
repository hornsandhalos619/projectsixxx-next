import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

const glbPath = join(root, "public/palace/palace.glb");
const glb = readFileSync(glbPath);
assert.equal(glb.subarray(0, 4).toString("utf8"), "glTF", "palace.glb must be a binary glTF");
assert.ok(statSync(glbPath).size > 1_000_000, "palace.glb should be the meshopt model");

const catalog = JSON.parse(read("public/palace/palace-hotspots.json")) as {
  shop?: string;
  palace_2d_url?: string;
  hotspots?: { hotspot_id?: string }[];
};
assert.equal(typeof catalog.shop, "string");
assert.equal(typeof catalog.palace_2d_url, "string");
assert.ok(catalog.palace_2d_url?.includes("/pages/palace-of-wonders"));
assert.ok(Array.isArray(catalog.hotspots), "hotspots catalog must be an array, even when product data lives on the model");
assert.ok(catalog.hotspots.every((spot) => typeof spot.hotspot_id === "string" && spot.hotspot_id));

const viewer = read("public/palace/palace.js");
assert.match(viewer, /['"]\/palace\/palace\.glb['"]/);
assert.match(viewer, /['"]\/palace\/palace-hotspots\.json['"]/);
assert.match(viewer, /prefers-reduced-motion:\s*reduce/);
assert.match(viewer, /hotspot_id/);
assert.match(viewer, /palace_2d_url/);
assert.match(viewer, /NoToneMapping/);
assert.match(viewer, /interactive === 'door'/);
assert.match(viewer, /cam_pos/);

const html = read("public/palace/index.html");
assert.match(html, /href="\/palace\/palace\.css"/);
assert.match(html, /src="\/palace\/palace\.js"/);
assert.match(html, /noindex/);

const page = read("app/palace/page.tsx");
assert.match(page, /src="\/palace\/index\.html"/);
assert.match(page, /index:\s*false/);

const nextConfig = read("next.config.ts");
assert.match(nextConfig, /source:\s*"\/pages\/palace-of-wonders"/);
assert.match(nextConfig, /destination:\s*"\/palace"/);

assert.doesNotMatch(read("config/site.ts"), /\/palace/);
assert.doesNotMatch(read("app/page.tsx"), /\/palace/);
assert.doesNotMatch(read("components/Header.tsx"), /\/palace/);
assert.doesNotMatch(read("components/Footer.tsx"), /\/palace/);
