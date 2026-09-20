import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allLibraryWorks, libraryBySlug } from "@/lib/library";
import { SampleBadge } from "@/components/SampleBadge";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allLibraryWorks().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = libraryBySlug(slug);
  if (!work) return { title: "Sample" };
  return { title: `Sample — ${work.title}`, description: work.dek };
}

export default async function LibrarySamplePage({ params }: Props) {
  const { slug } = await params;
  const work = libraryBySlug(slug);
  if (!work) notFound();

  return (
    <article className="shell">
      <header className="page-head">
        <p className="kicker">
          Sample reader <SampleBadge label="SAMPLE" />
        </p>
        <h1>{work.title}</h1>
        <p className="lede">Local sample. No account required. No payment.</p>
      </header>
      <div className="prose mdx">
        {work.sample.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="cta-row">
        <Link className="btn btn-house" href={`/library/${work.slug}`}>
          Work detail
        </Link>
        <Link className="btn" href="/library">
          Library
        </Link>
      </div>
    </article>
  );
}
