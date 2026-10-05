import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { ArtistPageView } from "@/components/ArtistPageView";
import { isPublishedArtist, publishedArtists } from "@/lib/artists";
import { artistPageCopy } from "@/lib/gallery/page-copy";
import { getArtist } from "@/lib/gallery/store";

type Props = { params: Promise<{ artist: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return publishedArtists().map((a) => ({ artist: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { artist: slug } = await params;
  const artist = await getArtist(slug);
  const copy = artistPageCopy(slug);
  if (!artist || (!isPublishedArtist(artist) && !copy)) return { title: "Gallery" };
  if (!isPublishedArtist(artist) && process.env.VERCEL_ENV === "production") {
    return { title: "Gallery" };
  }
  return {
    title: artist.name,
    description: artist.bio,
    ...(!isPublishedArtist(artist) ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ArtistPage({ params }: Props) {
  const { artist: slug } = await params;
  const artist = await getArtist(slug);
  const copy = artistPageCopy(slug);
  if (!artist || (!isPublishedArtist(artist) && !copy)) notFound();
  if (!isPublishedArtist(artist) && process.env.VERCEL_ENV === "production") notFound();

  return <ArtistPageView artist={artist} copy={copy} />;
}
