import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getGuide,
  guideCanonicalUrl,
  guideHeading,
  guideJsonLd,
  publishedGuides,
} from "@/lib/guides";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide || guide.status !== "published") return { title: "Guides" };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: guideCanonicalUrl(guide.slug) },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide || guide.status !== "published") notFound();
  const heading = guideHeading(guide);
  const jsonLd = guideJsonLd(guide);

  return (
    <article className="shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="page-head">
        <p className="kicker">
          <Link href="/guides">Guides</Link>
          {guide.date ? ` · ${guide.date}` : null}
        </p>
        <h1>{heading}</h1>
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
