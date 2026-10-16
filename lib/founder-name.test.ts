import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FOUNDER_CRIMSON,
  isFounderCredit,
  splitFounderNames,
} from "./founder-name";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

assert.equal(FOUNDER_CRIMSON, "#DC143C");
assert.equal(isFounderCredit("6"), true);
assert.equal(isFounderCredit("Matthew Feldman"), true);
assert.equal(isFounderCredit("SiXXX"), true);
assert.equal(isFounderCredit("Sixxx"), true);
assert.equal(isFounderCredit("House"), false);
assert.equal(isFounderCredit("Overmind"), false);
assert.equal(isFounderCredit("Line 6"), false);

const inline = splitFounderNames("Magickal credit to **6** (Matthew Feldman).");
assert.ok(inline.some((part) => part.founder && part.value === "Matthew Feldman"));
assert.ok(!inline.some((part) => part.founder && part.value === "6"));

const brand = splitFounderNames("Project SiXXX is the house.");
assert.deepEqual(
  brand.filter((part) => part.founder).map((part) => part.value),
  ["SiXXX"],
);

const domain = splitFounderNames("See projectsixxx.com for the house.");
assert.ok(domain.every((part) => !part.founder), "must not paint projectsixxx.com");

const helix = splitFounderNames("Line 6 Helix LT and a 14.6-inch canvas.");
assert.ok(helix.every((part) => !part.founder), "must not paint product sixes");

const whole = splitFounderNames("6");
assert.deepEqual(whole, [{ founder: true, value: "6" }]);

const tokens = readFileSync(join(root, "app/styles/void-tokens.css"), "utf8");
assert.ok(
  /--founder-crimson:\s*#DC143C/.test(tokens),
  "void tokens must define --founder-crimson as #DC143C",
);

const css = readFileSync(join(root, "app/globals.css"), "utf8");
assert.ok(css.includes(".founder-name"), "globals must define .founder-name");
assert.ok(css.includes("var(--founder-crimson)"), "founder name uses --founder-crimson");
assert.ok(css.includes("founder-shine"), "founder name has a shine sweep");
assert.ok(css.includes("animation: founder-shine 7s"), "shine runs on a ~7s cycle");
assert.ok(
  /prefers-reduced-motion:\s*reduce[\s\S]*\.founder-name[\s\S]*animation:\s*none/.test(css),
  "shine must disable under prefers-reduced-motion: reduce",
);
assert.ok(!css.includes("opacity: 0.4"), "highlight opacity must stay at or under 0.35");

const picks = readFileSync(join(root, "app/picks/page.tsx"), "utf8");
assert.ok(picks.includes("<h1>Six Picks</h1>"), "/picks headline must be Six Picks");
assert.ok(picks.includes('title: "Six Picks"'), "/picks metadata title must be Six Picks");
assert.ok(!picks.includes("Horns &amp; Halos on Amazon"), "old /picks headline must be gone");

const header = readFileSync(join(root, "components/Header.tsx"), "utf8");
assert.ok(!header.includes("FounderName"), "header wordmark must not use FounderName");
assert.ok(!header.includes("founder-name"), "header wordmark must not use .founder-name");
assert.ok(header.includes("wordmark"), "header keeps the brand wordmark");

const footer = readFileSync(join(root, "components/Footer.tsx"), "utf8");
assert.ok(
  footer.includes("<FounderName>{site.shortName}</FounderName>"),
  "footer credits must paint the SiXXX handle",
);

console.log("founder name + six picks headline ok");
