import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowTheHouse } from "@/components/FollowTheHouse";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import {
  getTapestryLanding,
  listTapestryLandings,
  relatedTapestries,
  tapestryCollectionLandingUrl,
  tapestryLandingPath,
  type TapestryLanding,
} from "@/lib/tapestry-drop";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await listTapestryLandings();
  return items.map((item) => ({ slug: item.slug }));
}

function landingMetadata(item: TapestryLanding): Metadata {
  const url = absoluteUrl(tapestryLandingPath(item.slug));
  return {
    title: item.title,
    description: item.copy,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: item.title,
      description: item.copy,
      images: [{ url: item.image, alt: item.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@horns_halos_619",
      title: item.title,
      description: item.copy,
      images: [item.image],
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getTapestryLanding(slug);
  if (!item) return { title: "Crest Tapestries" };
  return landingMetadata(item);
}

export default async function TapestryLandingPage({ params }: Props) {
  const { slug } = await params;
  const items = await listTapestryLandings();
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();

  const related = relatedTapestries(items, item.slug, 3);
  const collectionUrl = tapestryCollectionLandingUrl(`landing-${item.slug}`);

  return (
    <article className="shell drop-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: item.title,
          image: item.image,
          description: item.copy,
          brand: { "@type": "Brand", name: item.series },
          offers: {
            "@type": "Offer",
            url: item.buyUrl,
            priceCurrency: "USD",
            price: item.priceAmount,
            availability: "https://schema.org/InStock",
          },
        }}
      />

      <header className="page-head drop-head">
        <p className="kicker">
          <Link href="/drop">The drop</Link>
          {" · "}
          {item.series}
        </p>
        <div className="drop-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.imageAlt} />
        </div>
        <h1>{item.title}</h1>
        <p className="drop-price">{item.price}</p>
        <p className="lede">{item.copy}</p>
        <div className="cta-row">
          <a className="btn btn-house" href={item.buyUrl} rel="noopener noreferrer" target="_blank">
            Buy on the shop
          </a>
          <a className="btn btn-silver" href={collectionUrl} rel="noopener noreferrer" target="_blank">
            All crest tapestries
          </a>
        </div>
      </header>

      <FollowTheHouse spot="home" />

      {related.length > 0 ? (
        <section className="drop-more section" aria-label="More from the drop">
          <h2>More from the drop</h2>
          <ul className="drop-related-grid">
            {related.map((other) => (
              <li key={other.slug}>
                <Link className="drop-related-card" href={tapestryLandingPath(other.slug)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={other.image} alt={other.imageAlt} />
                  <div className="drop-related-card-copy">
                    <p className="kicker">{other.series}</p>
                    <h3>{other.shortTitle}</h3>
                    <p className="drop-price">{other.price}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
