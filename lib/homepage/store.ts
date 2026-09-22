import { revalidatePath } from "next/cache";
import { localJsonReadObject, localJsonWriteObject } from "@/lib/cms/local-json";
import { defaultHomepageSlots } from "@/lib/homepage/defaults";
import { HOMEPAGE_SLOT_IDS, type HomepageSlot, type HomepageSlotId } from "@/lib/homepage/types";
import { detectLiveStore, liveStoreKind } from "@/lib/live";
import { getSupabase } from "@/lib/supabase";

export { defaultHomepageSlots } from "@/lib/homepage/defaults";
export { HOMEPAGE_SLOT_IDS, type HomepageSlot, type HomepageSlotId } from "@/lib/homepage/types";

function isSlotId(value: string): value is HomepageSlotId {
  return (HOMEPAGE_SLOT_IDS as readonly string[]).includes(value);
}

function asSlot(row: Record<string, unknown>): HomepageSlot | null {
  const slot = String(row.slot ?? "");
  if (!isSlotId(slot)) return null;
  return {
    slot,
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    attribution: String(row.attribution ?? ""),
    href: String(row.href ?? ""),
    enabled: row.enabled !== false,
  };
}

async function listOverlay(): Promise<HomepageSlot[]> {
  const kind = liveStoreKind();
  if (kind === "supabase") {
    const { data, error } = await getSupabase()
      .from("homepage_slots")
      .select("slot, title, body, attribution, href, enabled");
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => asSlot(row as Record<string, unknown>))
      .filter((item): item is HomepageSlot => Boolean(item));
  }
  if (kind === "local") {
    return localJsonReadObject<HomepageSlot[]>("homepage-slots", []);
  }
  return [];
}

export async function listHomepageSlots(): Promise<HomepageSlot[]> {
  try {
    const overlay = await listOverlay();
    return defaultHomepageSlots.map((seed) => overlay.find((item) => item.slot === seed.slot) ?? seed);
  } catch (error) {
    console.error("homepage slots failed", error);
    return defaultHomepageSlots;
  }
}

export async function getHomepageSlot(slot: HomepageSlotId): Promise<HomepageSlot> {
  const slots = await listHomepageSlots();
  return slots.find((item) => item.slot === slot) ?? defaultHomepageSlots.find((item) => item.slot === slot)!;
}

export async function saveHomepageSlot(slot: HomepageSlot): Promise<void> {
  if (!detectLiveStore().writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save homepage slots.");
  }
  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("homepage_slots").upsert(
      {
        slot: slot.slot,
        title: slot.title,
        body: slot.body,
        attribution: slot.attribution,
        href: slot.href || null,
        enabled: slot.enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slot" },
    );
    if (error) throw new Error(error.message);
  } else {
    const current = (await listHomepageSlots()).filter((item) => item.slot !== slot.slot);
    current.push(slot);
    localJsonWriteObject("homepage-slots", current);
  }
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
