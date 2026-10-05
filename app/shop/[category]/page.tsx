import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import {
  categoryBySlug,
  isFounderPick,
  outboundUrl,
  shopCategories,
} from "@/config/affiliates";
import { productsInCategory } from "@/lib/affiliates/store";
import { EmailCapture } from "@/components/EmailCapture";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return shopCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) return { title: "Shop" };
  return { title: cat.seoTitle, description: cat.seoDescription };
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) notFound();
  const items = await productsInCategory(category);

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop</p>
        <h1>{cat.title}</h1>
        <p className="lede">{cat.dek}</p>
        <AffiliateDisclosure />
      </header>

      {items.map((product) => (
        <article
          className={isFounderPick(product) ? "card void-glass" : "card"}
          key={product.slug}
          style={{ marginBottom: "1rem" }}
        >
          {isFounderPick(product) ? (
            <p className="kicker">
              <span className="badge">Founder&apos;s pick</span>
            </p>
          ) : null}
          <h2>
            <Link href={`/shop/${product.category}/${product.slug}`}>{product.name}</Link>
          </h2>
          <p>{product.dek}</p>
          {product.belief !== product.dek ? <p className="muted">{product.belief}</p> : null}
          {product.priceHint ? <p className="muted">{product.priceHint}</p> : null}
          <div className="cta-row">
            <a
              className="btn btn-ember"
              href={outboundUrl(product)}
              rel="sponsored nofollow noopener noreferrer"
              target="_blank"
            >
              View at {product.merchant}
            </a>
          </div>
        </article>
      ))}

      <section className="section">
        <EmailCapture source={`shop-${category}`} />
      </section>
    </div>
  );
}
