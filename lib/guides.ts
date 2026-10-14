import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isValidSlug } from "@/lib/cms/slug";

export type GuideStatus = "draft" | "published";

export type GuideMeta = {
  title: string;
  description: string;
  slug: string;
  date: string;
  status: GuideStatus;
};

export type Guide = GuideMeta & { content: string };

function guidesRoot() {
  return path.join(process.cwd(), "content/guides");
}

function parseGuide(file: string): Guide | null {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const slug = String(data.slug ?? path.basename(file, path.extname(file)));
    const title = String(data.title ?? "");
    if (!isValidSlug(slug) || !title) return null;
    const status = data.status === "draft" ? "draft" : "published";
    return {
      title,
      description: String(data.description ?? data.dek ?? data.excerpt ?? ""),
      slug,
      date: String(data.date ?? ""),
      status,
      content: content.replace(/^\n/, ""),
    };
  } catch (error) {
    console.error("guide parse failed", file, error);
    return null;
  }
}

export function allGuides(): Guide[] {
  const root = guidesRoot();
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"))
    .map((name) => parseGuide(path.join(root, name)))
    .filter((guide): guide is Guide => Boolean(guide))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.title.localeCompare(b.title);
    });
}

export function publishedGuides(): Guide[] {
  return allGuides().filter((guide) => guide.status === "published");
}

export function getGuide(slug: string): Guide | undefined {
  return allGuides().find((guide) => guide.slug === slug);
}
