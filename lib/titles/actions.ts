"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSeeLibraryAdmin } from "@/config/roles";
import { isValidSlug, slugify } from "@/lib/cms/slug";
import { detectLiveStore } from "@/lib/live";
import { parseLibraryStatus, removeLibraryTitle, saveLibraryTitle } from "@/lib/titles/store";
import { getViewer } from "@/lib/session";

export type LibraryState = { ok: false; error: string } | null;

async function requireLibrary() {
  const viewer = await getViewer();
  if (!canSeeLibraryAdmin(viewer.role)) {
    return { ok: false as const, error: "Library desk is Founder only." };
  }
  if (!detectLiveStore().writable) {
    return {
      ok: false as const,
      error: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save titles.",
    };
  }
  return { ok: true as const };
}

export async function saveLibraryEntry(
  _prev: LibraryState,
  formData: FormData,
): Promise<LibraryState> {
  const gate = await requireLibrary();
  if (!gate.ok) return gate;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  if (!isValidSlug(slug)) return { ok: false, error: "Slug needs lowercase letters, numbers, and hyphens." };
  const previousSlug = String(formData.get("previousSlug") ?? "").trim();
  const sample = String(formData.get("sample") ?? "")
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean);

  try {
    if (previousSlug && previousSlug !== slug) await removeLibraryTitle(previousSlug);
    await saveLibraryTitle({
      slug,
      title,
      dek: String(formData.get("dek") ?? "").trim(),
      author: String(formData.get("author") ?? "House").trim() || "House",
      year: String(formData.get("year") ?? "").trim(),
      status: parseLibraryStatus(String(formData.get("status") ?? "sample")),
      format: String(formData.get("format") ?? "").trim(),
      blurb: String(formData.get("blurb") ?? "").trim(),
      sample,
      featured: formData.get("featured") === "1",
      featuredRank: Number(formData.get("featuredRank") || 0) || undefined,
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }

  redirect(`/admin/library/${slug}?saved=1`);
}

export async function deleteLibraryEntry(formData: FormData): Promise<void> {
  const gate = await requireLibrary();
  if (!gate.ok) return;
  const slug = String(formData.get("slug") ?? "").trim();
  if (!isValidSlug(slug)) return;
  await removeLibraryTitle(slug);
  revalidatePath("/admin/library");
  redirect("/admin/library");
}
