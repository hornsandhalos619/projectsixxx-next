import matter from "gray-matter";
import { journalTaxonomy } from "@/config/site";
import {
  isJournalStream,
  isPublishStatus,
  type CmsRecord,
  type JournalStream,
} from "@/lib/cms/types";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

export function recordFromUnknown(value: unknown): CmsRecord | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const stream = String(data.stream ?? "");
  const slug = String(data.slug ?? "");
  const title = String(data.title ?? "");
  if (!isJournalStream(stream) || !slug || !title) return null;
  const status = isPublishStatus(String(data.status ?? ""))
    ? (data.status as CmsRecord["status"])
    : "draft";
  return {
    stream,
    slug,
    title,
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? data.teaser ?? data.dek ?? ""),
    body: String(data.body ?? data.content ?? ""),
    status,
    category: data.category ? String(data.category) : undefined,
    dek: data.dek ? String(data.dek) : undefined,
    teaser: data.teaser ? String(data.teaser) : undefined,
    tags: asStringArray(data.tags),
    author: data.author ? String(data.author) : undefined,
    updatedAt: String(data.updatedAt ?? data.updated_at ?? new Date().toISOString()),
  };
}

export function recordToJson(record: CmsRecord): string {
  return `${JSON.stringify(record, null, 2)}\n`;
}

export function mdxToRecord(
  raw: string,
  fallback: { stream: JournalStream; slug: string; category?: string },
): CmsRecord | null {
  const { data, content } = matter(raw);
  const stream = isJournalStream(String(data.stream ?? fallback.stream))
    ? (String(data.stream ?? fallback.stream) as JournalStream)
    : fallback.stream;
  const slug = String(data.slug ?? fallback.slug);
  const title = String(data.title ?? "");
  if (!slug || !title) return null;

  const explicit = String(data.visibility ?? data.status ?? "");
  const status = isPublishStatus(explicit)
    ? explicit
    : explicit === "draft"
      ? "draft"
      : "published";

  const category =
    stream === "house"
      ? String(data.category ?? fallback.category ?? "")
      : undefined;

  return {
    stream,
    slug,
    title,
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? data.teaser ?? data.dek ?? ""),
    body: content.replace(/^\n/, ""),
    status,
    category: category || undefined,
    dek: data.dek ? String(data.dek) : undefined,
    teaser: data.teaser ? String(data.teaser) : undefined,
    tags: asStringArray(data.tags),
    author: data.author ? String(data.author) : undefined,
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

export function recordToMdx(record: CmsRecord): string {
  const tags = record.tags?.filter(Boolean) ?? [];
  if (record.stream === "overmind") {
    const front = {
      title: record.title,
      slug: record.slug,
      date: record.date,
      author: "Overmind",
      stream: "overmind",
      tags,
      teaser: (record.teaser || record.excerpt).slice(0, 160),
      status: record.status,
    };
    return matter.stringify(record.body.trimStart(), front);
  }

  const category = journalTaxonomy.includes(
    record.category as (typeof journalTaxonomy)[number],
  )
    ? record.category
    : "fine-art";

  const front = {
    title: record.title,
    dek: record.dek || record.excerpt,
    excerpt: record.excerpt,
    author: record.author || "House",
    date: record.date,
    category,
    slug: record.slug,
    status: record.status === "published" ? "house" : "draft",
    visibility: record.status,
  };
  return matter.stringify(record.body.trimStart(), front);
}

export function githubPathFor(record: Pick<CmsRecord, "stream" | "slug" | "category">): string {
  if (record.stream === "overmind") {
    return `content/overmind/journal/${record.slug}.mdx`;
  }
  const category = record.category || "fine-art";
  return `content/journal/${category}/${record.slug}.mdx`;
}
