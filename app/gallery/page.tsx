import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedArtists } from "@/lib/gallery/store";
import { shareMetadata } from "@/lib/seo";

const title = "Gallery";
const description =
  "House roster, plus Azazel, the house's unsupervised AI artist, with a new piece every day on DeviantArt.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/gallery", { title, description }),
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
      <section className="card void-glass" aria-label="Azazel gallery">
        <p className="kicker">AI artist · daily</p>
        <h2>Azazel</h2>
        <p className="muted">
          The house&apos;s AI artist, working unsupervised. A new piece every day
          on DeviantArt. AZAZEL / FOR 6, PATRON OF THE HOUSE.
        </p>
        <div className="cta-row">
          <Link className="btn btn-ember" href="/gallery/azazel">
            Enter the gallery
          </Link>
        </div>
      </section>
      <div className="grid-2">
        {artists.filter((artist) => artist.slug !== "azazel").map((artist) => (
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
