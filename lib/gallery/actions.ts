"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSeeGalleryAdmin } from "@/config/roles";
import { isValidSlug, slugify } from "@/lib/cms/slug";
import { detectLiveStore } from "@/lib/live";
import { parseArtistStatus, removeArtist, saveArtist } from "@/lib/gallery/store";
import type { Work } from "@/lib/artists";
import { getViewer } from "@/lib/session";

export type GalleryState = { ok: false; error: string } | null;

async function requireGallery() {
  const viewer = await getViewer();
  if (!canSeeGalleryAdmin(viewer.role)) {
    return { ok: false as const, error: "Gallery desk is Founder only." };
  }
  if (!detectLiveStore().writable) {
    return {
      ok: false as const,
      error: "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save artists.",
    };
  }
  return { ok: true as const };
}

function readWorks(formData: FormData): Work[] {
  const titles = formData.getAll("workTitle").map((value) => String(value));
  const years = formData.getAll("workYear").map((value) => String(value));
  const mediums = formData.getAll("workMedium").map((value) => String(value));
  const captions = formData.getAll("workCaption").map((value) => String(value));
  const media = formData.getAll("workMedia").map((value) => String(value));
  const works: Work[] = [];
  for (let index = 0; index < titles.length; index += 1) {
    const title = titles[index]?.trim();
    if (!title) continue;
    works.push({
      title,
      year: years[index]?.trim() ?? "",
      medium: mediums[index]?.trim() ?? "",
      caption: captions[index]?.trim() ?? "",
      mediaUrl: media[index]?.trim() || undefined,
    });
  }
  return works;
}

function readLinks(formData: FormData, labelKey: string, hrefKey: string) {
  const labels = formData.getAll(labelKey).map((value) => String(value));
  const hrefs = formData.getAll(hrefKey).map((value) => String(value));
  return labels
    .map((label, index) => {
      const href = hrefs[index]?.trim() ?? "";
      const name = label.trim();
      if (!name || !href) return null;
      return { label: name, href };
    })
    .filter((item): item is { label: string; href: string } => Boolean(item));
}

export async function saveArtistEntry(
  _prev: GalleryState,
  formData: FormData,
): Promise<GalleryState> {
  const gate = await requireGallery();
  if (!gate.ok) return gate;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  if (!isValidSlug(slug)) return { ok: false, error: "Slug needs lowercase letters, numbers, and hyphens." };

  const previousSlug = String(formData.get("previousSlug") ?? "").trim();

  try {
    if (previousSlug && previousSlug !== slug) {
      await removeArtist(previousSlug);
    }
    await saveArtist({
      slug,
      name,
      role: String(formData.get("role") ?? "Collaborator").trim() || "Collaborator",
      status: parseArtistStatus(String(formData.get("status") ?? "sample")),
      bio: String(formData.get("bio") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      social: readLinks(formData, "socialLabel", "socialHref"),
      store: readLinks(formData, "storeLabel", "storeHref"),
      works: readWorks(formData),
      mediaPending: formData.get("mediaPending") === "1",
      featured: formData.get("featured") === "1",
      featuredRank: Number(formData.get("featuredRank") || 0) || undefined,
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed." };
  }

  redirect(`/admin/gallery/${slug}?saved=1`);
}

export async function deleteArtistEntry(formData: FormData): Promise<void> {
  const gate = await requireGallery();
  if (!gate.ok) return;
  const slug = String(formData.get("slug") ?? "").trim();
  if (!isValidSlug(slug)) return;
  await removeArtist(slug);
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}
