import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { isFounderPick, outboundUrl, publishedProducts } from "@/config/affiliates";
import { getPublishedAffiliateProduct } from "@/lib/affiliates/store";
import { EmailCapture } from "@/components/EmailCapture";

type Props = { params: Promise<{ category: string; slug: string }> };

export function generateStaticParams() {
  return publishedProducts().map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getPublishedAffiliateProduct(category, slug);
  if (!product) return { title: "Shop" };
  return { title: product.name, description: product.dek };
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params;
  const product = await getPublishedAffiliateProduct(category, slug);
  if (!product) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          {product.category}
          {isFounderPick(product) ? (
            <>
              {" "}
              <span className="badge">Founder&apos;s pick</span>
            </>
          ) : null}
        </p>
        <h1>{product.name}</h1>
        <p className="lede">{product.dek}</p>
        {product.belief !== product.dek ? <p>{product.belief}</p> : null}
        {product.body && product.body !== product.belief && product.body !== product.dek ? (
          <p className="muted">{product.body}</p>
        ) : null}
        <AffiliateDisclosure />
      </header>
      {product.priceHint ? <p className="muted">{product.priceHint}</p> : null}
      <div className="cta-row">
        <a
          className="btn btn-ember"
          href={outboundUrl(product)}
          rel="sponsored nofollow noopener noreferrer"
          target="_blank"
        >
          Continue to {product.merchant}
        </a>
      </div>
      <section className="section">
        <EmailCapture source={`shop-${product.category}-${product.slug}`} />
      </section>
    </div>
  );
}
