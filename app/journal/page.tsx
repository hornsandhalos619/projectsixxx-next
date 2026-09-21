import type { Metadata } from "next";
import Link from "next/link";
import { journalTaxonomy, taxonomyCopy } from "@/config/site";
import { allPosts } from "@/lib/journal";
import { SampleBadge } from "@/components/SampleBadge";

export const metadata: Metadata = {
  title: "Journal",
  description: "House writing. Craft, commerce, and the quiet tests.",
};

export const dynamic = "force-dynamic";

export default async function JournalIndexPage() {
  const posts = await allPosts();
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Journal</p>
        <h1>The cut we keep</h1>
        <p className="lede">Taxonomy is sterile. The sentences are not.</p>
      </header>

      <section>
        {posts.map((post) => (
          <article key={`${post.category}/${post.slug}`} className="card" style={{ marginBottom: "1px" }}>
            {post.status === "sample" ? <SampleBadge /> : null}
            <p className="kicker">{post.category}</p>
            <h2>
              <Link href={`/journal/${post.category}/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="muted">{post.dek}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <p className="kicker">Shelves</p>
        <div className="grid-2">
          {journalTaxonomy.map((slug) => (
            <Link className="card" key={slug} href={`/journal/${slug}`}>
              <h3>{taxonomyCopy[slug].title}</h3>
              <p className="muted">{taxonomyCopy[slug].dek}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
