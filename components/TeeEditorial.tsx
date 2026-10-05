import React from "react";
import type { ShopifyTeeCard } from "@/lib/shopify-tees";
import { shopifyUrl } from "@/config/shops";

export function TeeEditorial({ tees }: { tees: ShopifyTeeCard[] }) {
  if (tees.length === 0) return null;

  return (
    <section className="section" aria-label="R001 tee editorial">
      <p className="kicker">R001</p>
      <h2>Tee editorial</h2>
      <p className="muted">
        Ghost-mannequin lookbook plates. Primary money door is Shopify.
      </p>
      <div className="grid-2" style={{ marginTop: "1.25rem" }}>
        {tees.map((tee) => (
          <a
            key={tee.handle}
            className="card void-glass"
            href={tee.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tee.image}
              alt={`${tee.title} tee editorial`}
              width={800}
              height={1000}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div style={{ padding: "0.85rem 1rem" }}>
              {tee.lane ? (
                <p className="kicker" style={{ marginBottom: "0.35rem" }}>
                  {tee.lane}
                </p>
              ) : null}
              <h3 style={{ margin: 0 }}>{tee.title}</h3>
              {tee.price ? (
                <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                  {tee.price}
                </p>
              ) : null}
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
  );
}
