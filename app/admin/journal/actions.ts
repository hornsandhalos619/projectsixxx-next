"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import { canSeeJournalAdmin } from "@/config/roles";
import { isJournalCategory, writeHousePost } from "@/lib/journal";
import { isEditorialStatus, slugify, todayIsoDate } from "@/lib/journal-io";
import { writeOvermindPost } from "@/lib/overmind-journal";
import { getViewer } from "@/lib/session";

export type JournalActionState = { error: string } | null;

async function requireJournalAdmin() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();
  return viewer;
}

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function writeErrorMessage(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: unknown }).code)
      : "";
  if (code === "EACCES" || code === "EROFS" || code === "EPERM") {
    return "The content tree is not writable in this environment.";
  }
  const message = err instanceof Error ? err.message : "";
  if (message === "slug_taken") return "A post with this slug already exists.";
  if (message === "invalid_slug") return "Slug must be lowercase letters, numbers, and hyphens.";
  if (message === "invalid_category") return "Choose a house journal shelf.";
  if (message === "invalid_path") return "That path is not allowed.";
  return "The post could not be saved.";
}

function revalidateHouse(category: string, slug: string, previous?: { category: string; slug: string }) {
  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath("/admin/journal");
  revalidatePath(`/journal/${category}`);
  revalidatePath(`/journal/${category}/${slug}`);
  if (previous && (previous.category !== category || previous.slug !== slug)) {
    revalidatePath(`/journal/${previous.category}`);
    revalidatePath(`/journal/${previous.category}/${previous.slug}`);
  }
}

function revalidateOvermind(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/overmind/journal");
  revalidatePath("/admin/journal");
  revalidatePath(`/overmind/journal/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/overmind/journal/${previousSlug}`);
  }
}

export async function saveJournalPost(
  _prev: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  await requireJournalAdmin();

  const lane = field(formData, "lane");
  const title = field(formData, "title");
  const date = field(formData, "date") || todayIsoDate();
  const slugInput = field(formData, "slug") || slugify(title);
  const statusRaw = field(formData, "status");
  const content = String(formData.get("content") ?? "").replace(/\r\n/g, "\n");

  if (!title) return { error: "Title is required." };
  if (!isEditorialStatus(statusRaw)) {
    return { error: "Status must be draft or published." };
  }

  try {
    if (lane === "house") {
      const category = field(formData, "category");
      if (!isJournalCategory(category)) {
        return { error: "Choose a house journal shelf." };
      }
      const previousCategory = field(formData, "previousCategory");
      const previousSlug = field(formData, "previousSlug");
      writeHousePost({
        title,
        dek: field(formData, "dek"),
        excerpt: field(formData, "excerpt"),
        author: field(formData, "author") || "House",
        date,
        category,
        slug: slugInput,
        status: statusRaw,
        content,
        sample: field(formData, "sample") === "1",
        previousCategory: previousCategory || undefined,
        previousSlug: previousSlug || undefined,
      });
      revalidateHouse(
        category,
        slugInput,
        previousCategory && previousSlug
          ? { category: previousCategory, slug: previousSlug }
          : undefined,
      );
      redirect(`/admin/journal/house/${category}/${slugInput}`);
    }

    if (lane === "overmind") {
      const previousSlug = field(formData, "previousSlug");
      writeOvermindPost({
        title,
        slug: slugInput,
        date,
        tags: parseTags(field(formData, "tags")),
        teaser: field(formData, "teaser"),
        status: statusRaw,
        content,
        previousSlug: previousSlug || undefined,
      });
      revalidateOvermind(slugInput, previousSlug || undefined);
      redirect(`/admin/journal/overmind/${slugInput}`);
    }
  } catch (err) {
    unstable_rethrow(err);
    return { error: writeErrorMessage(err) };
  }

  return { error: "Choose a journal lane." };
}
