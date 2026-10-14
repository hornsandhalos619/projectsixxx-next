import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getGuide, publishedGuides } from "@/lib/guides";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide || guide.status !== "published") return { title: "Guides" };
  return { title: guide.title, description: guide.description };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide || guide.status !== "published") notFound();

  return (
    <article className="shell">
      <header className="page-head">
        <p className="kicker">
          <Link href="/guides">Guides</Link>
          {guide.date ? ` · ${guide.date}` : null}
        </p>
        <h1>{guide.title}</h1>
        <p className="lede">{guide.description}</p>
      </header>
      <div className="mdx">
        <MDXRemote source={guide.content} />
      </div>
      <div className="cta-row">
        <Link className="btn btn-house" href="/picks">
          Amazon picks
        </Link>
        <Link className="btn" href="/guides">
          All guides
        </Link>
      </div>
    </article>
  );
}
