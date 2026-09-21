import { journalTaxonomy, type JournalCategory } from "@/config/site";
import { loadMergedPosts } from "@/lib/journal-store";
import { readHouseTree } from "@/lib/journal-fs";
import type { HouseKind, LedgerOrigin, PublishState } from "@/lib/journal-model";

export type PostStatus = HouseKind;
export type PostVisibility = PublishState;

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
  origin: LedgerOrigin;
};

export type Post = PostMeta & { content: string };

export type ListPostsOptions = {
  includeDrafts?: boolean;
};

function toPost(stored: Awaited<ReturnType<typeof loadMergedPosts>>[number], origin: LedgerOrigin): Post {
  return {
    title: stored.title,
    dek: stored.dek ?? "",
    excerpt: stored.excerpt ?? "",
    author: stored.author ?? "House",
    date: stored.date,
    category: stored.category as JournalCategory,
    slug: stored.slug,
    status: stored.kind === "house" ? "house" : "sample",
    visibility: stored.publishState,
    origin,
    content: stored.body,
  };
}

function treeKeys(): Set<string> {
  return new Set(readHouseTree().map((post) => `${post.category}:${post.slug}`));
}

export async function allPosts(options: ListPostsOptions = {}): Promise<Post[]> {
  const stored = await loadMergedPosts("house");
  const tree = treeKeys();
  const posts = stored.map((post) =>
    toPost(post, tree.has(`${post.category}:${post.slug}`) ? "tree" : "ledger"),
  );
  const visible = options.includeDrafts
    ? posts
    : posts.filter((post) => post.visibility === "published");
  return visible.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function postsIn(
  category: string,
  options: ListPostsOptions = {},
): Promise<Post[]> {
  const posts = await allPosts(options);
  return posts.filter((post) => post.category === category);
}

export async function getPost(
  category: string,
  slug: string,
  options: ListPostsOptions = {},
): Promise<Post | undefined> {
  const posts = await allPosts(options);
  return posts.find((post) => post.category === category && post.slug === slug);
}

export function isJournalCategory(value: string): value is JournalCategory {
  return (journalTaxonomy as readonly string[]).includes(value);
}

export function houseTreeParams(): { category: string; slug: string }[] {
  return readHouseTree().map((post) => ({
    category: post.category as string,
    slug: post.slug,
  }));
}
