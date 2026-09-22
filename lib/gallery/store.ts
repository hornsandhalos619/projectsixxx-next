import { revalidatePath } from "next/cache";
import {
  artists as seedArtists,
  isFeaturedArtist,
  type Artist,
  type ArtistStatus,
  type Work,
} from "@/lib/artists";
import { localJsonRead, localJsonWrite } from "@/lib/cms/local-json";
import { isValidSlug, slugify } from "@/lib/cms/slug";
import { detectLiveStore, liveStoreKind, mergeBySlug } from "@/lib/live";
import { getSupabase } from "@/lib/supabase";

const LOCAL_FILE = "gallery-cms";

type ArtistRow = {
  slug: string;
  name: string;
  role: string;
  status: string;
  bio: string;
  email: string;
  social: unknown;
  store: unknown;
  media_pending: boolean;
  featured: boolean;
  featured_rank: number | null;
  artist_works?: WorkRow[] | null;
};

type WorkRow = {
  id?: string;
  artist_slug?: string;
  title: string;
  year: string;
  medium: string;
  caption: string;
  media_url?: string | null;
  sort_order?: number;
};

function asLinks(value: unknown): { label: string; href: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const data = item as { label?: unknown; href?: unknown };
      const label = String(data.label ?? "").trim();
      const href = String(data.href ?? "").trim();
      if (!label || !href) return null;
      return { label, href };
    })
    .filter((item): item is { label: string; href: string } => Boolean(item));
}

function asWorks(value: unknown): Work[] {
  if (!Array.isArray(value)) return [];
  const works: Work[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const data = item as Record<string, unknown>;
    const title = String(data.title ?? "").trim();
    if (!title) continue;
    const media = data.mediaUrl || data.media_url ? String(data.mediaUrl ?? data.media_url) : "";
    works.push({
      title,
      year: String(data.year ?? ""),
      medium: String(data.medium ?? ""),
      caption: String(data.caption ?? ""),
      ...(media ? { mediaUrl: media } : {}),
    });
  }
  return works;
}

function rowToArtist(row: ArtistRow): Artist {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role,
    status: row.status === "house" ? "house" : "sample",
    bio: row.bio,
    email: row.email ?? "",
    social: asLinks(row.social),
    store: asLinks(row.store),
    works: asWorks(row.artist_works ?? []),
    mediaPending: Boolean(row.media_pending),
    featured: Boolean(row.featured),
    featuredRank: row.featured_rank ?? undefined,
  };
}

async function listOverlay(): Promise<Artist[]> {
  const kind = liveStoreKind();
  if (kind === "supabase") {
    const { data, error } = await getSupabase()
      .from("artists")
      .select("slug, name, role, status, bio, email, social, store, media_pending, featured, featured_rank, artist_works(title, year, medium, caption, media_url, sort_order)")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const works = Array.isArray(row.artist_works)
        ? [...row.artist_works].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        : [];
      return rowToArtist({ ...(row as ArtistRow), artist_works: works });
    });
  }
  if (kind === "local") {
    return localJsonRead<Artist>(LOCAL_FILE);
  }
  return [];
}

export async function listArtists(): Promise<Artist[]> {
  try {
    return mergeBySlug(seedArtists, await listOverlay());
  } catch (error) {
    console.error("gallery list failed", error);
    return seedArtists;
  }
}

export async function getArtist(slug: string): Promise<Artist | undefined> {
  return (await listArtists()).find((artist) => artist.slug === slug);
}

export async function listFeaturedArtists(): Promise<Artist[]> {
  const list = (await listArtists()).filter(isFeaturedArtist);
  return list.sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
}

function revalidateGallery(slug?: string): void {
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  if (slug) {
    revalidatePath(`/gallery/${slug}`);
    revalidatePath(`/admin/gallery/${slug}`);
  }
}

export async function saveArtist(artist: Artist): Promise<void> {
  const info = detectLiveStore();
  if (!info.writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save artists.");
  }
  if (!isValidSlug(artist.slug)) throw new Error("Slug needs lowercase letters, numbers, and hyphens.");

  if (liveStoreKind() === "supabase") {
    const client = getSupabase();
    const { error } = await client.from("artists").upsert(
      {
        slug: artist.slug,
        name: artist.name,
        role: artist.role,
        status: artist.status,
        bio: artist.bio,
        email: artist.email,
        social: artist.social,
        store: artist.store,
        media_pending: Boolean(artist.mediaPending),
        featured: Boolean(artist.featured),
        featured_rank: artist.featuredRank ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );
    if (error) throw new Error(error.message);
    const { error: clearError } = await client.from("artist_works").delete().eq("artist_slug", artist.slug);
    if (clearError) throw new Error(clearError.message);
    if (artist.works.length) {
      const { error: worksError } = await client.from("artist_works").insert(
        artist.works.map((work, index) => ({
          artist_slug: artist.slug,
          title: work.title,
          year: work.year,
          medium: work.medium,
          caption: work.caption,
          media_url: work.mediaUrl ?? null,
          sort_order: index,
        })),
      );
      if (worksError) throw new Error(worksError.message);
    }
    revalidateGallery(artist.slug);
    return;
  }

  const current = localJsonRead<Artist>(LOCAL_FILE).filter((item) => item.slug !== artist.slug);
  current.push(artist);
  localJsonWrite(LOCAL_FILE, current);
  revalidateGallery(artist.slug);
}

export async function removeArtist(slug: string): Promise<void> {
  const info = detectLiveStore();
  if (!info.writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to remove desk copies.");
  }
  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("artists").delete().eq("slug", slug);
    if (error) throw new Error(error.message);
  } else {
    localJsonWrite(
      LOCAL_FILE,
      localJsonRead<Artist>(LOCAL_FILE).filter((item) => item.slug !== slug),
    );
  }
  revalidateGallery(slug);
}

export function parseArtistStatus(value: string): ArtistStatus {
  return value === "house" ? "house" : "sample";
}

export function suggestedArtistSlug(name: string): string {
  return slugify(name);
}
