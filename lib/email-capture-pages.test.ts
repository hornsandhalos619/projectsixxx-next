import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relative: string) {
  return readFileSync(join(root, relative), "utf8");
}

const capture = read("components/EmailCapture.tsx");
const home = read("app/page.tsx");
const picks = read("app/picks/page.tsx");
const shop = read("app/shop/page.tsx");
const css = read("app/globals.css");

assert.ok(capture.includes('label = "Keep the night list"'), "default label stays Keep the night list");
assert.ok(capture.includes('buttonLabel = "Join"'), "default button stays Join");
assert.ok(capture.includes('fetch("/api/leads"'), "submit path stays /api/leads");

assert.ok(home.includes('from "@/components/EmailCapture"'), "home mounts EmailCapture");
assert.ok(home.includes('source="home"'), "home uses source=home");
assert.ok(home.includes("email-capture-band"), "home places capture on the black band");
assert.ok(
  home.indexOf("Seven pillars") < home.indexOf('source="home"'),
  "home capture sits after the pillars, above the footer",
);

assert.ok(picks.includes("AffiliateDisclosure"), "/picks keeps the Amazon disclosure");
assert.ok(picks.includes("amazonSections.map"), "/picks still renders the budget tiers");
assert.ok(picks.includes('from "@/components/EmailCapture"'), "/picks mounts EmailCapture");
assert.ok(picks.includes('source="picks"'), "/picks uses source=picks");
assert.ok(picks.includes("email-capture-band"), "/picks places capture on the black band");
assert.ok(
  picks.lastIndexOf("amazonSections.map") < picks.indexOf("<EmailCapture"),
  "/picks capture sits after every tier, not between affiliate cards",
);
assert.ok(
  !picks.slice(picks.indexOf("section.picks.map"), picks.lastIndexOf("</article>")).includes("EmailCapture"),
  "/picks capture is not inside an affiliate card",
);

assert.ok(shop.includes("SOFT_LAUNCH_SOURCE"), "/shop still uses the soft-launch source");
assert.ok(shop.includes("SOFT_LAUNCH_COPY.label"), "/shop keeps its existing capture copy");

assert.ok(/\.email-capture-band\s*\{[^}]*background:\s*#000/.test(css), "capture band sits on pure black");

console.log("email capture home + picks placement ok");
