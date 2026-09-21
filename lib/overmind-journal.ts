import { loadMergedPosts } from "@/lib/journal-store";
import { readOvermindTree } from "@/lib/journal-fs";
import type { LedgerOrigin } from "@/lib/journal-model";

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
  origin: LedgerOrigin;
};

export type OvermindPost = OvermindPostMeta & { content: string };

export type ListOvermindOptions = {
  includeDrafts?: boolean;
};

function toPost(
  stored: Awaited<ReturnType<typeof loadMergedPosts>>[number],
  origin: LedgerOrigin,
): OvermindPost {
  return {
    title: stored.title,
    slug: stored.slug,
    date: stored.date,
    author: "Overmind",
    stream: "overmind",
    tags: stored.tags ?? [],
    teaser: (stored.teaser ?? "").slice(0, 160),
    status: stored.publishState,
    origin,
    content: stored.body,
  };
}

function treeSlugs(): Set<string> {
  return new Set(readOvermindTree().map((post) => post.slug));
}

export async function allOvermindPosts(
  options: ListOvermindOptions = {},
): Promise<OvermindPost[]> {
  const stored = await loadMergedPosts("overmind");
  const tree = treeSlugs();
  const posts = stored
    .filter((post) => post.lane === "overmind")
    .map((post) => toPost(post, tree.has(post.slug) ? "tree" : "ledger"));
  const visible = options.includeDrafts
    ? posts
    : posts.filter((post) => post.status === "published");
  return visible.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function publishedOvermindPosts(): Promise<OvermindPost[]> {
  return allOvermindPosts({ includeDrafts: false });
}

export async function getOvermindPost(
  slug: string,
  options: ListOvermindOptions = {},
): Promise<OvermindPost | undefined> {
  const posts = await allOvermindPosts({ includeDrafts: true });
  const post = posts.find((item) => item.slug === slug);
  if (!post) return undefined;
  if (!options.includeDrafts && post.status !== "published") return undefined;
  return post;
}

export function overmindTreeParams(): { slug: string }[] {
  return readOvermindTree().map((post) => ({ slug: post.slug }));
}
