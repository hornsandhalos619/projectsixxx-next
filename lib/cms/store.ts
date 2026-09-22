import { revalidatePath, revalidateTag } from "next/cache";
import { blobConfigured, blobList, blobRemove, blobWrite } from "@/lib/cms/blob";
import { readFilesystemRecords } from "@/lib/cms/filesystem";
import { githubConfigured, githubList, githubRemove, githubWrite } from "@/lib/cms/github";
import { localAllowed, localList, localRemove, localWrite } from "@/lib/cms/local";
import { findRecord, mergeRecords } from "@/lib/cms/merge";
import { neonConfigured, neonList, neonRemove, neonWrite } from "@/lib/cms/neon";
import {
  supabaseListJournal,
  supabaseRemoveJournal,
  supabaseWriteJournal,
} from "@/lib/cms/supabase";
import { supabaseConfigured } from "@/lib/supabase";
import type {
  CmsRecord,
  JournalStorageInfo,
  JournalStream,
  StorageKind,
} from "@/lib/cms/types";

export function detectStorage(): JournalStorageInfo {
  if (supabaseConfigured()) {
    return {
      kind: "supabase",
      writable: true,
      label: "Supabase",
      hint: "Entries persist in journal_posts via NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }
  if (neonConfigured()) {
    return {
      kind: "neon",
      writable: true,
      label: "Neon Postgres",
      hint: "Entries persist in the journal_posts table via DATABASE_URL or POSTGRES_URL.",
    };
  }
  if (blobConfigured()) {
    return {
      kind: "blob",
      writable: true,
      label: "Vercel Blob",
      hint: "Entries persist as JSON under journal-cms/ via BLOB_READ_WRITE_TOKEN.",
    };
  }
  if (githubConfigured()) {
    return {
      kind: "github",
      writable: true,
      label: "GitHub Contents",
      hint: "Entries write into content/ on the target branch via GITHUB_TOKEN.",
    };
  }
  if (localAllowed()) {
    return {
      kind: "local",
      writable: true,
      label: "Local data file",
      hint: "Dev-only store at data/journal-cms.json. Add Neon, Blob, or GitHub on Vercel for production writes.",
    };
  }
  return {
    kind: "readonly",
    writable: false,
    label: "Filesystem seed",
    hint: "Published MDX under content/ is readable. Set NEXT_PUBLIC_SUPABASE_URL, DATABASE_URL, BLOB_READ_WRITE_TOKEN, or GITHUB_TOKEN to write from the desk.",
  };
}

export function storageKind(): StorageKind {
  return detectStorage().kind;
}

async function listOverlay(): Promise<CmsRecord[]> {
  const kind = storageKind();
  if (kind === "supabase") return supabaseListJournal();
  if (kind === "neon") return neonList();
  if (kind === "blob") return blobList();
  if (kind === "github") return githubList();
  if (kind === "local") return localList();
  return [];
}

export async function listCmsRecords(): Promise<CmsRecord[]> {
  try {
    return await listOverlay();
  } catch (error) {
    console.error("journal cms list failed", error);
    return [];
  }
}

export async function listJournalRecords(): Promise<CmsRecord[]> {
  return mergeRecords(readFilesystemRecords(), await listCmsRecords());
}

export async function getJournalRecord(
  stream: JournalStream,
  slug: string,
): Promise<CmsRecord | undefined> {
  return findRecord(await listJournalRecords(), stream, slug);
}

export async function saveCmsRecord(record: CmsRecord): Promise<void> {
  const kind = storageKind();
  if (kind === "supabase") await supabaseWriteJournal(record);
  else if (kind === "neon") await neonWrite(record);
  else if (kind === "blob") await blobWrite(record);
  else if (kind === "github") await githubWrite(record);
  else if (kind === "local") await localWrite(record);
  else {
    throw new Error(
      "Journal storage is read-only until NEXT_PUBLIC_SUPABASE_URL, DATABASE_URL, BLOB_READ_WRITE_TOKEN, or GITHUB_TOKEN is set.",
    );
  }
  revalidateJournal(record);
}

export async function removeCmsRecord(
  stream: JournalStream,
  slug: string,
  category?: string,
): Promise<void> {
  const kind = storageKind();
  if (kind === "supabase") await supabaseRemoveJournal(stream, slug);
  else if (kind === "neon") await neonRemove(stream, slug);
  else if (kind === "blob") await blobRemove(stream, slug);
  else if (kind === "github") await githubRemove({ stream, slug, category });
  else if (kind === "local") await localRemove(stream, slug);
  else {
    throw new Error(
      "Journal storage is read-only until NEXT_PUBLIC_SUPABASE_URL, DATABASE_URL, BLOB_READ_WRITE_TOKEN, or GITHUB_TOKEN is set.",
    );
  }
  revalidateJournal({ stream, slug, category, status: "draft" });
}

function revalidateJournal(record: Pick<CmsRecord, "stream" | "slug" | "category" | "status">): void {
  revalidateTag("journal-cms");
  revalidatePath("/journal");
  revalidatePath("/overmind/journal");
  revalidatePath("/admin/journal");
  revalidatePath("/");
  if (record.stream === "overmind") {
    revalidatePath(`/overmind/journal/${record.slug}`);
    revalidatePath(`/admin/journal/edit/overmind/${record.slug}`);
  } else {
    const category = record.category || "fine-art";
    revalidatePath(`/journal/${category}`);
    revalidatePath(`/journal/${category}/${record.slug}`);
    revalidatePath(`/admin/journal/edit/house/${record.slug}`);
  }
}

export function publicHref(record: CmsRecord): string | null {
  if (record.status !== "published") return null;
  if (record.stream === "overmind") return `/overmind/journal/${record.slug}`;
  if (record.category) return `/journal/${record.category}/${record.slug}`;
  return "/journal";
}

export function editHref(record: Pick<CmsRecord, "stream" | "slug">): string {
  return `/admin/journal/edit/${record.stream}/${record.slug}`;
}
