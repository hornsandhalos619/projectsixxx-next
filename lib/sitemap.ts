import type { MetadataRoute } from "next";
import { shopCategories } from "@/config/affiliates";
import { journalTaxonomy, site } from "@/config/site";
import { isValidSlug } from "@/lib/cms/slug";

export type SitemapSource = () => unknown;
export type SitemapSources = {
  journal?: SitemapSource;
  overmind?: SitemapSource;
  library?: SitemapSource;
  gallery?: SitemapSource;
  affiliates?: SitemapSource;
};

type SitemapEntry = MetadataRoute.Sitemap[number];

export const SITEMAP_CORE_PATHS = [
  "/",
  "/horns-and-halos",
  "/journal",
  "/library",
  "/gallery",
  "/shop",
  "/services",
  "/services/web-design",
  "/services/agentic-bots",
  "/services/b2b",
  "/contact",
  "/schedule",
  "/links",
  "/studio",
  "/overmind/journal",
  "/legal/privacy",
  "/legal/terms",
] as const;

function origin(): string {
  return typeof site.url === "string" && site.url.startsWith("http")
    ? site.url
    : "https://projectsixxx.com";
}

function pageUrl(path: string): string {
  if (path === "/") return origin();
  return `${origin()}${path}`;
}

function asDate(value: unknown): Date {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : new Date();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : new Date();
  }
  if (typeof value !== "string" || !value.trim()) return new Date();
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : new Date();
}

function field(value: unknown, key: string): string {
  if (!value || typeof value !== "object") return "";
  const raw = (value as Record<string, unknown>)[key];
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  if (raw instanceof Date && Number.isFinite(raw.getTime())) return raw.toISOString();
  return "";
}

function isJournalCategory(value: string): boolean {
  return (journalTaxonomy as readonly string[]).includes(value);
}

export function isValidSitemapEntry(item: SitemapEntry): item is SitemapEntry & {
  url: string;
  lastModified: Date;
} {
  if (typeof item.url !== "string" || !/^https?:\/\//.test(item.url)) return false;
  const modified = item.lastModified;
  if (!(modified instanceof Date) || !Number.isFinite(modified.getTime())) return false;
  return true;
}

function entry(
  path: string,
  changeFrequency: SitemapEntry["changeFrequency"],
  priority: number,
  lastModified?: Date,
): SitemapEntry | null {
  if (path !== "/" && !path.startsWith("/")) return null;
  const item: SitemapEntry = {
    url: pageUrl(path),
    lastModified: asDate(lastModified),
    changeFrequency,
    priority,
  };
  return isValidSitemapEntry(item) ? item : null;
}

function keep(items: Array<SitemapEntry | null | undefined>): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];
  for (const item of items) {
    if (!item || !isValidSitemapEntry(item)) continue;
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    out.push(item);
  }
  return out;
}

const CORE_PAGE_META: Record<
  (typeof SITEMAP_CORE_PATHS)[number],
  { changeFrequency: SitemapEntry["changeFrequency"]; priority: number }
> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/horns-and-halos": { changeFrequency: "weekly", priority: 0.9 },
  "/journal": { changeFrequency: "weekly", priority: 0.8 },
  "/library": { changeFrequency: "weekly", priority: 0.8 },
  "/gallery": { changeFrequency: "weekly", priority: 0.8 },
  "/shop": { changeFrequency: "weekly", priority: 0.8 },
  "/services": { changeFrequency: "weekly", priority: 0.7 },
  "/services/web-design": { changeFrequency: "monthly", priority: 0.6 },
  "/services/agentic-bots": { changeFrequency: "monthly", priority: 0.6 },
  "/services/b2b": { changeFrequency: "monthly", priority: 0.6 },
  "/contact": { changeFrequency: "monthly", priority: 0.6 },
  "/schedule": { changeFrequency: "monthly", priority: 0.6 },
  "/links": { changeFrequency: "monthly", priority: 0.6 },
  "/studio": { changeFrequency: "monthly", priority: 0.6 },
  "/overmind/journal": { changeFrequency: "weekly", priority: 0.6 },
  "/legal/privacy": { changeFrequency: "yearly", priority: 0.3 },
  "/legal/terms": { changeFrequency: "yearly", priority: 0.3 },
};

export function coreSitemapEntries(): MetadataRoute.Sitemap {
  try {
    const items: Array<SitemapEntry | null> = SITEMAP_CORE_PATHS.map((path) => {
      const meta = CORE_PAGE_META[path];
      return entry(path, meta.changeFrequency, meta.priority);
    });
    for (const category of journalTaxonomy) {
      items.push(entry(`/journal/${category}`, "weekly", 0.5));
    }
    for (const category of shopCategories) {
      items.push(entry(`/shop/${category.slug}`, "weekly", 0.6));
    }
    const built = keep(items);
    if (built.length > 0) return built;
  } catch (error) {
    console.error("sitemap core entries failed", error);
  }
  return [
    {
      url: "https://projectsixxx.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

export async function safe(label: string, fn: SitemapSource): Promise<unknown[]> {
  try {
    const value = await fn();
    if (!Array.isArray(value)) {
      console.error(`sitemap ${label} returned non-array`);
      return [];
    }
    return value;
  } catch (error) {
    console.error(`sitemap ${label} failed`, error);
    return [];
  }
}

function defaultSources(): Required<SitemapSources> {
  return {
    journal: () => import("@/lib/journal").then((mod) => mod.publishedPosts()),
    overmind: () => import("@/lib/overmind-journal").then((mod) => mod.publishedOvermindPosts()),
    library: () => import("@/lib/titles/store").then((mod) => mod.listLibraryTitles()),
    gallery: () => import("@/lib/gallery/store").then((mod) => mod.listPublishedArtists()),
    affiliates: () => import("@/lib/affiliates/store").then((mod) => mod.listAffiliateProducts()),
  };
}

function journalEntries(posts: unknown[]): MetadataRoute.Sitemap {
  const items: Array<SitemapEntry | null> = [];
  for (const post of posts) {
    try {
      const category = field(post, "category");
      const slug = field(post, "slug");
      if (!isJournalCategory(category) || !isValidSlug(slug)) continue;
      items.push(entry(`/journal/${category}/${slug}`, "monthly", 0.6, asDate(field(post, "date"))));
    } catch (error) {
      console.error("sitemap journal entry failed", error);
    }
  }
  return keep(items);
}

function overmindEntries(posts: unknown[]): MetadataRoute.Sitemap {
  const items: Array<SitemapEntry | null> = [];
  for (const post of posts) {
    try {
      const slug = field(post, "slug");
      if (!isValidSlug(slug)) continue;
      items.push(entry(`/overmind/journal/${slug}`, "weekly", 0.5, asDate(field(post, "date"))));
    } catch (error) {
      console.error("sitemap overmind entry failed", error);
    }
  }
  return keep(items);
}

function libraryEntries(titles: unknown[]): MetadataRoute.Sitemap {
  const items: Array<SitemapEntry | null> = [];
  for (const work of titles) {
    try {
      const slug = field(work, "slug");
      if (!isValidSlug(slug)) continue;
      items.push(entry(`/library/${slug}`, "monthly", 0.5));
      items.push(entry(`/library/${slug}/sample`, "monthly", 0.3));
    } catch (error) {
      console.error("sitemap library entry failed", error);
    }
  }
  return keep(items);
}

function galleryEntries(artists: unknown[]): MetadataRoute.Sitemap {
  const items: Array<SitemapEntry | null> = [];
  for (const artist of artists) {
    try {
      const slug = field(artist, "slug");
      if (!isValidSlug(slug)) continue;
      items.push(entry(`/gallery/${slug}`, "monthly", 0.5));
    } catch (error) {
      console.error("sitemap gallery entry failed", error);
    }
  }
  return keep(items);
}

function affiliateEntries(products: unknown[]): MetadataRoute.Sitemap {
  const items: Array<SitemapEntry | null> = [];
  for (const product of products) {
    try {
      const category = field(product, "category");
      const slug = field(product, "slug");
      if (!isValidSlug(category) || !isValidSlug(slug)) continue;
      items.push(entry(`/shop/${category}/${slug}`, "weekly", 0.5));
    } catch (error) {
      console.error("sitemap affiliate entry failed", error);
    }
  }
  return keep(items);
}

async function assemble(sources: Required<SitemapSources>): Promise<MetadataRoute.Sitemap> {
  const [journal, overmind, library, gallery, affiliates] = await Promise.all([
    safe("journal", sources.journal),
    safe("overmind", sources.overmind),
    safe("library", sources.library),
    safe("gallery", sources.gallery),
    safe("affiliates", sources.affiliates),
  ]);

  const sections: MetadataRoute.Sitemap[] = [coreSitemapEntries()];

  try {
    sections.push(journalEntries(journal));
  } catch (error) {
    console.error("sitemap journal section failed", error);
  }
  try {
    sections.push(overmindEntries(overmind));
  } catch (error) {
    console.error("sitemap overmind section failed", error);
  }
  try {
    sections.push(libraryEntries(library));
  } catch (error) {
    console.error("sitemap library section failed", error);
  }
  try {
    sections.push(galleryEntries(gallery));
  } catch (error) {
    console.error("sitemap gallery section failed", error);
  }
  try {
    sections.push(affiliateEntries(affiliates));
  } catch (error) {
    console.error("sitemap affiliates section failed", error);
  }

  return keep(sections.flat());
}

export async function buildSitemap(overrides: SitemapSources = {}): Promise<MetadataRoute.Sitemap> {
  try {
    return await assemble({ ...defaultSources(), ...overrides });
  } catch (error) {
    console.error("sitemap failed", error);
    return coreSitemapEntries();
  }
}
