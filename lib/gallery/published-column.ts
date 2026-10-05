import type { Artist } from "@/lib/artists";

/** PostgREST / Postgres signals that `artists.published` is not in the live schema. */
export function isMissingPublishedColumnError(
  error: { message?: string; code?: string } | null | undefined,
): boolean {
  if (!error) return false;
  const code = String(error.code ?? "");
  const message = String(error.message ?? "").toLowerCase();
  if (code === "42703" || code === "PGRST204") {
    return !message || message.includes("published") || message.includes("schema cache");
  }
  return (
    message.includes("published") &&
    (message.includes("does not exist") ||
      message.includes("schema cache") ||
      message.includes("could not find") ||
      message.includes("column"))
  );
}

/**
 * Overlay rows fetched without a `published` column stay unpublished unless
 * the seed already marked that slug published (the house card).
 */
export function seedPublishedFallback(overlay: Artist[], seed: Artist[]): Artist[] {
  return overlay.map((artist) => ({
    ...artist,
    published: seed.find((item) => item.slug === artist.slug)?.published === true,
  }));
}
