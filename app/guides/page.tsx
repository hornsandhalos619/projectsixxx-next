import type { Metadata } from "next";
import Link from "next/link";
import { publishedGuides } from "@/lib/guides";
import { shareMetadata } from "@/lib/seo";

const title = "Guides";
const description = "Dark gift guides and gothic reading notes from Horns & Halos.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/guides", { title, description }),
};

export default function GuidesIndexPage() {
  const guides = publishedGuides();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Guides</p>
        <h1>Dark gift guides</h1>
        <p className="lede">Editorial picks that point back to the Amazon shelf. Choose your side.</p>
      </header>
      <section aria-label="Published guides">
        {guides.map((guide) => (
          <article key={guide.slug} className="card" style={{ marginBottom: "1px" }}>
            <p className="kicker">{guide.date}</p>
            <h2>
              <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
            </h2>
            <p className="muted">{guide.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
