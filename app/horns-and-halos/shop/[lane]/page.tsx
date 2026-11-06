import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hhLanes, loadHhProducts, selectLaneProducts, type HhLaneKey } from "@/lib/horns-halos-shop";

export const revalidate = 900;

export function generateStaticParams() {
  return Object.keys(hhLanes).map((lane) => ({ lane }));
}

export async function generateMetadata({ params }: { params: Promise<{ lane: string }> }): Promise<Metadata> {
  const { lane } = await params;
  if (!(lane in hhLanes)) return {};
  const copy = hhLanes[lane as HhLaneKey];
  return {
    title: `Shop ${copy.name} | Horns & Halos`,
    robots: { index: false, follow: true },
    description: `${copy.eyebrow} Browse Release 001 and open the actual Shopify product listings.`,
    alternates: { canonical: `/horns-and-halos/shop/${lane}` },
  };
}

export default async function HhShopLane({ params }: { params: Promise<{ lane: string }> }) {
  const { lane } = await params;
  if (!(lane in hhLanes)) notFound();
  const key = lane as HhLaneKey;
  const copy = hhLanes[key];
  const opposite = hhLanes[copy.other];
  const catalog = await loadHhProducts();
  const products = selectLaneProducts(catalog, key);

  return (
    <div className="portal-root">
      <section className={`hh-shop-hero hh-shop-hero--${key}`} aria-labelledby="shop-lane-title">
        <div className={`hh-shop-geo hh-shop-geo--${key}`} aria-hidden />
        <div className="hh-shop-hero-veil" aria-hidden />
        <div className="shell hh-shop-hero-copy">
          <p className="kicker">Horns & Halos / Release 001</p>
          <h1 id="shop-lane-title">{copy.name}</h1>
          <p className="hh-shop-hero-line">{copy.eyebrow}</p>
          <p>{copy.intro}</p>
          <nav className="hh-lane-switch" aria-label="Choose a collection">
            <Link aria-current="page" className="btn btn-house" href={`/horns-and-halos/shop/${key}`}>{copy.name}</Link>
            <Link className="btn btn-silver" href={`/horns-and-halos/shop/${copy.other}`}>Shop {opposite.name}</Link>
          </nav>
        </div>
      </section>

      <section className="shell section" aria-labelledby="release-title">
        <p className="kicker">Own the piece</p>
        <h2 id="release-title">Release 001 / {copy.name}</h2>
        <p className="muted">Every card opens its product listing on my own Shopify store, with current options, size guide, and checkout.</p>
        <p className="hh-photo-note">Actual product photography will return after per-image source evidence and a founder check.</p>
        {products.length > 0 ? (
          <div className={`grid-tees hh-release-grid hh-release-grid--${products.length}`}>
            {products.map((product) => (
              <a key={product.handle} className="card hh-product-card" href={product.url} target="_blank" rel="noopener noreferrer">
                <div className="hh-image-withheld" role="img" aria-label="Product image withheld pending source verification"><span>Product image withheld pending source verification</span></div>
                <div className="hh-product-card-copy">
                  <p className="kicker">{copy.name} / Release 001</p>
                  <h3>{product.title}</h3>
                  <div className="hh-product-card-buy"><span>{product.price ?? "See live price"}</span><span>View product ↗</span></div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="hh-catalog-unavailable" role="status">
            <h3>The live collection is temporarily unavailable.</h3>
            <p>No substitute products or photos are shown. Continue to the store to check the current catalog.</p>
          </div>
        )}
        <div className="cta-row">
          <a className="btn btn-house" href={`https://hornshalosshop.myshopify.com/collections/release-001/${key}`} target="_blank" rel="noopener noreferrer">View {copy.name} on Shopify ↗</a>
        </div>
      </section>

      <section className="shell section hh-buyer-guide" aria-labelledby="buyer-guide-title" id="buyer-guide">
        <p className="kicker">Buyer guide / {copy.name}</p>
        <h2 id="buyer-guide-title">Choose the line. Then check the fit.</h2>
        <p className="hh-buyer-guide-intro">This page contains Release 001, not the whole Horns & Halos catalog. It is a collection of garments printed to order, not digital downloads. This {copy.name} release contains {products.length === 1 ? "one" : products.length === 3 ? "three" : String(products.length)} Release 001 {products.length === 1 ? "product" : "products"}, each with its own product page on my own Shopify store.</p>
        <div className="hh-guide-grid">
          <article><h3>Read the sleeve</h3><p>Infinite Conflict. belongs to Horns. Unbroken, Eternal Balance., and Brilliance belong to Halos. Each design has its own standalone idea; the world portal brings them together without mixing the collections.</p></article>
          <article><h3>Size with the listing</h3><p>These Release 001 tees run S–2XL at $35. Use the size guide on the actual product page before choosing. Garment blanks may vary; the publisher's guide advises sizing up when in doubt. Fabric composition is not stated on these listings, so this guide does not guess it.</p></article>
          <article><h3>Made to order</h3><p>The listings describe typical production and transit of 7–14 business days in the US, not a guaranteed delivery date. For damaged or misprinted pieces, contact support within 14 days (see the refund policy linked below). Wash cold, inside out, hang dry, and do not iron the print.</p></article>
        </div>
        {products.length > 0 && (
          <nav className="hh-guide-products" aria-label={`Before you buy: ${copy.name} listings`}>
            <ul>
              {products.map((product) => (
                <li key={product.handle} data-handle={product.handle}>
                  <a href={product.url} target="_blank" rel="noopener noreferrer">Open {product.title} listing and size guide ↗</a>
                  <span>{product.price ?? "See live price"}</span>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <nav className="hh-guide-links" aria-label="Before you buy">
          <a href="https://hornshalosshop.myshopify.com/collections/all" target="_blank" rel="noopener noreferrer">Browse the full shop, including digital items ↗</a>
          <a href="https://hornshalosshop.myshopify.com/policies/refund-policy" target="_blank" rel="noopener noreferrer">Refund &amp; support policy ↗</a>
          <Link href="/horns-and-halos">Enter the full world portal</Link>
          <span>Old Outer Horns and Oculus listings are not live, so they are not offered here.</span>
        </nav>
      </section>
    </div>
  );
}
