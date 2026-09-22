import { revalidatePath } from "next/cache";
import {
  products as seedProducts,
  type AffiliateNetwork,
  type AffiliateProduct,
  type ShopCategorySlug,
} from "@/config/affiliates";
import { localJsonRead, localJsonWrite } from "@/lib/cms/local-json";
import { isValidSlug } from "@/lib/cms/slug";
import { detectLiveStore, liveStoreKind, mergeBySlug } from "@/lib/live";
import { getSupabase } from "@/lib/supabase";

const LOCAL_FILE = "affiliate-cms";

const NETWORKS: AffiliateNetwork[] = [
  "amazon",
  "sweetwater",
  "thomann",
  "bandh",
  "zzounds",
  "merchant",
];

const CATEGORIES: ShopCategorySlug[] = [
  "guitars",
  "synths",
  "tablets",
  "art-supplies",
  "computer-gear",
];

function isNetwork(value: string): value is AffiliateNetwork {
  return (NETWORKS as string[]).includes(value);
}

function isCategory(value: string): value is ShopCategorySlug {
  return (CATEGORIES as string[]).includes(value);
}

function rowToProduct(row: Record<string, unknown>): AffiliateProduct | null {
  const slug = String(row.slug ?? "");
  const category = String(row.category ?? "");
  const network = String(row.network ?? "merchant");
  const name = String(row.name ?? "");
  if (!slug || !name || !isCategory(category) || !isNetwork(network)) return null;
  return {
    slug,
    category,
    name,
    dek: String(row.dek ?? ""),
    belief: String(row.belief ?? ""),
    body: row.body ? String(row.body) : undefined,
    merchant: String(row.merchant ?? ""),
    merchantUrl: String(row.merchant_url ?? row.merchantUrl ?? ""),
    network,
    status: row.status === "live" ? "live" : "sample",
    priceHint: String(row.price_hint ?? row.priceHint ?? ""),
  };
}

async function listOverlay(): Promise<AffiliateProduct[]> {
  const kind = liveStoreKind();
  if (kind === "supabase") {
    const { data, error } = await getSupabase()
      .from("affiliate_products")
      .select(
        "slug, category, name, dek, belief, body, merchant, merchant_url, network, status, price_hint, featured",
      )
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => rowToProduct(row as Record<string, unknown>))
      .filter((item): item is AffiliateProduct => Boolean(item));
  }
  if (kind === "local") return localJsonRead<AffiliateProduct>(LOCAL_FILE);
  return [];
}

export async function listAffiliateProducts(): Promise<AffiliateProduct[]> {
  try {
    return mergeBySlug(seedProducts, await listOverlay());
  } catch (error) {
    console.error("affiliate list failed", error);
    return seedProducts;
  }
}

export async function getAffiliateProduct(
  category: string,
  slug: string,
): Promise<AffiliateProduct | undefined> {
  return (await listAffiliateProducts()).find(
    (product) => product.category === category && product.slug === slug,
  );
}

export async function productsInCategory(category: string): Promise<AffiliateProduct[]> {
  return (await listAffiliateProducts()).filter((product) => product.category === category);
}

function revalidateShop(product?: Pick<AffiliateProduct, "category" | "slug">): void {
  revalidatePath("/shop");
  revalidatePath("/admin/shop");
  revalidatePath("/");
  if (product) {
    revalidatePath(`/shop/${product.category}`);
    revalidatePath(`/shop/${product.category}/${product.slug}`);
    revalidatePath(`/admin/shop/${product.slug}`);
  }
}

export async function saveAffiliateProduct(product: AffiliateProduct): Promise<void> {
  if (!detectLiveStore().writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save products.");
  }
  if (!isValidSlug(product.slug)) throw new Error("Slug needs lowercase letters, numbers, and hyphens.");

  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("affiliate_products").upsert(
      {
        slug: product.slug,
        category: product.category,
        name: product.name,
        dek: product.dek,
        belief: product.belief,
        body: product.body ?? null,
        merchant: product.merchant,
        merchant_url: product.merchantUrl,
        network: product.network,
        status: product.status,
        price_hint: product.priceHint,
        featured: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(error.message);
    revalidateShop(product);
    return;
  }

  const current = localJsonRead<AffiliateProduct>(LOCAL_FILE).filter((item) => item.slug !== product.slug);
  current.push(product);
  localJsonWrite(LOCAL_FILE, current);
  revalidateShop(product);
}

export async function removeAffiliateProduct(slug: string, category?: string): Promise<void> {
  if (!detectLiveStore().writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to remove desk copies.");
  }
  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("affiliate_products").delete().eq("slug", slug);
    if (error) throw new Error(error.message);
  } else {
    localJsonWrite(
      LOCAL_FILE,
      localJsonRead<AffiliateProduct>(LOCAL_FILE).filter((item) => item.slug !== slug),
    );
  }
  revalidateShop(category ? { category: category as AffiliateProduct["category"], slug } : undefined);
}

export function parseAffiliateNetwork(value: string): AffiliateNetwork {
  return isNetwork(value) ? value : "merchant";
}

export function parseShopCategory(value: string): ShopCategorySlug | null {
  return isCategory(value) ? value : null;
}
