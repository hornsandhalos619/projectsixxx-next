import { listJournalRecords } from "@/lib/cms/store";
import type { CmsRecord } from "@/lib/cms/types";
import { journalTaxonomy, type JournalCategory } from "@/config/site";

export type PostStatus = "sample" | "house";
export type PostVisibility = "draft" | "published";

export type PostMeta = {
  title: string;
  dek: string;
  excerpt: string;
  author: string;
  date: string;
  category: JournalCategory;
  slug: string;
  status: PostStatus;
  visibility: PostVisibility;
};

export type Post = PostMeta & { content: string };

function toHousePost(record: CmsRecord): Post | null {
  if (record.stream !== "house") return null;
  const category = record.category ?? "";
  if (!isJournalCategory(category)) return null;
  return {
    title: record.title,
    dek: record.dek || record.excerpt,
    excerpt: record.excerpt,
    author: record.author || "House",
    date: record.date,
    category,
    slug: record.slug,
    status: record.status === "published" ? "house" : "sample",
    visibility: record.status,
    content: record.body,
  };
}

export async function allPosts(): Promise<Post[]> {
  const records = await listJournalRecords();
  return records
    .map(toHousePost)
    .filter((post): post is Post => Boolean(post));
}

export async function publishedPosts(): Promise<Post[]> {
  return (await allPosts()).filter((post) => post.visibility === "published");
}

export async function postsIn(category: string): Promise<Post[]> {
  return (await publishedPosts()).filter((post) => post.category === category);
}

export async function getPost(category: string, slug: string): Promise<Post | undefined> {
  return (await allPosts()).find((post) => post.category === category && post.slug === slug);
}

export function isJournalCategory(value: string): value is JournalCategory {
  return (journalTaxonomy as readonly string[]).includes(value);
}
