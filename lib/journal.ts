import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { journalTaxonomy, type JournalCategory } from "@/config/site";
import {
  assertInside,
  assertSafeSlug,
  parseEditorialStatus,
  removeFileIfExists,
  slugify,
  writeMdxFile,
  type EditorialStatus,
} from "@/lib/journal-io";

export type { EditorialStatus };
export type PostStatus = EditorialStatus;

export type PostMeta = {
  title: string;
  dek: string;
  excerpt: string;
  author: string;
  date: string;
  category: JournalCategory;
  slug: string;
  status: EditorialStatus;
  sample: boolean;
};

export type Post = PostMeta & { content: string };

export type HousePostInput = {
  title: string;
  dek: string;
  excerpt: string;
  author: string;
  date: string;
  category: JournalCategory;
  slug: string;
  status: EditorialStatus;
  content: string;
  sample?: boolean;
  previousCategory?: string;
  previousSlug?: string;
};

const ROOT = path.join(process.cwd(), "content/journal");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) return [p];
    return [];
  });
}

function parse(file: string): Post {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    title: String(data.title ?? ""),
    dek: String(data.dek ?? ""),
    excerpt: String(data.excerpt ?? ""),
    author: String(data.author ?? "House"),
    date: String(data.date ?? ""),
    category: data.category as JournalCategory,
    slug: String(data.slug ?? path.basename(file, path.extname(file))),
    status: parseEditorialStatus(data.status),
    sample: data.sample === true || data.status === "sample",
    content,
  };
}

export function allPosts(): Post[] {
  return walk(ROOT)
    .map(parse)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function publishedPosts(): Post[] {
  return allPosts().filter((p) => p.status === "published");
}

export function postsIn(category: string): Post[] {
  return publishedPosts().filter((p) => p.category === category);
}

export function getPost(category: string, slug: string): Post | undefined {
  return allPosts().find((p) => p.category === category && p.slug === slug);
}

export function isJournalCategory(value: string): value is JournalCategory {
  return (journalTaxonomy as readonly string[]).includes(value);
}

export function housePostPath(category: JournalCategory, slug: string): string {
  return assertInside(ROOT, path.join(ROOT, category, `${slug}.mdx`));
}

export function writeHousePost(input: HousePostInput): { file: string } {
  const slug = assertSafeSlug(input.slug || slugify(input.title));
  if (!isJournalCategory(input.category)) {
    throw new Error("invalid_category");
  }

  const nextPath = housePostPath(input.category, slug);
  const previousCategory =
    input.previousCategory && isJournalCategory(input.previousCategory)
      ? input.previousCategory
      : undefined;
  const previousSlug = input.previousSlug
    ? assertSafeSlug(input.previousSlug)
    : undefined;
  const previousPath =
    previousCategory && previousSlug
      ? housePostPath(previousCategory, previousSlug)
      : undefined;

  if (fs.existsSync(nextPath) && nextPath !== previousPath) {
    throw new Error("slug_taken");
  }

  const frontmatter: Record<string, unknown> = {
    title: input.title,
    dek: input.dek,
    excerpt: input.excerpt,
    author: input.author || "House",
    date: input.date,
    category: input.category,
    slug,
    status: input.status,
  };
  if (input.sample) frontmatter.sample = true;

  writeMdxFile(nextPath, frontmatter, input.content);
  if (previousPath && previousPath !== nextPath) {
    removeFileIfExists(previousPath);
  }
  return { file: nextPath };
}
