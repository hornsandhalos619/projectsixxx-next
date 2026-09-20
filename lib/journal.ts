import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { journalTaxonomy, type JournalCategory } from "@/config/site";

export type PostStatus = "sample" | "house";

export type PostMeta = {
  title: string;
  dek: string;
  excerpt: string;
  author: string;
  date: string;
  category: JournalCategory;
  slug: string;
  status: PostStatus;
};

export type Post = PostMeta & { content: string };

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
    status: data.status === "house" ? "house" : "sample",
    content,
  };
}

export function allPosts(): Post[] {
  return walk(ROOT)
    .map(parse)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function postsIn(category: string): Post[] {
  return allPosts().filter((p) => p.category === category);
}

export function getPost(category: string, slug: string): Post | undefined {
  return allPosts().find((p) => p.category === category && p.slug === slug);
}

export function isJournalCategory(value: string): value is JournalCategory {
  return (journalTaxonomy as readonly string[]).includes(value);
}
