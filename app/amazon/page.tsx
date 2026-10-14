import type { Metadata } from "next";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { amazonLink, amazonSections } from "@/config/amazon-page";

export const metadata: Metadata = {
  title: "Amazon picks",
  description: "Hand-picked Horns & Halos finds on Amazon: altar and candlelight, silver and gold, steel, books, chess and the desk.",
};

export default function AmazonPage() {
  return (
    <div className="shell">
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
          <div className="grid-2" style={{ marginTop: "1rem" }}>
            {section.picks.map((p) => (
              <article className="card" key={p.asin}>
                <p className="kicker">{p.lane}</p>
                <h3>{p.name}</h3>
                <p>{p.note}</p>
                <a href={amazonLink(p.asin)} rel="sponsored nofollow noopener noreferrer" target="_blank">
                  Check today&apos;s price
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
