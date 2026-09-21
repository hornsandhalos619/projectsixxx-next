import { listJournalRecords } from "@/lib/cms/store";
import type { CmsRecord } from "@/lib/cms/types";

export type OvermindStatus = "draft" | "published";

export type OvermindPostMeta = {
  title: string;
  slug: string;
  date: string;
  author: "Overmind";
  stream: "overmind";
  tags: string[];
  teaser: string;
  status: OvermindStatus;
};

export type OvermindPost = OvermindPostMeta & { content: string };

function toOvermindPost(record: CmsRecord): OvermindPost | null {
  if (record.stream !== "overmind") return null;
  return {
    title: record.title,
    slug: record.slug,
    date: record.date,
    author: "Overmind",
    stream: "overmind",
    tags: record.tags ?? [],
    teaser: (record.teaser || record.excerpt).slice(0, 160),
    status: record.status,
    content: record.body,
  };
}

export async function allOvermindPosts(): Promise<OvermindPost[]> {
  const records = await listJournalRecords();
  return records
    .map(toOvermindPost)
    .filter((post): post is OvermindPost => Boolean(post));
}

export async function publishedOvermindPosts(): Promise<OvermindPost[]> {
  return (await allOvermindPosts()).filter((post) => post.status === "published");
}

export async function getOvermindPost(slug: string): Promise<OvermindPost | undefined> {
  return (await allOvermindPosts()).find((post) => post.slug === slug);
}
