import type { Metadata } from "next";
import { site } from "@/config/site";
import { amazonLink, type AmazonSection } from "@/config/amazon-page";

export const SITE_ORIGIN = "https://projectsixxx.com";

/** House brand plate for og:image / twitter:image. Never Amazon media. */
export const SHARE_IMAGE_PATH = "/brand/horns-hero-obsidian-glass.png";

export const SHARE_IMAGE = {
  url: SHARE_IMAGE_PATH,
  width: 1280,
  height: 720,
  alt: site.name,
} as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function shareMetadata(
  path: string,
  extras: {
    title?: string;
    description?: string;
    type?: "website" | "article";
  } = {},
): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const url = absoluteUrl(path);
  const type = extras.type ?? "website";
  return {
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      images: [SHARE_IMAGE],
      ...(extras.title ? { title: extras.title } : {}),
      ...(extras.description ? { description: extras.description } : {}),
    },
    twitter: {
      card: "summary_large_image",
      images: [SHARE_IMAGE_PATH],
      ...(extras.title ? { title: extras.title } : {}),
      ...(extras.description ? { description: extras.description } : {}),
    },
  };
}

export function picksItemListJsonLd(sections: AmazonSection[]) {
  const picks = sections.flatMap((section) => section.picks);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: picks.map((pick, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: pick.name,
      url: amazonLink(pick.asin),
    })),
  };
}
