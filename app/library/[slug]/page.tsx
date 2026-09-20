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
  if (!work) return { title: "Library" };
  return { title: work.title, description: work.dek };
}

export default async function LibraryWorkPage({ params }: Props) {
  const { slug } = await params;
  const work = libraryBySlug(slug);
  if (!work) notFound();

  return (
    <article className="shell">
      <header className="page-head">
        <p className="kicker">
          Library
          {work.status === "sample" ? (
            <>
              {" "}
              <SampleBadge label="SAMPLE" />
            </>
          ) : null}
        </p>
        <h1>{work.title}</h1>
        <p className="lede">{work.dek}</p>
        <p className="muted">
          {work.author} · {work.year} · {work.format}
        </p>
      </header>
      <div className="prose">
        <p>{work.blurb}</p>
        <p className="muted">
          No payments on this shelf. When the house opens a real storefront, the
          door will be labeled. Until then: read the sample.
        </p>
      </div>
      <div className="cta-row">
        <Link className="btn btn-house" href={`/library/${work.slug}/sample`}>
          Read sample
        </Link>
        <Link className="btn" href="/library">
          All titles
        </Link>
      </div>
    </article>
  );
}
