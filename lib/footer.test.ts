import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const footer = readFileSync(join(root, "components/Footer.tsx"), "utf8");
const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
const tokens = readFileSync(join(root, "app/styles/void-tokens.css"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");

assert.ok(
  layout.includes('from "@/components/Footer"'),
  "root layout must mount the shared Footer on every page",
);
assert.ok(footer.includes("HORNS UP"), "footer must render HORNS UP");
assert.ok(footer.includes("HALOS ON"), "footer must render HALOS ON");
assert.ok(footer.includes("Choose wisely."), "footer must render Choose wisely.");
assert.ok(footer.includes("™"), "footer must render the trademark mark");
assert.ok(
  footer.includes("visually-hidden"),
  "tagline must expose a natural screen-reader reading",
);
assert.ok(
  /--crimson:\s*#C41E2A/.test(tokens),
  "void tokens must keep a true crimson (no ember/brown)",
);
assert.ok(/--gold:\s*#E8D16B/.test(tokens), "void tokens must define a gold token");
assert.ok(
  css.includes("color: var(--crimson)") && css.includes(".footer-horns"),
  "HORNS UP must use the crimson token",
);
assert.ok(
  css.includes("var(--silver)") && css.includes("var(--gold)") && css.includes(".footer-halos"),
  "HALOS ON must use the silver and gold tokens",
);
assert.ok(
  css.includes("background: var(--void)") && css.includes(".footer"),
  "footer must sit on the void ground",
);
assert.ok(
  footer.includes("{site.name} · {site.mood} · {site.domain}"),
  "house brand line must stay site.name · mood · domain",
);
assert.ok(
  footer.includes("© 2026") && footer.includes("Horns &amp; Halos™"),
  "footer must add a 2026 Horns & Halos copyright line",
);
assert.ok(!footer.includes("®"), "footer must use ™ only, never ®");
assert.ok(
  css.includes(".footer-brand-lock") &&
    /footer-brand-lock[\s\S]*white-space:\s*nowrap/.test(css),
  "Horns & Halos™ must stay on one line",
);

console.log("footer tagline + copyright ok");
