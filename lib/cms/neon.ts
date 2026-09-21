import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { recordFromUnknown } from "@/lib/cms/serialize";
import type { CmsRecord, JournalStream } from "@/lib/cms/types";

function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export function neonConfigured(): boolean {
  return Boolean(databaseUrl());
}

let sqlClient: NeonQueryFunction<false, false> | null = null;
let ready: Promise<void> | null = null;

function sql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    const url = databaseUrl();
    if (!url) {
      throw new Error("DATABASE_URL or POSTGRES_URL is required for Neon journal storage.");
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

async function ensureTable(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await sql()`
        CREATE TABLE IF NOT EXISTS journal_posts (
          stream TEXT NOT NULL,
          slug TEXT NOT NULL,
          category TEXT,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          excerpt TEXT NOT NULL DEFAULT '',
          dek TEXT NOT NULL DEFAULT '',
          teaser TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'draft',
          tags TEXT NOT NULL DEFAULT '',
          author TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (stream, slug)
        )
      `;
    })();
  }
  await ready;
}

function rowToRecord(row: Record<string, unknown>): CmsRecord | null {
  const tags = String(row.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return recordFromUnknown({
    ...row,
    tags,
    updatedAt: row.updated_at ?? row.updatedAt,
  });
}

export async function neonList(): Promise<CmsRecord[]> {
  await ensureTable();
  const rows = await sql()`
    SELECT stream, slug, category, title, date, excerpt, dek, teaser, body, status, tags, author, updated_at
    FROM journal_posts
    ORDER BY date DESC
  `;
  return rows
    .map((row) => rowToRecord(row as Record<string, unknown>))
    .filter((record): record is CmsRecord => Boolean(record));
}

export async function neonWrite(record: CmsRecord): Promise<void> {
  await ensureTable();
  await sql()`
    INSERT INTO journal_posts (
      stream, slug, category, title, date, excerpt, dek, teaser, body, status, tags, author, updated_at
    )
    VALUES (
      ${record.stream},
      ${record.slug},
      ${record.category ?? null},
      ${record.title},
      ${record.date},
      ${record.excerpt},
      ${record.dek ?? ""},
      ${record.teaser ?? ""},
      ${record.body},
      ${record.status},
      ${(record.tags ?? []).join(",")},
      ${record.author ?? null},
      now()
    )
    ON CONFLICT (stream, slug) DO UPDATE SET
      category = EXCLUDED.category,
      title = EXCLUDED.title,
      date = EXCLUDED.date,
      excerpt = EXCLUDED.excerpt,
      dek = EXCLUDED.dek,
      teaser = EXCLUDED.teaser,
      body = EXCLUDED.body,
      status = EXCLUDED.status,
      tags = EXCLUDED.tags,
      author = EXCLUDED.author,
      updated_at = EXCLUDED.updated_at
  `;
}

export async function neonRemove(stream: JournalStream, slug: string): Promise<void> {
  await ensureTable();
  await sql()`
    DELETE FROM journal_posts WHERE stream = ${stream} AND slug = ${slug}
  `;
}
