"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSeeJournalAdmin } from "@/config/roles";
import {
  assertSafeSlug,
  excerptFromBody,
  isJournalCategory,
  normalizeDate,
  slugifyTitle,
  type HouseKind,
  type JournalLane,
  type StoredPost,
} from "@/lib/journal-model";
import { getViewer } from "@/lib/session";
import {
  getStoredPost,
  journalWritesReady,
  saveStoredPost,
} from "@/lib/journal-store";

export type JournalActionState = {
  error?: string;
};

async function requireJournalEditor() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) {
    throw new Error("Journal console is closed for this session.");
  }
  if (!journalWritesReady()) {
    throw new Error(
      "Publishing on Vercel needs BLOB_READ_WRITE_TOKEN so the ledger can persist.",
    );
  }
  return viewer;
}

function readLane(formData: FormData): JournalLane {
  const lane = String(formData.get("lane") ?? "");
  if (lane !== "overmind" && lane !== "house") {
    throw new Error("Choose Overmind or the house journal.");
  }
  return lane;
}

function publishStateFrom(formData: FormData) {
  const intent = String(formData.get("intent") ?? "draft");
  return intent === "publish" ? "published" : "draft";
}

function tagsFrom(formData: FormData): string[] {
  return String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

async function persistAndRevalidate(post: StoredPost) {
  await saveStoredPost(post);
  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath("/overmind/journal");
  if (post.lane === "overmind") {
    revalidatePath(`/overmind/journal/${post.slug}`);
    revalidatePath("/admin/journal");
    revalidatePath(`/admin/journal/overmind/${post.slug}`);
    redirect(`/admin/journal/overmind/${post.slug}?saved=1`);
  }
  revalidatePath(`/journal/${post.category}`);
  revalidatePath(`/journal/${post.category}/${post.slug}`);
  revalidatePath("/admin/journal");
  revalidatePath(`/admin/journal/house/${post.category}/${post.slug}`);
  redirect(`/admin/journal/house/${post.category}/${post.slug}?saved=1`);
}

export async function saveJournalPost(
  _prev: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  try {
    const viewer = await requireJournalEditor();
    const lane = readLane(formData);
    const mode = String(formData.get("mode") ?? "create");
    const title = String(formData.get("title") ?? "").trim();
    if (!title) throw new Error("A title holds the cut.");
    const slugSource = String(formData.get("slug") ?? "").trim() || slugifyTitle(title);
    const slug = assertSafeSlug(slugSource);
    const body = String(formData.get("body") ?? "");
    const date = normalizeDate(String(formData.get("date") ?? ""));
    const publishState = publishStateFrom(formData);

    if (lane === "overmind") {
      const existing = await getStoredPost("overmind", slug);
      if (mode === "create" && existing) {
        throw new Error("That Overmind slug is already cut.");
      }
      const teaser = String(formData.get("teaser") ?? "").trim() || excerptFromBody(body);
      await persistAndRevalidate({
        lane: "overmind",
        title,
        slug,
        body,
        date,
        publishState,
        updatedAt: new Date().toISOString(),
        updatedBy: viewer.email,
        author: "Overmind",
        tags: tagsFrom(formData),
        teaser: teaser.slice(0, 160),
      });
    }

    const category = String(formData.get("category") ?? "");
    if (!isJournalCategory(category)) {
      throw new Error("Choose a house shelf.");
    }
    const existing = await getStoredPost("house", slug, category);
    if (mode === "create" && existing) {
      throw new Error("That house slug is already on this shelf.");
    }
    const kind: HouseKind =
      String(formData.get("kind") ?? "house") === "sample" ? "sample" : "house";
    const dek = String(formData.get("dek") ?? "").trim() || excerptFromBody(body, 120);
    const excerpt = String(formData.get("excerpt") ?? "").trim() || excerptFromBody(body, 200);
    await persistAndRevalidate({
      lane: "house",
      title,
      slug,
      body,
      date,
      publishState,
      updatedAt: new Date().toISOString(),
      updatedBy: viewer.email,
      category,
      dek,
      excerpt,
      author: String(formData.get("author") ?? "House").trim() || "House",
      kind,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return {
      error: error instanceof Error ? error.message : "The ledger did not take the cut.",
    };
  }
  return {};
}
