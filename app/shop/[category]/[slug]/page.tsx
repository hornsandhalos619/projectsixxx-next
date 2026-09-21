import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { outboundUrl, productBody, productBySlugs, products } from "@/config/affiliates";
import { EmailCapture } from "@/components/EmailCapture";
import { SampleBadge } from "@/components/SampleBadge";

type Props = { params: Promise<{ category: string; slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const product = productBySlugs(category, slug);
  if (!product) return { title: "Shop" };
  return { title: product.name, description: product.dek };
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params;
  const product = productBySlugs(category, slug);
  if (!product) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          {product.category}
          {product.status === "sample" ? (
            <>
              {" "}
              <SampleBadge />
            </>
          ) : null}
        </p>
        <h1>{product.name}</h1>
        <p className="lede">{productBody(product)}</p>
      </header>
      <p className="muted">{product.priceHint}</p>
      <div className="cta-row">
        <a
          className="btn btn-ember"
          href={outboundUrl(product)}
          rel="sponsored noopener noreferrer"
          target="_blank"
        >
          Continue to {product.merchant}
        </a>
      </div>
      <p className="ftc">
        Affiliate disclosure: we may earn a commission. Tags can be empty; the
        merchant link still works. Rel=sponsored. Target=_blank.
      </p>
      <section className="section">
        <EmailCapture source={`shop-${product.category}-${product.slug}`} />
      </section>
    </div>
  );
}
