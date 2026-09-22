"use server";

import { put } from "@vercel/blob";
import { canSeeAdminHub } from "@/config/roles";
import { getViewer } from "@/lib/session";

export function blobMediaConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadHouseMedia(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const viewer = await getViewer();
  if (!canSeeAdminHub(viewer.role)) {
    return { error: "This desk is closed." };
  }
  if (!blobMediaConfigured()) {
    return { error: "Set BLOB_READ_WRITE_TOKEN to upload media." };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file." };
  }
  const prefix = String(formData.get("prefix") ?? "house-media").replace(/[^a-z0-9-_/]/gi, "");
  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  const blob = await put(`${prefix}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url };
}
