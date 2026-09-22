"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSeeShopAdmin } from "@/config/roles";
import { isValidSlug, slugify } from "@/lib/cms/slug";
import { detectLiveStore } from "@/lib/live";
import {
  parseAffiliateNetwork,
  parseShopCategory,
  removeAffiliateProduct,
  saveAffiliateProduct,
} from "@/lib/affiliates/store";
import { getViewer } from "@/lib/session";

export type ShopState = { ok: false; error: string } | null;

async function requireShop() {
  const viewer = await getViewer();
  if (!canSeeShopAdmin(viewer.role)) {
    return { ok: false as const, error: "Shop desk is closed for this seat." };
  }
  if (!detectLiveStore().writable) {
    return {
      ok: false as const,
      error: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save products.",
    };
  }
  return { ok: true as const };
}

export async function saveAffiliateEntry(
  _prev: ShopState,
  formData: FormData,
): Promise<ShopState> {
  const gate = await requireShop();
  if (!gate.ok) return gate;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  if (!isValidSlug(slug)) return { ok: false, error: "Slug needs lowercase letters, numbers, and hyphens." };
  const category = parseShopCategory(String(formData.get("category") ?? ""));
  if (!category) return { ok: false, error: "Choose a shop shelf." };
  const previousSlug = String(formData.get("previousSlug") ?? "").trim();
  const merchantUrl = String(formData.get("merchantUrl") ?? "").trim();
  if (!merchantUrl) return { ok: false, error: "Merchant URL is required." };

  try {
    if (previousSlug && previousSlug !== slug) await removeAffiliateProduct(previousSlug);
    await saveAffiliateProduct({
      slug,
      category,
      name,
      dek: String(formData.get("dek") ?? "").trim(),
      belief: String(formData.get("belief") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim() || undefined,
      merchant: String(formData.get("merchant") ?? "").trim() || "Merchant",
      merchantUrl,
      network: parseAffiliateNetwork(String(formData.get("network") ?? "merchant")),
      status: String(formData.get("status") ?? "sample") === "live" ? "live" : "sample",
      priceHint: String(formData.get("priceHint") ?? "").trim(),
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }

  redirect(`/admin/shop/${slug}?saved=1`);
}

export async function deleteAffiliateEntry(formData: FormData): Promise<void> {
  const gate = await requireShop();
  if (!gate.ok) return;
  const slug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  if (!isValidSlug(slug)) return;
  await removeAffiliateProduct(slug, category);
  revalidatePath("/admin/shop");
  redirect("/admin/shop");
}
