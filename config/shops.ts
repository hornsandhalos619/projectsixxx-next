/**
 * Outbound shop lanes. Never invent live storefront URLs.
 *
 * Commerce pivot 2026-09-06 (founder): soft-launch is Shopify.
 * Founder door 2026-09-06: https://hornshalosshop.myshopify.com/
 * Spreadshop paused — SPREADSHOP_URL_LOCKED retained but not auto-applied.
 */
export type OutboundShop = {
  id: "shopify" | "spreadshop";
  title: string;
  dek: string;
  /** Empty string omits this lane from the public shop. */
  url: string;
  cta: string;
};

/** Founder-locked primary soft-launch door. Prefer env when set. */
export const SHOPIFY_URL_LOCKED = "https://hornshalosshop.myshopify.com/";
export const shopifyUrl =
  (process.env.SHOPIFY_URL ?? "").trim() || SHOPIFY_URL_LOCKED;

/** Retained locked door (no hyphens). Not auto-applied while Spreadshop is paused. */
export const SPREADSHOP_URL_LOCKED = "https://hornsandhalos.myspreadshop.com/";

/** Paused lane: env only. Empty omits the lane from the public shop. */
export const spreadshopUrl = (process.env.SPREADSHOP_URL ?? "").trim();

export const outboundShops: OutboundShop[] = [
  {
    id: "shopify",
    title: "Shopify",
    dek: "R001 door for Horns & Halos merch. Primary.",
    url: shopifyUrl,
    cta: "Enter Shopify store",
  },
  {
    id: "spreadshop",
    title: "Spreadshop",
    dek: "Paused. Secondary door when the founder reopens this lane.",
    url: spreadshopUrl,
    cta: "Open Spreadshop",
  },
];

export function visibleOutboundShops(shops: OutboundShop[] = outboundShops) {
  return shops.filter((shop) => shop.url.length > 0);
}
