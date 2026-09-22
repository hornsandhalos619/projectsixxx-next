"use server";

import { revalidatePath } from "next/cache";
import { canSeeHouseAdmin, isGrantableRole } from "@/config/roles";
import { grantHouseRole, revokeHouseRole } from "@/lib/house/roles";
import { getViewer } from "@/lib/session";

export type HouseState = { ok: false; error: string } | { ok: true } | null;

async function requireFounder(): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!canSeeHouseAdmin(viewer.role) || !viewer.email) {
    return { ok: false, error: "House desk is Founder only." };
  }
  return { ok: true, email: viewer.email };
}

export async function grantEditorRole(
  _prev: HouseState,
  formData: FormData,
): Promise<HouseState> {
  const gate = await requireFounder();
  if (!gate.ok) return gate;
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  if (!isGrantableRole(role)) {
    return { ok: false, error: "Choose Blog Admin or Shop Admin." };
  }
  try {
    await grantHouseRole(email, role, gate.email);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Grant failed." };
  }
  revalidatePath("/admin/house");
  revalidatePath("/admin");
  return { ok: true };
}

export async function revokeEditorRole(formData: FormData): Promise<void> {
  const gate = await requireFounder();
  if (!gate.ok) return;
  const email = String(formData.get("email") ?? "").trim();
  try {
    await revokeHouseRole(email);
  } catch (error) {
    console.error("revoke house role failed", error);
    return;
  }
  revalidatePath("/admin/house");
  revalidatePath("/admin");
}
