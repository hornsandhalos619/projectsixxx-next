import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GateISizeGuide } from "@/components/GateISizeGuide";
import { PolicyLinks } from "@/components/PolicyLinks";
import { DAMAGE_DEFECT_CLAIM_WINDOW, publishedShopPolicies } from "@/config/published-policies";
import { GATE_I_MEASUREMENTS, GATE_I_SIZE_SOURCE } from "@/config/gate-i-size";
import { leadCaptureSucceeded } from "@/lib/leads";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const PUBLISHED = [
  ["Refund policy", "https://hornshalosshop.myshopify.com/policies/refund-policy"],
  ["Shipping policy", "https://hornshalosshop.myshopify.com/policies/shipping-policy"],
  ["Shop privacy policy", "https://hornshalosshop.myshopify.com/policies/privacy-policy"],
  ["Shop terms of service", "https://hornshalosshop.myshopify.com/policies/terms-of-service"],
  ["Contact information", "https://hornshalosshop.myshopify.com/policies/contact-information"],
] as const;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(tsx|ts|mdx|md)$/.test(name) && !name.endsWith(".test.ts")) out.push(path);
  }
  return out;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function main() {
  assert.equal(DAMAGE_DEFECT_CLAIM_WINDOW, "7 days from delivery");
  assert.deepEqual(
    publishedShopPolicies.map((policy) => [policy.label, policy.href]),
    PUBLISHED,
  );

  const policyHtml = renderToStaticMarkup(createElement(PolicyLinks));
  for (const [, href] of PUBLISHED) {
    assert.ok(policyHtml.includes(`href="${href}"`), `policy nav must link ${href}`);
  }
  assert.ok(policyHtml.includes("7 days from delivery"));
  assert.equal(policyHtml.includes("30 days from delivery"), false);
  assert.ok(policyHtml.includes('href="/legal/privacy"'));
  assert.ok(policyHtml.includes('href="/legal/terms"'));
  assert.equal(/14\s+days/i.test(policyHtml), false);

  const guideHtml = renderToStaticMarkup(createElement(GateISizeGuide));
  assert.ok(guideHtml.includes("Gate I"));
  assert.ok(guideHtml.includes("Bella + Canvas 3001"));
  assert.ok(guideHtml.includes(GATE_I_SIZE_SOURCE.url));
  assert.equal(GATE_I_SIZE_SOURCE.url, "https://www.bellacanvas.com/spec/3001.pdf");
  assert.deepEqual(
    GATE_I_MEASUREMENTS.map((row) => [row.size, row.chestInches, row.bodyLengthFromHpsInches]),
    [
      ["S", "18", "28"],
      ["M", "20", "29"],
      ["L", "22", "30"],
      ["XL", "24", "31"],
      ["2XL", "26", "32"],
    ],
  );
  for (const row of GATE_I_MEASUREMENTS) {
    assert.ok(guideHtml.includes(`>${row.size}<`) || guideHtml.includes(`>${row.size}</`));
    assert.ok(guideHtml.includes(`>${row.chestInches}<`));
    assert.ok(guideHtml.includes(`>${row.bodyLengthFromHpsInches}<`));
  }
  assert.equal(guideHtml.includes("16 1/2"), false, "unsold sizes stay off the Gate I chart");
  assert.equal(/\$\d/.test(guideHtml), false, "size guide does not restate price");

  const shop = readFileSync(join(root, "app/shop/page.tsx"), "utf8");
  const legal = readFileSync(join(root, "app/legal/page.tsx"), "utf8");
  const footer = readFileSync(join(root, "components/Footer.tsx"), "utf8");
  assert.ok(shop.includes("PolicyLinks"));
  assert.ok(shop.includes("GateISizeGuide"));
  assert.ok(legal.includes("PolicyLinks"));
  assert.ok(footer.includes('href="/legal"'));

  const claimHits: string[] = [];
  const staleThirty: string[] = [];
  for (const file of walk(root)) {
    const text = readFileSync(file, "utf8");
    if (/14\s*-?\s*days/i.test(text) && /claim|damage|defect|refund/i.test(text)) {
      claimHits.push(file);
    }
    if (text.includes("30 days from delivery")) staleThirty.push(file);
  }
  assert.deepEqual(claimHits, [], "repo pages must not keep a 14-day damage claim");
  assert.deepEqual(staleThirty, [], "damage claim window is 7 days from delivery");

  assert.equal(await leadCaptureSucceeded(jsonResponse({ ok: true, persisted: true })), true);
  assert.equal(await leadCaptureSucceeded(jsonResponse({ ok: true, persisted: false }, 200)), false);
  assert.equal(await leadCaptureSucceeded(jsonResponse({ ok: false, persisted: false }, 503)), false);
  assert.equal(await leadCaptureSucceeded(new Response("nope", { status: 200 })), false);

  console.log("launch readiness tests ok");
}

main();
