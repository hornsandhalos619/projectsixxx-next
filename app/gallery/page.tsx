import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedArtists } from "@/lib/gallery/store";

export const metadata: Metadata = {
  title: "Gallery",
  description: "House roster and named collaborator slots.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const artists = await listPublishedArtists();
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Gallery</p>
        <h1>Roster</h1>
        <p className="lede">
          House first. Named collaborator slots wait for media. Short attribution
          only.
        </p>
      </header>
      <div className="grid-2">
        {artists.map((artist) => (
          <article className="card" key={artist.slug}>
            <p className="kicker">
              {artist.role}
              {artist.mediaPending ? " · media pending" : ""}
            </p>
            <h2>
              <Link href={`/gallery/${artist.slug}`}>{artist.name}</Link>
            </h2>
            <p className="muted">{artist.bio}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
