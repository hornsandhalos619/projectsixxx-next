import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { artists } from "@/lib/artists";
import { SampleBadge } from "@/components/SampleBadge";
import { getArtist } from "@/lib/gallery/store";

type Props = { params: Promise<{ artist: string }> };

export function generateStaticParams() {
  return artists.map((a) => ({ artist: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { artist: slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) return { title: "Gallery" };
  return { title: artist.name, description: artist.bio };
}

export default async function ArtistPage({ params }: Props) {
  const { artist: slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          {artist.role}
          {artist.status === "sample" ? (
            <>
              {" "}
              <SampleBadge label="SAMPLE" />
            </>
          ) : null}
          {artist.mediaPending ? (
            <span className="muted"> · media pending</span>
          ) : null}
        </p>
        <h1>{artist.name}</h1>
        <p className="lede">{artist.bio}</p>
      </header>

      <figure className="hero-still" aria-label="Hero still — hairline frame, media pending" />

      <section>
        <p className="kicker">Works</p>
        {artist.works.length === 0 ? (
          <p className="muted">No works listed yet. Slot holds the name until approved media arrives.</p>
        ) : (
          <div className="works">
            {artist.works.map((work) => (
              <figure className="work" key={work.title}>
                {work.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={work.mediaUrl} alt="" />
                ) : (
                  <div className="work-still" />
                )}
                <figcaption>
                  {work.title} · {work.year} · {work.medium}
                  <br />
                  {work.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <p className="kicker">Contact</p>
        {artist.email ? (
          <p>
            <a href={`mailto:${artist.email}`}>{artist.email}</a>
          </p>
        ) : (
          <p className="muted">Contact reserved until the founder sets a public line.</p>
        )}
        {artist.social.length > 0 ? (
          <p className="muted">
            {artist.social.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.label}
              </Link>
            ))}
          </p>
        ) : null}
        {artist.store.length > 0 ? (
          <div className="store-links">
            {artist.store.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.label} →
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
