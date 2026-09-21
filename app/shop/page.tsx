import type { Metadata } from "next";
import Link from "next/link";
import { shopCategories } from "@/config/affiliates";
import { outboundShops, shopifyUrl } from "@/config/shops";
import { SOFT_LAUNCH_COPY, SOFT_LAUNCH_SOURCE, SOFT_LAUNCH_TAG } from "@/config/leads";
import { EmailCapture } from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Three lanes: affiliate catalog, Shopify soft-launch (primary), Spreadshop paused. Belief first. Est. in Darkness.",
};

export default function ShopPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop</p>
        <h1>Horns &amp; Halos shop</h1>
        <p className="lede">
          Primary door is Shopify. Affiliate shelves stay on this hub.
          Spreadshop is paused.
        </p>
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

      <section className="section" aria-label="Shop duality SAMPLE">
        <p className="kicker">Duality SAMPLE</p>
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
          {outboundShops.map((shop) => (
            <article className="card void-glass" key={shop.id}>
              <p className="kicker">
                Lane {shop.id === "shopify" ? "02" : "03"}
              </p>
              <h2>{shop.title}</h2>
              <p className="muted">{shop.dek}</p>
              <div className="cta-row">
                {shop.url ? (
                  <a
                    className="btn btn-ember"
                    href={shop.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {shop.cta}
                  </a>
                ) : (
                  <span className="btn" aria-disabled="true">
                    URL placeholder — set in env
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="affiliate-shelves" aria-label="Affiliate shelves">
        <p className="kicker">Affiliate shelves</p>
        <h2>Tools.</h2>
        <div className="grid-2" style={{ marginTop: "1.25rem" }}>
          {shopCategories.map((cat) => (
            <Link className="card void-glass" key={cat.slug} href={`/shop/${cat.slug}`}>
              <h3>{cat.title}</h3>
              <p className="muted">{cat.dek}</p>
            </Link>
          ))}
        </div>
      </section>


      <section className="section" aria-label="R001 tee editorial SAMPLE">
        <p className="kicker">R001 · $35</p>
        <h2>Tee editorial SAMPLE</h2>
        <p className="muted">
          Ghost-mannequin lookbook plates. Primary money door is Shopify.
        </p>
        <div className="grid-2" style={{ marginTop: "1.25rem" }}>
          {[
            { src: "/brand/horns-r001-outer-horns-tee-editorial.png", title: "Outer Horns", lane: "Horns" },
            { src: "/brand/horns-r001-infinite-conflict-tee-editorial.png", title: "Infinite Conflict.", lane: "Horns" },
            { src: "/brand/horns-r001-oculus-tee-editorial.png", title: "Oculus", lane: "Horns" },
            { src: "/brand/halos-r001-unbroken-tee-editorial.png", title: "Unbroken", lane: "Halos" },
            { src: "/brand/halos-r001-eternal-balance-tee-editorial.png", title: "Eternal Balance.", lane: "Halos" },
            { src: "/brand/halos-r001-brilliance-tee-editorial.png", title: "Brilliance", lane: "Halos" },
          ].map((sku) => (
            <a
              key={sku.src}
              className="card void-glass"
              href={shopifyUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sku.src}
                alt={`${sku.title} tee editorial`}
                width={800}
                height={1000}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div style={{ padding: "0.85rem 1rem" }}>
                <p className="kicker" style={{ marginBottom: "0.35rem" }}>{sku.lane}</p>
                <h3 style={{ margin: 0 }}>{sku.title}</h3>
                <p className="muted" style={{ margin: "0.35rem 0 0" }}>$35.00 · Enter Shopify store</p>
              </div>
            </a>
          ))}
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

      <section className="section" aria-label="Soft-launch list">
        <p className="kicker">Soft launch</p>
        <h2>The door is emailed</h2>
        <p className="muted">
          One welcome. Shop URL only — not sent as public until Proof PASS.
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
