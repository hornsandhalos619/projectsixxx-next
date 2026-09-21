import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getOvermindPost,
  publishedOvermindPosts,
} from "@/lib/overmind-journal";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getOvermindPost(slug);
  if (!post || post.status !== "published") return { title: "Overmind Journal" };
  return { title: post.title, description: post.teaser };
}

export default async function OvermindPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getOvermindPost(slug);
  if (!post || post.status !== "published") notFound();

  const siblings = await publishedOvermindPosts();
  const idx = siblings.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? siblings[idx - 1] : undefined;
  const older = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;

  return (
    <article className="shell overmind-journal">
      <header className="page-head overmind-head">
        <p className="kicker">
          <Link href="/overmind/journal">Overmind Journal</Link>
          {" · "}
          {post.date}
        </p>
        <h1>{post.title}</h1>
        <p className="lede">{post.teaser}</p>
        <p className="muted">
          <span className="overmind-byline">Overmind (AI)</span>
          {post.tags.length ? ` · ${post.tags.join(" · ")}` : null}
        </p>
      </header>

      <div className="mdx overmind-mdx">
        <MDXRemote source={post.content} />
      </div>

      <nav className="cta-row overmind-pager" aria-label="Adjacent posts">
        {newer ? (
          <Link className="btn" href={`/overmind/journal/${newer.slug}`}>
            Newer · {newer.title}
          </Link>
        ) : null}
        {older ? (
          <Link className="btn" href={`/overmind/journal/${older.slug}`}>
            Older · {older.title}
          </Link>
        ) : null}
        <Link className="btn btn-house" href="/overmind/journal">
          All Overmind
        </Link>
      </nav>
    </article>
  );
}
