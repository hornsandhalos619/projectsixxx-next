import { shopifyProductUrl, type ShopifyCatalogProduct } from "./shopify-tees";

export const HH_COLLECTION_URL =
  "https://hornshalosshop.myshopify.com/collections/release-001/products.json";

export const hhLanes = {
  horns: {
    slug: "horns",
    name: "Horns",
    line: "Infinite Conflict.",
    other: "halos" as const,
    handles: ["infinite-conflict"],
    eyebrow: "Crimson on black. The side that commits its weight.",
    intro: "Horns is pressure pointed forward: the drive that turns a hard moment into motion. Start with Infinite Conflict. for the line name in small crimson gothic lettering.",
    emblem: "/portal/emblem-horns.png",
  },
  halos: {
    slug: "halos",
    name: "Halos",
    line: "Eternal Balance.",
    other: "horns" as const,
    handles: ["eternal-balance", "unbroken", "brilliance"],
    eyebrow: "Bone and silver on black. The light that holds the line.",
    intro: "Halos is the steady hand, not the soft option. Unbroken is the seal: one knotwork ring, every strand bound into the next. Eternal Balance. is the word, with the period left in. Brilliance keeps the atmosphere: a close crop of light around the dark.",
    emblem: "/portal/emblem-halos.png",
  },
} as const;

export type HhLaneKey = keyof typeof hhLanes;

export const HH_FULL_SHOP_URL = "https://hornshalosshop.myshopify.com/collections/all";
export const HH_REFUND_POLICY_URL = "https://hornshalosshop.myshopify.com/policies/refund-policy";

export type HhUtmSpot = "card" | "guide";

export function taggedProductUrl(url: string, lane: HhLaneKey, spot: HhUtmSpot): string {
  const tagged = new URL(url);
  tagged.searchParams.set("utm_source", "projectsixxx");
  tagged.searchParams.set("utm_medium", "referral");
  tagged.searchParams.set("utm_campaign", "release-001");
  tagged.searchParams.set("utm_content", `${lane}-${spot}`);
  return tagged.toString();
}

export type HhProduct = {
  id: string;
  handle: string;
  title: string;
  url: string;
  price: string | null;
  image?: string;
  imageAlt?: string;
};

export function selectLaneProducts(
  products: ShopifyCatalogProduct[],
  lane: HhLaneKey,
): HhProduct[] {
  const catalog = new Map(products.map((product) => [product.handle, product]));
  return hhLanes[lane].handles.flatMap((handle) => {
    const product = catalog.get(handle);
    if (!product?.handle) return [];
    return [{
      id: product.handle,
      handle: product.handle,
      title: product.title,
      url: shopifyProductUrl(handle),
      price: product.variants?.[0]?.price ? `$${Number(product.variants[0].price).toFixed(2)}` : null,
    }];
  });
}

export async function loadHhProducts() {
  const response = await fetch(HH_COLLECTION_URL, {
    next: { revalidate: 900 },
  });
  if (!response.ok) throw new Error("Collection unavailable; no invented products or photos.");
  const data = (await response.json()) as { products?: (ShopifyCatalogProduct & { vendor?: string })[] };
  return (data.products ?? []).filter((product) => product.vendor === "Horns and Halos");
}
