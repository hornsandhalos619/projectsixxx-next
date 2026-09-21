import type { Metadata } from "next";
import Link from "next/link";
import { housePillars } from "@/config/pillars";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web design, agentic bots, and B2B work beside art, music, film, literature, fashion, technology, and frontier AI.",
};

const items = [
  {
    href: "/services/web-design",
    title: "Web design",
    dek: "Sites with atmosphere over a clean IA. No kit sludge.",
  },
  {
    href: "/services/agentic-bots",
    title: "Agentic bots",
    dek: "Agents that stay on a leash. House rules first.",
  },
  {
    href: "/services/b2b",
    title: "B2B",
    dek: "Quiet engagements. SAMPLE labels: Abacus Films, Oakwood-Residential.",
  },
];

export default function ServicesPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Services</p>
        <h1>Tech in the dark</h1>
        <p className="lede">
          The house takes work that can sit next to the art without embarrassing
          it. Music, film, and literature stay visible — technology is one
          pillar.
        </p>
      </header>

      <section className="section">
        <p className="kicker">Seven pillars</p>
        <div className="pillars pillars-seven">
          {housePillars.map((pillar) => (
            <article className="pillar" key={pillar.slug}>
              <h3>{pillar.title}</h3>
              <p>{pillar.dek}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid-2">
        {items.map((item) => (
          <Link className="card" key={item.href} href={item.href}>
            <h2>{item.title}</h2>
            <p className="muted">{item.dek}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
