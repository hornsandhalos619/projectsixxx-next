"use server";

import { canSeeHomepageAdmin } from "@/config/roles";
import { detectLiveStore } from "@/lib/live";
import {
  HOMEPAGE_SLOT_IDS,
  saveHomepageSlot,
  type HomepageSlotId,
} from "@/lib/homepage/store";
import { getViewer } from "@/lib/session";

export type HomeState = { ok: false; error: string } | { ok: true } | null;

export async function saveHomepageSlotEntry(
  _prev: HomeState,
  formData: FormData,
): Promise<HomeState> {
  const viewer = await getViewer();
  if (!canSeeHomepageAdmin(viewer.role)) {
    return { ok: false, error: "Homepage slots stay with Founder and Blog Admin." };
  }
  if (!detectLiveStore().writable) {
    return {
      ok: false,
      error: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save slots.",
    };
  }
  const slot = String(formData.get("slot") ?? "");
  if (!(HOMEPAGE_SLOT_IDS as readonly string[]).includes(slot)) {
    return { ok: false, error: "Unknown slot." };
  }
  try {
    await saveHomepageSlot({
      slot: slot as HomepageSlotId,
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim(),
      attribution: String(formData.get("attribution") ?? "").trim(),
      href: String(formData.get("href") ?? "").trim(),
      enabled: formData.get("enabled") === "1",
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }
  return { ok: true };
}
