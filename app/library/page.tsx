import type { Metadata } from "next";
import Link from "next/link";
import { listLibraryTitles } from "@/lib/titles/store";

export const metadata: Metadata = {
  title: "Library",
  description: "On-site e-book store and reading library. Titles you can read on the site.",
};

export const dynamic = "force-dynamic";

export default async function LibraryIndexPage() {
  const works = await listLibraryTitles();
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Library</p>
        <h1>Reading room</h1>
        <p className="lede">
          Sterile catalog. On-site samples you can read here. No Stripe. No fake
          checkout — commerce waits for a real door.
        </p>
      </header>
      <div className="grid-2">
        {works.map((work) => (
          <article className="card" key={work.slug}>
            <p className="kicker">{work.format}</p>
            <h2>
              <Link href={`/library/${work.slug}`}>{work.title}</Link>
            </h2>
            <p className="muted">{work.blurb}</p>
            <p className="muted">
              {work.author} · {work.year}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
