import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { captureLead } from "@/lib/leads";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function withEnv(values: Record<string, string | undefined>, run: () => Promise<void>) {
  const previous = new Map<string, string | undefined>();
  for (const key of Object.keys(values)) previous.set(key, process.env[key]);
  for (const [key, value] of Object.entries(values)) {
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    await run();
  } finally {
    for (const [key, value] of previous) {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const page = readFileSync(join(root, "app/page.tsx"), "utf8");
const section = readFileSync(join(root, "components/JoinTheHouse.tsx"), "utf8");
const css = readFileSync(join(root, "app/globals.css"), "utf8");
const store = page.indexOf("Horns & Halos store");
const list = page.indexOf("<JoinTheHouse />");
const journal = page.indexOf("Recent cuts");
assert.ok(store > 0 && list > store && journal > list, "Join the House sits between the store and the journal");
assert.ok(section.includes('source: "join-the-house"'), "signup source is join-the-house");
assert.ok(section.includes('tag: "newsletter,projectsixxx-site"'), "signup tags the house list");
assert.ok(section.includes('fetch("/api/leads"'), "signup posts to the house list API");
assert.ok(section.includes("leadCaptureSucceeded"), "signup success waits for persisted:true");
const capture = readFileSync(join(root, "components/EmailCapture.tsx"), "utf8");
assert.ok(capture.includes("leadCaptureSucceeded"), "list form success waits for persisted:true");
assert.equal(section.includes("myshopify.com/contact"), false, "off-site contact form is not used");
assert.ok(css.includes(".jth-title") && css.includes("var(--font-display)"), "headline uses the house display face");
assert.ok(css.includes("--jth-red: #9b1b1f"), "the accent rule stays red");

async function main() {
await withEnv(
  {
    VERCEL: undefined,
    SHOPIFY_ADMIN_ACCESS_TOKEN: undefined,
    LEADS_ENDPOINT: undefined,
    LEADS_LOCAL_PATH: undefined,
    NEXT_PUBLIC_SUPABASE_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    DATABASE_URL: undefined,
    POSTGRES_URL: undefined,
    BLOB_READ_WRITE_TOKEN: undefined,
  },
  async () => {
    await assert.rejects(() => captureLead({ email: "not-an-email", source: "join-the-house" }), /invalid_email/);

    const dir = await mkdtemp(join(tmpdir(), "house-leads-"));
    const file = join(dir, "house-leads.json");
    process.env.LEADS_LOCAL_PATH = file;
    try {
      const first = await captureLead({
        email: "  Reader@Example.com ",
        source: "join-the-house",
        tag: "newsletter,projectsixxx-site",
      });
      assert.equal(first.persisted, true);
      assert.equal(first.via, "local");
      const second = await captureLead({
        email: "reader@example.com",
        source: "join-the-house",
        tag: "newsletter,projectsixxx-site",
      });
      assert.equal(second.persisted, true);
      const rows = JSON.parse(await readFile(file, "utf8")) as {
        email: string;
        tag?: string;
        consent?: string;
      }[];
      assert.equal(rows.length, 1);
      assert.equal(rows[0]?.email, "reader@example.com");
      assert.equal(rows[0]?.tag, "newsletter,projectsixxx-site");
      assert.equal(rows[0]?.consent, "yes-opt-in");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
);

await withEnv(
  {
    VERCEL: "1",
    SHOPIFY_ADMIN_ACCESS_TOKEN: undefined,
    LEADS_ENDPOINT: undefined,
    NEXT_PUBLIC_SUPABASE_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    DATABASE_URL: undefined,
    POSTGRES_URL: undefined,
    BLOB_READ_WRITE_TOKEN: undefined,
  },
  async () => {
    const result = await captureLead({
      email: "reader@example.com",
      source: "join-the-house",
      tag: "newsletter,projectsixxx-site",
    });
    assert.equal(result.persisted, false);
  },
);

await withEnv(
  {
    VERCEL: "1",
    SHOPIFY_ADMIN_ACCESS_TOKEN: "test-token",
    SHOPIFY_SHOP: "hornshalosshop.myshopify.com",
    LEADS_ENDPOINT: undefined,
  },
  async () => {
    const calls: { url: string; body: { query: string; variables: Record<string, unknown> }; token: string | null }[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const headers = new Headers(init?.headers);
      calls.push({ url: String(url), body, token: headers.get("x-shopify-access-token") });
      if (body.query.includes("customerCreate")) {
        return jsonResponse({
          data: { customerCreate: { customer: { id: "gid://shopify/Customer/1" }, userErrors: [] } },
        });
      }
      throw new Error(`unexpected query ${body.query.slice(0, 40)}`);
    }) as typeof fetch;
    try {
      const result = await captureLead({
        email: "reader@example.com",
        source: "join-the-house",
        tag: "newsletter,projectsixxx-site",
      });
      assert.equal(result.persisted, true);
      assert.equal(result.via, "shopify");
      assert.equal(calls.length, 1);
      assert.match(calls[0]!.url, /^https:\/\/hornshalosshop\.myshopify\.com\/admin\/api\/2026-10\/graphql\.json$/);
      assert.equal(calls[0]!.token, "test-token");
      const input = calls[0]!.body.variables.input as {
        email: string;
        tags: string[];
        emailMarketingConsent: { marketingState: string; marketingOptInLevel: string };
      };
      assert.equal(input.email, "reader@example.com");
      assert.deepEqual(input.tags, ["newsletter", "projectsixxx-site"]);
      assert.equal(input.emailMarketingConsent.marketingState, "SUBSCRIBED");
      assert.equal(input.emailMarketingConsent.marketingOptInLevel, "SINGLE_OPT_IN");
    } finally {
      globalThis.fetch = original;
    }
  },
);

await withEnv(
  {
    VERCEL: "1",
    SHOPIFY_ADMIN_ACCESS_TOKEN: "test-token",
    SHOPIFY_SHOP: "hornshalosshop.myshopify.com",
    LEADS_ENDPOINT: undefined,
  },
  async () => {
    const names: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { query: string; variables: Record<string, unknown> };
      const name = body.query.match(/^(query|mutation)\s+(\w+)/)?.[2] ?? "";
      names.push(name);
      if (name === "CustomerCreate") {
        return jsonResponse({
          data: {
            customerCreate: {
              customer: null,
              userErrors: [{ field: ["email"], message: "Email has already been taken" }],
            },
          },
        });
      }
      if (name === "FindCustomer") {
        return jsonResponse({
          data: { customers: { nodes: [{ id: "gid://shopify/Customer/9", tags: ["waitlist-r001"] }] } },
        });
      }
      if (name === "CustomerUpdate") {
        const input = body.variables.input as { tags: string[] };
        assert.ok(input.tags.includes("newsletter"));
        assert.ok(input.tags.includes("waitlist-r001"));
        return jsonResponse({
          data: { customerUpdate: { customer: { id: "gid://shopify/Customer/9" }, userErrors: [] } },
        });
      }
      if (name === "CustomerEmailMarketingConsentUpdate") {
        return jsonResponse({
          data: {
            customerEmailMarketingConsentUpdate: {
              customer: { id: "gid://shopify/Customer/9" },
              userErrors: [],
            },
          },
        });
      }
      throw new Error(`unexpected ${name}`);
    }) as typeof fetch;
    try {
      const result = await captureLead({
        email: "reader@example.com",
        source: "shop-r001",
        tag: "newsletter,projectsixxx-site",
      });
      assert.equal(result.persisted, true);
      assert.equal(result.via, "shopify");
      assert.deepEqual(names, [
        "CustomerCreate",
        "FindCustomer",
        "CustomerUpdate",
        "CustomerEmailMarketingConsentUpdate",
      ]);
    } finally {
      globalThis.fetch = original;
    }
  },
);

await withEnv(
  {
    VERCEL: "1",
    SHOPIFY_ADMIN_ACCESS_TOKEN: "test-token",
    SHOPIFY_SHOP: "hornshalosshop.myshopify.com",
    LEADS_ENDPOINT: undefined,
    NEXT_PUBLIC_SUPABASE_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    DATABASE_URL: undefined,
    POSTGRES_URL: undefined,
    BLOB_READ_WRITE_TOKEN: undefined,
  },
  async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { query: string };
      const name = body.query.match(/^(query|mutation)\s+(\w+)/)?.[2] ?? "";
      if (name === "CustomerCreate") {
        return jsonResponse({
          data: {
            customerCreate: {
              customer: null,
              userErrors: [{ field: ["email"], message: "Email has already been taken" }],
            },
          },
        });
      }
      if (name === "FindCustomer") {
        return jsonResponse({ data: { customers: { nodes: [] } } });
      }
      throw new Error(`unexpected ${name}`);
    }) as typeof fetch;
    try {
      const result = await captureLead({
        email: "reader@example.com",
        source: "join-the-house",
        tag: "newsletter,projectsixxx-site",
      });
      assert.equal(result.persisted, false);
      assert.notEqual(result.via, "shopify");
    } finally {
      globalThis.fetch = original;
    }
  },
);

console.log("leads tests ok");
}

main();
