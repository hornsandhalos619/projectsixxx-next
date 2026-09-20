import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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

const ROOT = path.join(process.cwd(), "content/overmind/journal");

function files(): string[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT)
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"))
    .map((name) => path.join(ROOT, name));
}

function parse(file: string): OvermindPost {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t: unknown) => String(t))
    : [];
  return {
    title: String(data.title ?? ""),
    slug: String(data.slug ?? path.basename(file, path.extname(file))),
    date: String(data.date ?? ""),
    author: "Overmind",
    stream: "overmind",
    tags,
    teaser: String(data.teaser ?? "").slice(0, 160),
    status: data.status === "published" ? "published" : "draft",
    content,
  };
}

export function allOvermindPosts(): OvermindPost[] {
  return files()
    .map(parse)
    .filter((p) => p.stream === "overmind")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function publishedOvermindPosts(): OvermindPost[] {
  return allOvermindPosts().filter((p) => p.status === "published");
}

export function getOvermindPost(slug: string): OvermindPost | undefined {
  return allOvermindPosts().find((p) => p.slug === slug);
}
