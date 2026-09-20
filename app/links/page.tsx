import type { Metadata } from "next";
import Link from "next/link";
import { linkShelves } from "@/lib/links";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Community and research resource hub. Homeless-support links and public-source literacy — no exploit how-tos.",
};

export default function LinksPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Resources</p>
        <h1>Links</h1>
        <p className="lede">
          Community doors and public research literacy. Wired from the journal
          community and research shelves. Never exploit guides.
        </p>
      </header>

      {linkShelves.map((shelf) => (
        <section className="section" key={shelf.slug} aria-labelledby={`shelf-${shelf.slug}`}>
          <p className="kicker">{shelf.slug}</p>
          <h2 id={`shelf-${shelf.slug}`}>{shelf.title}</h2>
          <p className="muted">{shelf.dek}</p>
          <div className="grid-2" style={{ marginTop: "1.25rem" }}>
            {shelf.items.map((item) => (
              <article className="card" key={item.href}>
                <h3>
                  <a href={item.href} rel="noopener noreferrer" target="_blank">
                    {item.title}
                  </a>
                </h3>
                <p className="muted">{item.dek}</p>
              </article>
            ))}
          </div>
          <div className="cta-row">
            <Link className="btn" href={`/journal/${shelf.slug}`}>
              Journal · {shelf.title}
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
