import { shopifyUrl } from "@/config/shops";

export const SHOPIFY_PRODUCTS_JSON =
  "https://hornshalosshop.myshopify.com/products.json";

export type ShopifyCatalogProduct = {
  title: string;
  handle: string;
  product_type?: string;
  tags?: string[];
  body_html?: string;
  variants?: { price?: string | null }[];
  images?: { src?: string }[];
};

export type ShopifyTeeCard = {
  title: string;
  handle: string;
  url: string;
  price: string | null;
  image: string;
  lane: string | null;
};

const EDITORIAL_BY_HANDLE: Record<string, { src: string; lane: string }> = {
  unbroken: {
    src: "/brand/halos-r001-unbroken-tee-editorial.png",
    lane: "Halos",
  },
  "eternal-balance": {
    src: "/brand/halos-r001-eternal-balance-tee-editorial.png",
    lane: "Halos",
  },
  brilliance: {
    src: "/brand/halos-r001-brilliance-tee-editorial.png",
    lane: "Halos",
  },
  "infinite-conflict": {
    src: "/brand/horns-r001-infinite-conflict-tee-editorial.png",
    lane: "Horns",
  },
};

const APPAREL_RE =
  /t-?shirt|\btee\b|\btees\b|hoodie|sweatshirt|crewneck|apparel|clothing|garment/i;

export function isApparelTee(product: ShopifyCatalogProduct): boolean {
  const type = product.product_type ?? "";
  const title = product.title ?? "";
  const tags = (product.tags ?? []).join(" ");
  const body = product.body_html ?? "";
  const images = (product.images ?? []).map((image) => image.src ?? "").join(" ");
  return APPAREL_RE.test(`${type} ${title} ${tags} ${body} ${images}`);
}

export function shopifyProductUrl(handle: string, storefront = shopifyUrl): string {
  const base = storefront.replace(/\/+$/, "");
  return `${base}/products/${handle}`;
}

export function catalogPrice(product: ShopifyCatalogProduct): string | null {
  const raw = product.variants?.find((variant) => variant.price)?.price;
  if (!raw) return null;
  const amount = Number.parseFloat(raw);
  if (!Number.isFinite(amount)) return null;
  return `$${amount.toFixed(2)}`;
}

export function teeLane(product: ShopifyCatalogProduct): string | null {
  const tags = product.tags ?? [];
  if (tags.some((tag) => tag.toLowerCase() === "horns")) return "Horns";
  if (tags.some((tag) => tag.toLowerCase() === "halos")) return "Halos";
  return EDITORIAL_BY_HANDLE[product.handle]?.lane ?? null;
}

export function toTeeCard(product: ShopifyCatalogProduct): ShopifyTeeCard {
  const editorial = EDITORIAL_BY_HANDLE[product.handle];
  return {
    title: product.title,
    handle: product.handle,
    url: shopifyProductUrl(product.handle),
    price: catalogPrice(product),
    image: editorial?.src ?? product.images?.[0]?.src ?? "",
    lane: teeLane(product),
  };
}

export function selectShopifyTees(products: ShopifyCatalogProduct[]): ShopifyTeeCard[] {
  const tees = products
    .filter(isApparelTee)
    .map(toTeeCard)
    .filter((tee) => tee.handle && tee.title && tee.image);
  if (tees.length % 2 === 1) return tees.slice(0, -1);
  return tees;
}

export async function loadShopifyTees(): Promise<ShopifyTeeCard[]> {
  try {
    const response = await fetch(SHOPIFY_PRODUCTS_JSON, {
      cache: "force-cache",
      next: { revalidate: 3600 },
    } as RequestInit & { next: { revalidate: number } });
    if (!response.ok) return [];
    const data = (await response.json()) as { products?: ShopifyCatalogProduct[] };
    return selectShopifyTees(data.products ?? []);
  } catch {
    return [];
  }
}
