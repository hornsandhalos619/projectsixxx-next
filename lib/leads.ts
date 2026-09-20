import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type LeadResult = { ok: true; persisted: boolean };

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

    const existing = rows.find((r) => r.email === email && r.tag === SOFT_LAUNCH_TAG);
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

export async function captureLead(input: {
  email: string;
  source: string;
  tag?: string;
}): Promise<LeadResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("invalid_email");
  }

  const endpoint = process.env.LEADS_ENDPOINT;
  // Env LEADS_TAG is for outbound ESP payload only — never auto-tag affiliate/untagged captures.
  const explicitTag = (input.tag ?? "").trim() || undefined;
  const tag = explicitTag ?? ((process.env.LEADS_TAG ?? "").trim() || undefined);

  // House soft-launch inbox: only when the client explicitly tagged soft-launch-password.
  if (explicitTag === SOFT_LAUNCH_TAG) {
    const inboxOk = await persistSoftLaunchInbox(email);
    if (!endpoint) {
      return { ok: true, persisted: inboxOk };
    }
  }

  if (!endpoint) {
    return { ok: true, persisted: false };
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (process.env.LEADS_API_KEY) {
    headers.authorization = `Bearer ${process.env.LEADS_API_KEY}`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      source: input.source,
      tag,
      listId: process.env.LEADS_LIST_ID || undefined,
    }),
  });

  if (!res.ok) {
    return { ok: true, persisted: explicitTag === SOFT_LAUNCH_TAG };
  }
  return { ok: true, persisted: true };
}
