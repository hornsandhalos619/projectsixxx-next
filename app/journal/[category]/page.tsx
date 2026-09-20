import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { journalTaxonomy, taxonomyCopy } from "@/config/site";
import { isJournalCategory, postsIn } from "@/lib/journal";
import { SampleBadge } from "@/components/SampleBadge";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return journalTaxonomy.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isJournalCategory(category)) return { title: "Journal" };
  const copy = taxonomyCopy[category];
  return { title: copy.title, description: copy.dek };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isJournalCategory(category)) notFound();
  const copy = taxonomyCopy[category];
  const posts = postsIn(category);

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Journal</p>
        <h1>{copy.title}</h1>
        <p className="lede">{copy.dek}</p>
      </header>
      {posts.length === 0 ? (
        <p className="muted">This shelf is built. The first house post has not been set here yet.</p>
      ) : (
        posts.map((post) => (
          <article className="card" key={post.slug}>
            {post.status === "sample" ? <SampleBadge /> : null}
            <h2>
              <Link href={`/journal/${post.category}/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="muted">{post.excerpt}</p>
          </article>
        ))
      )}
    </div>
  );
}
