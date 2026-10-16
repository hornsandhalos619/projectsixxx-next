import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { site } from "@/config/site";
import { isValidSlug } from "@/lib/cms/slug";

export type GuideStatus = "draft" | "published";

export type GuideMeta = {
  title: string;
  description: string;
  slug: string;
  date: string;
  status: GuideStatus;
  /** Visible H1. Falls back to title when omitted. */
  heading: string;
};

export type Guide = GuideMeta & { content: string };

export type GuideJsonLd = Record<string, unknown>;

export function guideCanonicalUrl(slug: string): string {
  return `${site.url}/guides/${slug}`;
}

export function guideHeading(guide: Pick<GuideMeta, "title" | "heading">): string {
  return guide.heading.trim() ? guide.heading : guide.title;
}

export function guideJsonLd(guide: GuideMeta): GuideJsonLd[] {
  const url = guideCanonicalUrl(guide.slug);
  const heading = guideHeading(guide);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: heading,
      name: guide.title,
      description: guide.description,
      datePublished: guide.date || undefined,
      url,
      mainEntityOfPage: url,
      publisher: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Guides",
          item: `${site.url}/guides`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: heading,
          item: url,
        },
      ],
    },
  ];
}

function stampDate(value: unknown): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const parsed = new Date(trimmed);
    if (Number.isFinite(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return trimmed;
  }
  return "";
}

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
    const heading = String(data.heading ?? "").trim() || title;
    return {
      title,
      description: String(data.description ?? data.dek ?? data.excerpt ?? ""),
      slug,
      date: stampDate(data.date),
      status,
      heading,
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
