import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { JsonLd } from "@/components/JsonLd";
import { amazonLink, amazonSections } from "@/config/amazon-page";
import { publishedGuides } from "@/lib/guides";
import { picksItemListJsonLd, shareMetadata } from "@/lib/seo";

const title = "Dark Aesthetic Gift Picks by Budget | Project SiXXX";
const description =
  "Hand-picked Horns & Halos finds on Amazon, grouped by budget tier. Altar and candlelight, silver and gold, steel, books, chess and the desk.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  ...shareMetadata("/picks", { title, description }),
};

export default function AmazonPage() {
  const guides = publishedGuides();

  return (
    <div className="shell">
      <JsonLd data={picksItemListJsonLd(amazonSections)} />
      <header className="page-head">
        <p className="kicker">Amazon</p>
        <h1>Horns &amp; Halos on Amazon</h1>
        <p className="lede">Picked by hand for the house. Choose your side.</p>
        <AffiliateDisclosure />
        <nav aria-label="Sections" className="cta-row" style={{ marginTop: "1rem" }}>
          {amazonSections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>{s.title}</a>
          ))}
        </nav>
      </header>
      {amazonSections.map((section) => (
        <section className="section" id={section.id} key={section.id} aria-label={section.title}>
          <h2>{section.title}</h2>
          <p className="muted">{section.dek}</p>
          <div className="grid-2 picks-grid" style={{ marginTop: "1rem" }}>
            {section.picks.map((p) => (
              <article className="card" key={p.asin}>
                <p className="kicker">{p.theme}</p>
                <p className="muted">{p.lane}</p>
                <h3>{p.name}</h3>
                <p>{p.note}</p>
                <a href={amazonLink(p.asin)} rel="sponsored nofollow" target="_blank">
                  Check today&apos;s price
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      <section className="section" aria-label="Guides">
        <h2>
          <Link href="/guides">Guides</Link>
        </h2>
        <nav className="cta-row" aria-label="Published guides">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`}>
              {guide.title}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
