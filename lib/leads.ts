import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { localAllowed } from "@/lib/cms/local-allowed";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { leadCaptureSucceeded } from "@/lib/lead-response";
import { saveShopifyLead } from "@/lib/shopify-leads";

export { leadCaptureSucceeded };

export type LeadResult = { ok: true; persisted: boolean; via?: string };

const INBOX_DIR = "/workspace/overmind/agentos-shared-memory/leads";
const INBOX_JSONL = path.join(INBOX_DIR, "inbox.jsonl");
const INBOX_JSON = path.join(INBOX_DIR, "inbox.json");
const SOFT_LAUNCH_TAG = "soft-launch-password";

type InboxRow = {
  id: string;
  source: "house-shop";
  tag: typeof SOFT_LAUNCH_TAG;
  stage: "captured";
  last_touch: string;
  consent: "yes-opt-in";
  email: string;
};

export type HouseLead = {
  email: string;
  source: string;
  tag?: string;
  consent: "yes-opt-in";
  updatedAt: string;
};

function localLeadPath(): string {
  const override = (process.env.LEADS_LOCAL_PATH ?? "").trim();
  if (override) return override;
  return path.join(process.cwd(), "data", "house-leads.json");
}

export function splitLeadTags(tag?: string): string[] {
  if (!tag) return [];
  return [...new Set(tag.split(",").map((part) => part.trim()).filter(Boolean))];
}

async function persistSoftLaunchInbox(email: string): Promise<boolean> {
  try {
    await mkdir(INBOX_DIR, { recursive: true });
    let rows: InboxRow[] = [];
    try {
      const raw = await readFile(INBOX_JSON, "utf8");
      const parsed = JSON.parse(raw) as InboxRow[];
      if (Array.isArray(parsed)) rows = parsed;
    } catch {
      rows = [];
    }

    const existing = rows.find((row) => row.email === email && row.tag === SOFT_LAUNCH_TAG);
    if (existing) {
      existing.last_touch = new Date().toISOString();
    } else {
      const row: InboxRow = {
        id: `house-${randomUUID()}`,
        source: "house-shop",
        tag: SOFT_LAUNCH_TAG,
        stage: "captured",
        last_touch: new Date().toISOString(),
        consent: "yes-opt-in",
        email,
      };
      rows.push(row);
      await appendFile(INBOX_JSONL, `${JSON.stringify(row)}\n`);
    }

    await writeFile(INBOX_JSON, `${JSON.stringify(rows, null, 2)}\n`);
    return true;
  } catch {
    return false;
  }
}

async function persistSupabase(lead: HouseLead): Promise<void> {
  const { error } = await getSupabase().from("house_leads").insert({
    email: lead.email,
    source: lead.source,
    tag: lead.tag ?? null,
    consent: lead.consent,
    updated_at: lead.updatedAt,
  });
  if (!error) return;
  const duplicate = error.code === "23505" || /duplicate|unique/i.test(error.message);
  if (duplicate) return;
  throw new Error(error.message);
}

let neonReady: Promise<void> | null = null;

async function persistNeon(lead: HouseLead): Promise<void> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("database_unconfigured");
  const sql = neon(url);
  if (!neonReady) {
    neonReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS house_leads (
          email TEXT PRIMARY KEY,
          source TEXT NOT NULL,
          tag TEXT,
          consent TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  await neonReady;
  await sql`
    INSERT INTO house_leads (email, source, tag, consent, updated_at)
    VALUES (${lead.email}, ${lead.source}, ${lead.tag ?? null}, ${lead.consent}, ${lead.updatedAt})
    ON CONFLICT (email) DO UPDATE SET
      source = excluded.source,
      tag = excluded.tag,
      consent = excluded.consent,
      updated_at = excluded.updated_at
  `;
}

async function persistBlob(lead: HouseLead): Promise<void> {
  const token = (process.env.BLOB_READ_WRITE_TOKEN ?? "").trim();
  if (!token) throw new Error("blob_unconfigured");
  const key = `house-leads/${encodeURIComponent(lead.email)}.json`;
  await put(key, JSON.stringify(lead), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token,
  });
}

async function persistLocal(lead: HouseLead): Promise<void> {
  const file = localLeadPath();
  await mkdir(path.dirname(file), { recursive: true });
  let rows: HouseLead[] = [];
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as HouseLead[];
    if (Array.isArray(parsed)) rows = parsed;
  } catch {
    rows = [];
  }
  const next = rows.filter((row) => row.email !== lead.email);
  next.push(lead);
  await writeFile(file, `${JSON.stringify(next, null, 2)}\n`);
}

async function persistHouseStore(lead: HouseLead): Promise<string | undefined> {
  const stores: { name: string; ready: boolean; save: () => Promise<void> }[] = [
    { name: "supabase", ready: supabaseConfigured(), save: () => persistSupabase(lead) },
    {
      name: "postgres",
      ready: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      save: () => persistNeon(lead),
    },
    {
      name: "blob",
      ready: Boolean((process.env.BLOB_READ_WRITE_TOKEN ?? "").trim()),
      save: () => persistBlob(lead),
    },
    { name: "local", ready: localAllowed(), save: () => persistLocal(lead) },
  ];

  for (const store of stores) {
    if (!store.ready) continue;
    try {
      await store.save();
      return store.name;
    } catch {
      console.error("lead store failed", store.name);
    }
  }
  return undefined;
}

async function persistEndpoint(input: {
  email: string;
  source: string;
  tag?: string;
}): Promise<boolean> {
  const endpoint = (process.env.LEADS_ENDPOINT ?? "").trim();
  if (!endpoint) return false;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (process.env.LEADS_API_KEY) headers.authorization = `Bearer ${process.env.LEADS_API_KEY}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: input.email,
      source: input.source,
      tag: input.tag,
      listId: process.env.LEADS_LIST_ID || undefined,
    }),
    signal: AbortSignal.timeout(12000),
  });
  return response.ok;
}

export async function captureLead(input: {
  email: string;
  source: string;
  tag?: string;
}): Promise<LeadResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("invalid_email");
  }

  const explicitTag = (input.tag ?? "").trim() || undefined;
  const tag = explicitTag ?? ((process.env.LEADS_TAG ?? "").trim() || undefined);
  const lead: HouseLead = {
    email,
    source: input.source.trim() || "unknown",
    tag,
    consent: "yes-opt-in",
    updatedAt: new Date().toISOString(),
  };

  let persisted = false;
  let via: string | undefined;

  if (explicitTag === SOFT_LAUNCH_TAG && localAllowed()) {
    const inboxOk = await persistSoftLaunchInbox(email);
    if (inboxOk) {
      persisted = true;
      via = "soft-launch-inbox";
    }
  }

  const shopify = await saveShopifyLead({
    email,
    source: lead.source,
    tags: splitLeadTags(tag),
  });
  if (shopify === "saved") return { ok: true, persisted: true, via: "shopify" };

  try {
    if (await persistEndpoint({ email, source: lead.source, tag })) {
      return { ok: true, persisted: true, via: "leads-endpoint" };
    }
  } catch {
    console.error("lead endpoint failed");
  }

  const house = await persistHouseStore(lead);
  if (house) return { ok: true, persisted: true, via: house };

  return { ok: true, persisted, via };
}
