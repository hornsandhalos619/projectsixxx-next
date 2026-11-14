import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

const glbPath = join(root, "public/palace/palace.glb");
const glb = readFileSync(glbPath);
assert.equal(glb.subarray(0, 4).toString("utf8"), "glTF", "palace.glb must be a binary glTF");
assert.equal(statSync(glbPath).size, 7_113_056, "palace.glb must be the v3.2 light model");

const hdPath = join(root, "public/palace/palace-hd.glb");
const hd = readFileSync(hdPath);
assert.equal(hd.subarray(0, 4).toString("utf8"), "glTF", "palace-hd.glb must be a binary glTF");
assert.equal(statSync(hdPath).size, 22_629_768, "palace-hd.glb must be the v3.2 HD model");

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
assert.match(viewer, /['"]\/palace\/palace-hd\.glb['"]/);
assert.match(viewer, /['"]\/palace\/palace-hotspots\.json['"]/);
assert.match(viewer, /get\('hd'\)/);
assert.match(viewer, /q === '1'/);
assert.match(viewer, /q === '0'/);
assert.match(viewer, /prefers-reduced-motion:\s*reduce/);
assert.match(viewer, /hotspot_id/);
assert.match(viewer, /palace_2d_url/);
assert.match(viewer, /NoToneMapping/);
assert.match(viewer, /logarithmicDepthBuffer:\s*true/);
assert.match(viewer, /0\.25,\s*300/);
assert.match(viewer, /THREE\.FrontSide/);
assert.match(viewer, /anisotropy/);
assert.match(viewer, /emberFrag/);
assert.match(viewer, /interactive === 'door'/);
assert.match(viewer, /cam_pos/);
assert.match(viewer, /id="joy"|getElementById\('joy'\)/);
assert.match(viewer, /stick\.y = -dy/);
assert.doesNotMatch(viewer, /window\.__palace/);

const html = read("public/palace/index.html");
assert.match(html, /href="\/palace\/palace\.css"/);
assert.match(html, /src="\/palace\/palace\.js"/);
assert.match(html, /noindex/);
assert.match(html, /id="joy"/);
assert.match(read("public/palace/palace.css"), /#joy\{position:fixed;right:calc\(24px/);

const page = read("app/palace/page.tsx");
assert.match(page, /\/palace\/index\.html\?hd=/);
assert.match(page, /index\.html/);
assert.match(page, /index:\s*false/);

const nextConfig = read("next.config.ts");
assert.match(nextConfig, /source:\s*"\/pages\/palace-of-wonders"/);
assert.match(nextConfig, /destination:\s*"\/palace"/);

assert.doesNotMatch(read("config/site.ts"), /\/palace/);
assert.doesNotMatch(read("app/page.tsx"), /\/palace/);
assert.doesNotMatch(read("components/Header.tsx"), /\/palace/);
assert.doesNotMatch(read("components/Footer.tsx"), /\/palace/);

const gameHtml = read("public/palace-game/index.html");
assert.match(gameHtml, /href="css\/game\.css"/);
assert.match(gameHtml, /src="js\/main\.js"/);
assert.match(gameHtml, /noindex/);
assert.match(read("public/palace-game/CREDITS.md"), /three\.js r170/);
assert.match(read("app/palace-game/page.tsx"), /\/palace-game\/index\.html/);
assert.match(read("app/palace-game/page.tsx"), /index:\s*false/);
assert.doesNotMatch(read("app/palace/page.tsx"), /palace-game/);
