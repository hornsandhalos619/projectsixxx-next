"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSeeJournalAdmin } from "@/config/roles";
import { journalTaxonomy } from "@/config/site";
import { isJournalCategory } from "@/lib/journal";
import { isDateStamp, isValidSlug, slugify, todayStamp } from "@/lib/cms/slug";
import {
  detectStorage,
  getJournalRecord,
  removeCmsRecord,
  saveCmsRecord,
} from "@/lib/cms/store";
import {
  isJournalStream,
  isPublishStatus,
  type CmsRecord,
  type JournalStream,
} from "@/lib/cms/types";
import { getViewer } from "@/lib/session";

export type SaveState = { ok: false; error: string } | null;

async function requireEditor(): Promise<{ ok: true } | { ok: false; error: string }> {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) {
    return { ok: false, error: "Journal desk is closed for this seat." };
  }
  if (!detectStorage().writable) {
    return {
      ok: false,
      error:
        "Set DATABASE_URL, BLOB_READ_WRITE_TOKEN, or GITHUB_TOKEN on Vercel to save entries.",
    };
  }
  return { ok: true };
}

function readField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function recordFromForm(formData: FormData): CmsRecord | { error: string } {
  const streamRaw = readField(formData, "stream");
  if (!isJournalStream(streamRaw)) return { error: "Choose Overmind or house journal." };
  const stream: JournalStream = streamRaw;

  const title = readField(formData, "title");
  if (!title) return { error: "Title is required." };

  const slugInput = readField(formData, "slug") || slugify(title);
  const slug = slugify(slugInput);
  if (!isValidSlug(slug)) return { error: "Slug needs lowercase letters, numbers, and hyphens." };

  const date = readField(formData, "date") || todayStamp();
  if (!isDateStamp(date)) return { error: "Date uses YYYY-MM-DD." };

  const excerpt = readField(formData, "excerpt");
  const body = String(formData.get("body") ?? "");
  const statusRaw = readField(formData, "status");
  if (!isPublishStatus(statusRaw)) return { error: "Choose draft or published." };

  const category = readField(formData, "category");
  if (stream === "house") {
    if (!isJournalCategory(category)) {
      return { error: `House entries need a shelf: ${journalTaxonomy.join(", ")}.` };
    }
  }

  const tags = readField(formData, "tags")
    .split(",")
    .map((tag) => slugify(tag))
    .filter(Boolean);

  return {
    stream,
    slug,
    title,
    date,
    excerpt,
    body,
    status: statusRaw,
    category: stream === "house" ? category : undefined,
    dek: excerpt,
    teaser: excerpt.slice(0, 160),
    tags: stream === "overmind" ? tags : [],
    author: stream === "overmind" ? "Overmind" : "House",
    updatedAt: new Date().toISOString(),
  };
}

export async function saveJournalEntry(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const gate = await requireEditor();
  if (!gate.ok) return gate;

  const parsed = recordFromForm(formData);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const previousStream = readField(formData, "previousStream");
  const previousSlug = readField(formData, "previousSlug");
  const previousCategory = readField(formData, "previousCategory");

  try {
    if (
      previousStream &&
      previousSlug &&
      isJournalStream(previousStream) &&
      (previousStream !== parsed.stream || previousSlug !== parsed.slug)
    ) {
      await removeCmsRecord(previousStream, previousSlug, previousCategory || undefined);
    }
    await saveCmsRecord(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed.";
    return { ok: false, error: message };
  }

  redirect(`/admin/journal/edit/${parsed.stream}/${parsed.slug}?saved=1`);
}

export async function deleteJournalEntry(formData: FormData): Promise<void> {
  const gate = await requireEditor();
  if (!gate.ok) return;

  const stream = readField(formData, "stream");
  const slug = readField(formData, "slug");
  const category = readField(formData, "category");
  if (!isJournalStream(stream) || !isValidSlug(slug)) return;

  const existing = await getJournalRecord(stream, slug);
  await removeCmsRecord(stream, slug, category || existing?.category);
  revalidatePath("/admin/journal");
  redirect("/admin/journal");
}
