import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryBySlug, outboundUrl, productsIn, shopCategories } from "@/config/affiliates";
import { EmailCapture } from "@/components/EmailCapture";
import { SampleBadge } from "@/components/SampleBadge";

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
  const items = productsIn(category);

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop</p>
        <h1>{cat.title}</h1>
        <p className="lede">{cat.dek}</p>
      </header>

      {items.map((product) => (
        <article className="card" key={product.slug} style={{ marginBottom: "1rem" }}>
          {product.status === "sample" ? <SampleBadge /> : null}
          <h2>
            <Link href={`/shop/${product.category}/${product.slug}`}>{product.name}</Link>
          </h2>
          <p>{product.belief}</p>
          <p className="muted">{product.dek}</p>
          <div className="cta-row">
            <a
              className="btn btn-ember"
              href={outboundUrl(product)}
              rel="sponsored noopener noreferrer"
              target="_blank"
            >
              View at {product.merchant}
            </a>
          </div>
          <p className="ftc">
            As an affiliate, the house may earn from qualifying purchases. Empty
            partner tags still open the merchant. This is not a house sacrament.
          </p>
        </article>
      ))}

      <section className="section">
        <EmailCapture source={`shop-${category}`} />
      </section>
    </div>
  );
}
