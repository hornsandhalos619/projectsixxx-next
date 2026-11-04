import { site } from "@/config/site";
import { absoluteUrl, SHARE_IMAGE_PATH } from "@/lib/seo";
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
    teaser: String(record.teaser || record.excerpt || "").slice(0, 160),
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

export function overmindCanonicalUrl(slug: string): string {
  return absoluteUrl(`/overmind/journal/${slug}`);
}

export function overmindJsonLd(post: OvermindPostMeta) {
  const url = overmindCanonicalUrl(post.slug);
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.teaser,
      datePublished: post.date || undefined,
      url,
      mainEntityOfPage: url,
      image: absoluteUrl(SHARE_IMAGE_PATH),
      author: { "@type": "Organization", name: "Overmind", url: absoluteUrl("/overmind/journal") },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Overmind Journal", item: absoluteUrl("/overmind/journal") },
        { "@type": "ListItem", position: 2, name: post.title, item: url },
      ],
    },
  ];
}
