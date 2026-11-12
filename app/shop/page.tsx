import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { ShopCategoryTiles } from "@/components/ShopCategoryTiles";
import { TeeEditorial } from "@/components/TeeEditorial";
import { shopifyUrl, visibleOutboundShops } from "@/config/shops";
import { SOFT_LAUNCH_COPY, SOFT_LAUNCH_SOURCE, SOFT_LAUNCH_TAG } from "@/config/leads";
import { EmailCapture } from "@/components/EmailCapture";
import { loadShopifyTees } from "@/lib/shopify-tees";

import { shareMetadata } from "@/lib/seo";

const title = "Shop";
const description =
  "Horns & Halos gothic tribal streetwear, open on Shopify, plus the house affiliate shelves. HORNS UP / HALOS ON™. Est. in Darkness.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/shop", { title, description }),
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
          <Link className="btn btn-silver" href="/palace">
            Palace of Wonders
          </Link>
        </div>
        <p className="muted" style={{ marginTop: "0.85rem" }}>
          The shop is a door. The Palace is deeper exploration — OVERMIND, agents, maze, and the
          Threshold of Death.
        </p>
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

      <section className="section" aria-label="Shop list">
        <p className="kicker">The shop is open</p>
        <h2>First release line, available now.</h2>
        <p className="muted">
          Horns and Halos Release 001 tees and hoodies are live in the shop. Join the list for one welcome note and
          first word on every new release.
        </p>
        <div className="cta-row">
          <a className="btn btn-ember" href={shopifyUrl} rel="noopener noreferrer" target="_blank">
            Open the shop
          </a>
        </div>
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
