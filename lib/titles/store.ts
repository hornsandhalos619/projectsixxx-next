import { revalidatePath } from "next/cache";
import { localJsonRead, localJsonWrite } from "@/lib/cms/local-json";
import { isValidSlug } from "@/lib/cms/slug";
import { detectLiveStore, liveStoreKind, mergeBySlug } from "@/lib/live";
import { libraryWorks as seedWorks, type LibraryStatus, type LibraryWork } from "@/lib/library";
import { getSupabase } from "@/lib/supabase";

const LOCAL_FILE = "library-cms";

function asSample(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n\s*\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function rowToWork(row: Record<string, unknown>): LibraryWork {
  return {
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    dek: String(row.dek ?? ""),
    author: String(row.author ?? "House"),
    year: String(row.year ?? ""),
    status: row.status === "house" ? "house" : "sample",
    format: String(row.format ?? ""),
    blurb: String(row.blurb ?? ""),
    sample: asSample(row.sample),
    featured: Boolean(row.featured),
    featuredRank: row.featured_rank != null ? Number(row.featured_rank) : undefined,
  };
}

async function listOverlay(): Promise<LibraryWork[]> {
  const kind = liveStoreKind();
  if (kind === "supabase") {
    const { data, error } = await getSupabase()
      .from("library_titles")
      .select("slug, title, dek, author, year, status, format, blurb, sample, featured, featured_rank")
      .order("title");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => rowToWork(row as Record<string, unknown>));
  }
  if (kind === "local") return localJsonRead<LibraryWork>(LOCAL_FILE);
  return [];
}

export async function listLibraryTitles(): Promise<LibraryWork[]> {
  try {
    return mergeBySlug(seedWorks, await listOverlay());
  } catch (error) {
    console.error("library list failed", error);
    return seedWorks;
  }
}

export async function getLibraryTitle(slug: string): Promise<LibraryWork | undefined> {
  return (await listLibraryTitles()).find((work) => work.slug === slug);
}

export async function listFeaturedLibrary(): Promise<LibraryWork[]> {
  return (await listLibraryTitles())
    .filter((work) => work.featured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
}

function revalidateLibrary(slug?: string): void {
  revalidatePath("/library");
  revalidatePath("/");
  revalidatePath("/admin/library");
  if (slug) {
    revalidatePath(`/library/${slug}`);
    revalidatePath(`/library/${slug}/sample`);
    revalidatePath(`/admin/library/${slug}`);
  }
}

export async function saveLibraryTitle(work: LibraryWork): Promise<void> {
  if (!detectLiveStore().writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save titles.");
  }
  if (!isValidSlug(work.slug)) throw new Error("Slug needs lowercase letters, numbers, and hyphens.");

  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("library_titles").upsert(
      {
        slug: work.slug,
        title: work.title,
        dek: work.dek,
        author: work.author,
        year: work.year,
        status: work.status,
        format: work.format,
        blurb: work.blurb,
        sample: work.sample,
        featured: Boolean(work.featured),
        featured_rank: work.featuredRank ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(error.message);
    revalidateLibrary(work.slug);
    return;
  }

  const current = localJsonRead<LibraryWork>(LOCAL_FILE).filter((item) => item.slug !== work.slug);
  current.push(work);
  localJsonWrite(LOCAL_FILE, current);
  revalidateLibrary(work.slug);
}

export async function removeLibraryTitle(slug: string): Promise<void> {
  if (!detectLiveStore().writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to remove desk copies.");
  }
  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("library_titles").delete().eq("slug", slug);
    if (error) throw new Error(error.message);
  } else {
    localJsonWrite(
      LOCAL_FILE,
      localJsonRead<LibraryWork>(LOCAL_FILE).filter((item) => item.slug !== slug),
    );
  }
  revalidateLibrary(slug);
}

export function parseLibraryStatus(value: string): LibraryStatus {
  return value === "house" ? "house" : "sample";
}
