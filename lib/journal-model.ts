import matter from "gray-matter";
import { journalTaxonomy, type JournalCategory } from "@/config/site";

export type JournalLane = "overmind" | "house";
export type PublishState = "draft" | "published";
export type HouseKind = "sample" | "house";
export type LedgerOrigin = "tree" | "ledger";

export type StoredPost = {
  lane: JournalLane;
  title: string;
  slug: string;
  body: string;
  date: string;
  publishState: PublishState;
  updatedAt: string;
  updatedBy: string | null;
  teaser?: string;
  tags?: string[];
  category?: JournalCategory;
  dek?: string;
  excerpt?: string;
  author?: string;
  kind?: HouseKind;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 80 && SLUG_RE.test(slug);
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeDate(input: string | undefined): string {
  const raw = (input ?? "").trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  if (match) return match[1];
  return new Date().toISOString().slice(0, 10);
}

export function excerptFromBody(body: string, max = 160): string {
  const text = body
    .replace(/^---[\s\S]*?---\s*/u, "")
    .replace(/^#+\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function isJournalCategory(value: string): value is JournalCategory {
  return (journalTaxonomy as readonly string[]).includes(value);
}

export function assertSafeSlug(slug: string): string {
  const trimmed = slug.trim().toLowerCase();
  if (!isSafeSlug(trimmed)) {
    throw new Error("Slug uses lowercase letters, numbers, and hyphens only.");
  }
  return trimmed;
}

export function mergeByKey<T>(
  base: T[],
  overlay: T[],
  keyOf: (item: T) => string,
): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(keyOf(item), item);
  for (const item of overlay) map.set(keyOf(item), item);
  return [...map.values()];
}

export function serializeOvermindMdx(post: StoredPost): string {
  const teaser = (post.teaser?.trim() || excerptFromBody(post.body)).slice(0, 160);
  return matter.stringify(ensureTrailingNewline(post.body), {
    title: post.title,
    slug: post.slug,
    date: post.date,
    author: "Overmind",
    stream: "overmind",
    tags: post.tags ?? [],
    teaser,
    status: post.publishState,
  });
}

export function serializeHouseMdx(post: StoredPost): string {
  if (!post.category || !isJournalCategory(post.category)) {
    throw new Error("House posts need a journal shelf.");
  }
  const dek = post.dek?.trim() || excerptFromBody(post.body, 120);
  const excerpt = post.excerpt?.trim() || excerptFromBody(post.body, 200);
  return matter.stringify(ensureTrailingNewline(post.body), {
    title: post.title,
    dek,
    excerpt,
    author: post.author?.trim() || "House",
    date: post.date,
    category: post.category,
    slug: post.slug,
    status: post.kind === "sample" ? "sample" : "house",
    visibility: post.publishState,
  });
}

export function parseStoredJson(raw: string): StoredPost {
  const data = JSON.parse(raw) as StoredPost;
  if (data.lane !== "overmind" && data.lane !== "house") {
    throw new Error("Stored post is missing a journal lane.");
  }
  return {
    ...data,
    slug: assertSafeSlug(data.slug),
    title: String(data.title ?? "").trim(),
    body: String(data.body ?? ""),
    date: normalizeDate(data.date),
    publishState: data.publishState === "published" ? "published" : "draft",
    updatedAt: data.updatedAt || new Date().toISOString(),
    updatedBy: data.updatedBy ?? null,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    teaser: data.teaser ? String(data.teaser).slice(0, 160) : "",
    dek: data.dek ? String(data.dek) : "",
    excerpt: data.excerpt ? String(data.excerpt) : "",
    author: data.author ? String(data.author) : data.lane === "overmind" ? "Overmind" : "House",
    kind: data.kind === "sample" ? "sample" : "house",
    category:
      data.category && isJournalCategory(String(data.category))
        ? data.category
        : undefined,
  };
}

function ensureTrailingNewline(body: string): string {
  const trimmed = body.replace(/\s+$/u, "");
  return `${trimmed}\n`;
}
