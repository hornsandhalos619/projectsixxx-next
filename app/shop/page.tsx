import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { ShopCategoryTiles } from "@/components/ShopCategoryTiles";
import { TeeEditorial } from "@/components/TeeEditorial";
import { shopifyUrl, visibleOutboundShops } from "@/config/shops";
import { SOFT_LAUNCH_COPY, SOFT_LAUNCH_SOURCE, SOFT_LAUNCH_TAG } from "@/config/leads";
import { EmailCapture } from "@/components/EmailCapture";
import { loadShopifyTees } from "@/lib/shopify-tees";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Three lanes: affiliate catalog, Shopify soft-launch (primary), Spreadshop paused. Belief first. Est. in Darkness.",
};

export const revalidate = 3600;

export default async function ShopPage() {
  const tees = await loadShopifyTees();
  const shopLanes = visibleOutboundShops();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop</p>
        <h1>Horns &amp; Halos shop</h1>
        <p className="lede">
          Primary door is Shopify. Affiliate shelves stay on this hub.
          Spreadshop is paused.
        </p>
        <AffiliateDisclosure />
        <div className="cta-row" style={{ marginTop: "1.25rem" }}>
          <a
            className="btn btn-ember"
            href={shopifyUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Enter Shopify store
          </a>
        </div>
      </header>

      <section className="section" aria-label="Shop duality">
        <p className="kicker">Duality</p>
        <h2>Horns void · Halos parchment</h2>
        <div className="grid-2" style={{ marginTop: "1.25rem", alignItems: "center" }}>
          <figure className="card void-glass" style={{ padding: 0, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/horns-shop-teaser-obsidian.png"
              alt="Horns shop teaser — obsidian glass"
              width={800}
              height={800}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <figcaption className="muted" style={{ padding: "0.85rem 1rem" }}>
              Horns teaser — obsidian glass / crimson fissure (Outerwright)
            </figcaption>
          </figure>
          <figure className="card void-glass" style={{ padding: 0, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/halos-immortal-ring-print.png"
              alt="Halos — immortal light ring"
              width={800}
              height={800}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <figcaption className="muted" style={{ padding: "0.85rem 1rem" }}>
              Halos — immortal light ring (soft glow)
            </figcaption>
          </figure>
        </div>
        <div className="cta-row">
          <a
            className="btn btn-ember"
            href={shopifyUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Enter Shopify store
          </a>
        </div>
      </section>

      <section className="section" aria-label="Shop lanes">
        <p className="kicker">Lanes</p>
        <div className="grid-2">
          <article className="card void-glass">
            <p className="kicker">Lane 01</p>
            <h2>Affiliate catalog</h2>
            <p className="muted">
              Guitars, synths, tablets, art supplies, computer gear — SEO
              landings, belief copy, then a merchant door. Leads welcome.
            </p>
            <div className="cta-row">
              <Link className="btn btn-ember" href="#affiliate-shelves">
                Browse affiliates
              </Link>
            </div>
          </article>
          {shopLanes.map((shop) => (
            <article className="card void-glass" key={shop.id}>
              <p className="kicker">
                Lane {shop.id === "shopify" ? "02" : "03"}
              </p>
              <h2>{shop.title}</h2>
              <p className="muted">{shop.dek}</p>
              <div className="cta-row">
                <a
                  className="btn btn-ember"
                  href={shop.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {shop.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="affiliate-shelves" aria-label="Affiliate shelves">
        <p className="kicker">Affiliate shelves</p>
        <h2>Tools that earn a place</h2>
        <ShopCategoryTiles cardClassName="card void-glass" />
      </section>

      <TeeEditorial tees={tees} />

      <section className="section" aria-label="Soft-launch list">
        <p className="kicker">Soft launch</p>
        <h2>The door is emailed</h2>
        <p className="muted">
          One welcome. The shop URL stays private until Proof PASS.
        </p>
        <EmailCapture
          source={SOFT_LAUNCH_SOURCE}
          tag={SOFT_LAUNCH_TAG}
          nextHref={shopifyUrl || undefined}
          label={SOFT_LAUNCH_COPY.label}
          buttonLabel={SOFT_LAUNCH_COPY.button}
          success={SOFT_LAUNCH_COPY.success}
          successCta={SOFT_LAUNCH_COPY.successCta}
        />
      </section>
    </div>
  );
}
