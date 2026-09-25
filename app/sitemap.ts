import type { MetadataRoute } from "next";
import { shopCategories } from "@/config/affiliates";
import { journalTaxonomy, site } from "@/config/site";
import { listAffiliateProducts } from "@/lib/affiliates/store";
import { listArtists } from "@/lib/gallery/store";
import { publishedPosts } from "@/lib/journal";
import { publishedOvermindPosts } from "@/lib/overmind-journal";
import { listLibraryTitles } from "@/lib/titles/store";

export const dynamic = "force-dynamic";

function pageUrl(path: string): string {
  if (path === "/") return site.url;
  return `${site.url}${path}`;
}

function asDate(value: string | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: pageUrl(path),
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, overmind, titles, artists, products] = await Promise.all([
    publishedPosts(),
    publishedOvermindPosts(),
    listLibraryTitles(),
    listArtists(),
    listAffiliateProducts(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    entry("/", "weekly", 1),
    entry("/horns-and-halos", "weekly", 0.9),
    entry("/journal", "weekly", 0.8),
    entry("/library", "weekly", 0.8),
    entry("/gallery", "weekly", 0.8),
    entry("/shop", "weekly", 0.8),
    entry("/services", "weekly", 0.7),
    entry("/services/web-design", "monthly", 0.6),
    entry("/services/agentic-bots", "monthly", 0.6),
    entry("/services/b2b", "monthly", 0.6),
    entry("/contact", "monthly", 0.6),
    entry("/schedule", "monthly", 0.6),
    entry("/links", "monthly", 0.6),
    entry("/studio", "monthly", 0.6),
    entry("/overmind/journal", "weekly", 0.6),
    entry("/legal/privacy", "yearly", 0.3),
    entry("/legal/terms", "yearly", 0.3),
    ...journalTaxonomy.map((category) => entry(`/journal/${category}`, "weekly", 0.5)),
    ...shopCategories.map((category) => entry(`/shop/${category.slug}`, "weekly", 0.6)),
    ...posts
      .filter((post) => post.category && post.slug)
      .map((post) =>
        entry(`/journal/${post.category}/${post.slug}`, "monthly", 0.6, asDate(post.date)),
      ),
    ...overmind
      .filter((post) => post.slug)
      .map((post) =>
        entry(`/overmind/journal/${post.slug}`, "weekly", 0.5, asDate(post.date)),
      ),
    ...titles.flatMap((work) =>
      work.slug
        ? [
            entry(`/library/${work.slug}`, "monthly", 0.5),
            entry(`/library/${work.slug}/sample`, "monthly", 0.3),
          ]
        : [],
    ),
    ...artists
      .filter((artist) => artist.slug)
      .map((artist) => entry(`/gallery/${artist.slug}`, "monthly", 0.5)),
    ...products
      .filter((product) => product.category && product.slug)
      .map((product) =>
        entry(`/shop/${product.category}/${product.slug}`, "weekly", 0.5),
      ),
  ];

  const seen = new Set<string>();
  return entries.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
