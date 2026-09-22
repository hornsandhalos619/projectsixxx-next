import { recordFromUnknown } from "@/lib/cms/serialize";
import type { CmsRecord, JournalStream } from "@/lib/cms/types";
import { getSupabase } from "@/lib/supabase";

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

export async function supabaseListJournal(): Promise<CmsRecord[]> {
  const { data, error } = await getSupabase()
    .from("journal_posts")
    .select("stream, slug, category, title, date, excerpt, dek, teaser, body, status, tags, author, updated_at")
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => rowToRecord(row as Record<string, unknown>))
    .filter((record): record is CmsRecord => Boolean(record));
}

export async function supabaseWriteJournal(record: CmsRecord): Promise<void> {
  const { error } = await getSupabase().from("journal_posts").upsert(
    {
      stream: record.stream,
      slug: record.slug,
      category: record.category ?? null,
      title: record.title,
      date: record.date,
      excerpt: record.excerpt,
      dek: record.dek ?? "",
      teaser: record.teaser ?? "",
      body: record.body,
      status: record.status,
      tags: (record.tags ?? []).join(","),
      author: record.author ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stream,slug" },
  );
  if (error) throw new Error(error.message);
}

export async function supabaseRemoveJournal(stream: JournalStream, slug: string): Promise<void> {
  const { error } = await getSupabase()
    .from("journal_posts")
    .delete()
    .eq("stream", stream)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
}
