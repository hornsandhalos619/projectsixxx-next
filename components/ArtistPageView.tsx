import type { ReactNode } from "react";
import Link from "next/link";
import type { Artist, Work } from "@/lib/artists";
import type { ArtistPageCopy } from "@/lib/gallery/page-copy";

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

function workDoors(work: Work): { label: string; href: string }[] {
  if (work.links?.length) return work.links;
  if (work.href) return [{ label: work.title, href: work.href }];
  return [];
}

function DoorLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function WorkStill({ work, mediaPending }: { work: Work; mediaPending: boolean }) {
  const pending = mediaPending || !work.mediaUrl;
  const still = pending ? (
    <div className="work-still" />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={work.mediaUrl} alt="" />
  );

  if (work.href) {
    return (
      <a href={work.href} target="_blank" rel="noopener" aria-label={work.title}>
        {still}
      </a>
    );
  }
  return still;
}

export function ArtistPageView({
  artist,
  copy,
}: {
  artist: Artist;
  copy?: ArtistPageCopy;
}) {
  const mediaPending = Boolean(artist.mediaPending);
  const kicker = copy?.kicker ?? artist.role;

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          {kicker}
          {mediaPending ? <span className="muted"> · media pending</span> : null}
        </p>
        <h1>{artist.name}</h1>
        <p className="lede">{artist.bio}</p>
      </header>

      <figure className="hero-still" aria-label="Hero still — hairline frame, media pending">
        {mediaPending ? (
          <figcaption className="hero-still-caption">House still pending</figcaption>
        ) : null}
      </figure>

      {copy?.profile ? (
        <section className="section">
          <p className="kicker">Profile</p>
          <p className="lede">{copy.profile}</p>
        </section>
      ) : null}

      {copy?.skills?.length ? (
        <section className="section">
          <p className="kicker">Skills / contributions</p>
          <div className="skill-stack">
            {copy.skills.map((skill) => (
              <article className="card" key={skill.title}>
                <h3>{skill.title}</h3>
                <p className="muted">{skill.detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {copy?.whySelected ? (
        <section className="section">
          <p className="kicker">Why selected</p>
          <p className="lede">{copy.whySelected}</p>
        </section>
      ) : null}

      <section>
        <p className="kicker">Works</p>
        {artist.works.length === 0 ? (
          <p className="muted">No works listed yet. Slot holds the name until approved media arrives.</p>
        ) : (
          <div className="works">
            {artist.works.map((work) => {
              const doors = workDoors(work);
              return (
                <figure className="work" key={work.title}>
                  <WorkStill work={work} mediaPending={mediaPending} />
                  <figcaption>
                    {work.title} · {work.year} · {work.medium}
                    <br />
                    {work.caption}
                    {doors.length ? (
                      <>
                        <br />
                        {doors.map((door, index) => (
                          <span key={door.href}>
                            {index > 0 ? " · " : null}
                            <DoorLink href={door.href} className="outbound">
                              {door.label} →
                            </DoorLink>
                          </span>
                        ))}
                      </>
                    ) : null}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </section>

      {copy?.memorial ? (
        <section className="section">
          <p className="kicker">Memorial</p>
          <p className="lede memorial">{copy.memorial}</p>
        </section>
      ) : null}

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
          <div className="store-links">
            {artist.social.map((item) => (
              <DoorLink key={item.href} href={item.href}>
                {item.label} →
              </DoorLink>
            ))}
          </div>
        ) : null}
        {artist.store.length > 0 ? (
          <div className="store-links">
            {artist.store.map((item) => (
              <DoorLink key={item.href} href={item.href}>
                {item.label} →
              </DoorLink>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
