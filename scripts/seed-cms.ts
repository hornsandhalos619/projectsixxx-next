/**
 * Copy seed MDX/config into empty Supabase tables.
 * Does not delete content/ or config files.
 *
 *   npx tsx scripts/seed-cms.ts
 */
import { products } from "../config/affiliates";
import { artists } from "../lib/artists";
import { readFilesystemRecords } from "../lib/cms/filesystem";
import { defaultHomepageSlots } from "../lib/homepage/defaults";
import { libraryWorks } from "../lib/library";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

async function main() {
  if (!supabaseConfigured()) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  }
  const client = getSupabase();

  const { count: journalCount, error: journalCountError } = await client
    .from("journal_posts")
    .select("slug", { count: "exact", head: true });
  if (journalCountError) throw new Error(journalCountError.message);
  if (!journalCount) {
    const records = readFilesystemRecords();
    if (records.length) {
      const { error } = await client.from("journal_posts").upsert(
        records.map((record) => ({
          stream: record.stream,
          slug: record.slug,
          category: record.category ?? null,
          title: record.title,
          date: record.date,
          excerpt: record.excerpt,
          dek: record.dek ?? "",
          teaser: record.teaser ?? "",
          body: record.body,
          status: record.status,
          tags: (record.tags ?? []).join(","),
          author: record.author ?? null,
          updated_at: record.updatedAt,
        })),
        { onConflict: "stream,slug" },
      );
      if (error) throw new Error(error.message);
      console.log(`seeded ${records.length} journal posts`);
    }
  } else {
    console.log("journal_posts already has rows — skip");
  }

  const { count: artistCount, error: artistCountError } = await client
    .from("artists")
    .select("slug", { count: "exact", head: true });
  if (artistCountError) throw new Error(artistCountError.message);
  if (!artistCount) {
    for (const artist of artists) {
      const { error } = await client.from("artists").upsert({
        slug: artist.slug,
        name: artist.name,
        role: artist.role,
        status: artist.status,
        bio: artist.bio,
        email: artist.email,
        social: artist.social,
        store: artist.store,
        media_pending: Boolean(artist.mediaPending),
        featured: artist.featured ?? (artist.role === "Collaborator" && !artist.slug.startsWith("slot-open")),
        featured_rank: artist.featuredRank ?? null,
      });
      if (error) throw new Error(error.message);
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
    }
    console.log(`seeded ${artists.length} artists`);
  } else {
    console.log("artists already has rows — skip");
  }

  const { count: libraryCount, error: libraryCountError } = await client
    .from("library_titles")
    .select("slug", { count: "exact", head: true });
  if (libraryCountError) throw new Error(libraryCountError.message);
  if (!libraryCount) {
    const { error } = await client.from("library_titles").upsert(
      libraryWorks.map((work) => ({
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
      })),
    );
    if (error) throw new Error(error.message);
    console.log(`seeded ${libraryWorks.length} library titles`);
  } else {
    console.log("library_titles already has rows — skip");
  }

  const { count: productCount, error: productCountError } = await client
    .from("affiliate_products")
    .select("slug", { count: "exact", head: true });
  if (productCountError) throw new Error(productCountError.message);
  if (!productCount) {
    const { error } = await client.from("affiliate_products").upsert(
      products.map((product) => ({
        slug: product.slug,
        category: product.category,
        name: product.name,
        dek: product.dek,
        belief: product.belief,
        body: product.body ?? null,
        merchant: product.merchant,
        merchant_url: product.merchantUrl,
        network: product.network,
        status: product.status,
        price_hint: product.priceHint,
        featured: false,
      })),
    );
    if (error) throw new Error(error.message);
    console.log(`seeded ${products.length} affiliate products`);
  } else {
    console.log("affiliate_products already has rows — skip");
  }

  const { count: slotCount, error: slotCountError } = await client
    .from("homepage_slots")
    .select("slot", { count: "exact", head: true });
  if (slotCountError) throw new Error(slotCountError.message);
  if (!slotCount) {
    const { error } = await client.from("homepage_slots").upsert(
      defaultHomepageSlots.map((slot) => ({
        slot: slot.slot,
        title: slot.title,
        body: slot.body,
        attribution: slot.attribution,
        href: slot.href || null,
        enabled: slot.enabled,
      })),
    );
    if (error) throw new Error(error.message);
    console.log(`seeded ${defaultHomepageSlots.length} homepage slots`);
  } else {
    console.log("homepage_slots already has rows — skip");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
