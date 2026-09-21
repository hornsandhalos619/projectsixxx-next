import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, isJournalCategory, publishedPosts } from "@/lib/journal";
import { SampleBadge } from "@/components/SampleBadge";

type Props = { params: Promise<{ category: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return (await publishedPosts()).map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPost(category, slug);
  if (!post || post.visibility !== "published") return { title: "Journal" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { category, slug } = await params;
  if (!isJournalCategory(category)) notFound();
  const post = await getPost(category, slug);
  if (!post || post.visibility !== "published") notFound();

  return (
    <article className="shell">
      <header className="page-head">
        <p className="kicker">
          {post.category}
          {post.status === "sample" ? (
            <>
              {" "}
              <SampleBadge />
            </>
          ) : null}
        </p>
        <h1>{post.title}</h1>
        <p className="lede">{post.dek}</p>
        <p className="muted">
          {post.author} · {post.date}
        </p>
      </header>
      <div className="mdx">
        <MDXRemote source={post.content} />
      </div>
      <div className="cta-row">
        <Link className="btn btn-house" href="/journal/fine-art">
          Fine-art shelf
        </Link>
        <Link className="btn" href="/journal">
          All shelves
        </Link>
      </div>
    </article>
  );
}
