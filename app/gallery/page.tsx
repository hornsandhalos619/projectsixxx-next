import type { Metadata } from "next";
import Link from "next/link";
import { artists } from "@/lib/artists";
import { SampleBadge } from "@/components/SampleBadge";

export const metadata: Metadata = {
  title: "Gallery",
  description: "House roster and named collaborator slots. SAMPLE until media lands.",
};

export default function GalleryPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Gallery</p>
        <h1>Roster</h1>
        <p className="lede">
          House first. Named collaborator slots are SAMPLE / media pending —
          short attribution only, no invented personal history.
        </p>
      </header>
      <div className="grid-2">
        {artists.map((artist) => (
          <article className="card" key={artist.slug}>
            {artist.status === "sample" ? <SampleBadge label="SAMPLE" /> : null}
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
