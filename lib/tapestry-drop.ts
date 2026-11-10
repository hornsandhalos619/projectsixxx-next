import { tapestryCollectionUrl } from "@/config/shops";
import { catalogPrice, shopifyProductUrl } from "@/lib/shopify-tees";

export const TAPESTRY_COLLECTION_JSON =
  "https://hornshalosshop.myshopify.com/collections/crest-tapestries/products.json?limit=250";

/** Founder rule: upright crosses stay off the site until he decides. */
export const EXCLUDED_TAPESTRY_HANDLES = [
  "horns-halos-crest-tapestry-vi-heaven-above-hell-below",
  "project-sixxx-crest-tapestry-i-the-black-vigil",
  "horns-halos-crest-tapestry-viii-the-paladin-and-the-infernal-knight",
] as const;

/** Included, but flagged: possible small cross-like marks pending founder review. */
export const FLAGGED_TAPESTRY_HANDLES = [
  "horns-halos-crest-tapestry-v-the-cathedral-reliquary",
  "horns-halos-crest-tapestry-i-the-fallen-and-the-crowned",
] as const;

export const excludedTapestryHandleSet = new Set<string>(EXCLUDED_TAPESTRY_HANDLES);
export const flaggedTapestryHandleSet = new Set<string>(FLAGGED_TAPESTRY_HANDLES);

const UTM_SOURCE = "projectsixxx";
const UTM_MEDIUM = "referral";
const UTM_CAMPAIGN = "tapestry-drop";

export type CrestTapestryProduct = {
  title: string;
  handle: string;
  published_at?: string | null;
  body_html?: string;
  variants?: { price?: string | null; available?: boolean }[];
  images?: { src?: string; alt?: string }[];
};

export type TapestryLanding = {
  slug: string;
  title: string;
  shortTitle: string;
  series: "Horns & Halos" | "Project SiXXX";
  price: string;
  priceAmount: string;
  image: string;
  imageAlt: string;
  copy: string;
  buyUrl: string;
};

/** Short house-voice copy. No doctrine, no Christmas. */
export const TAPESTRY_COPY: Record<string, string> = {
  "horns-halos-crest-tapestry-i-the-fallen-and-the-crowned":
    "A thorn-haloed seraph and a crimson wyrm-knight swear themselves to one shield. Above them a crowned helm; between them the house crest, split in light and dark.",
  "horns-halos-crest-tapestry-ii-the-cathedral-of-wyrms":
    "Twin black dragons coil above the house shield in a candlelit nave, velvet crimson mantling pouring down the steps. A cathedral raised to both sides of the war.",
  "horns-halos-crest-tapestry-iii-the-unicorn-and-the-goat-king":
    "An ivory unicorn in gilded barding faces a crowned goat king robed in embroidered crimson. Between them the shield rises from a briar of blood roses — old-world heraldry, made wicked.",
  "horns-halos-crest-tapestry-iv-the-raven-moon":
    "Under a swollen moon, a raven lands on the crest's iron helm while dead oaks claw a storm-blue sky. Midnight heraldry for the house.",
  "horns-halos-crest-tapestry-v-the-cathedral-reliquary":
    "The house shield sits in a gilded gothic reliquary of pierced spires and blood-red stones, draped in crimson velvet. Two guardians kneel on either side as a rose window burns behind them.",
  "horns-halos-crest-tapestry-vii-the-celestial-armillary":
    "The house shield turns at the heart of an engraved armillary of bronze and silver rings, gears and ruby planets. A haloed figure and a black-and-crimson serpent share the same night sky.",
  "horns-halos-crest-tapestry-ix-the-forbidden-book-of-hours":
    "A page torn from a forbidden book of hours: the house shield framed in gilded leafwork and crowded with blood roses, white lilies, serpents and moths.",
  "horns-halos-crest-tapestry-x-the-ossuary-chapel":
    "Inside a candlelit bone chapel, a black onyx shield rises beneath a crown of carved bone and thorns. Marble and skeletal figures keep watch between swags of crimson velvet.",
  "project-sixxx-crest-tapestry-ii-the-storm-wyrm":
    "A red-eyed black dragon spreads its wings across a lightning-split sky, perched over a jewelled crown and the Project SiXXX shield. Thunder, wings and iron.",
  "project-sixxx-crest-tapestry-iii-the-night-unicorn-and-the-pale-stag":
    "A red-eyed black unicorn and a ghost-white stag rear against a horned obsidian shield under a ruby crown. A dark-forest bestiary sealed with the Project SiXXX banner.",
  "project-sixxx-crest-tapestry-iv-the-blood-moon":
    "A blood moon hangs over a skyline of black spires as crows wheel overhead. A serpent coils around the Project SiXXX shield — quiet, ominous and unmistakably ours.",
  "project-sixxx-crest-tapestry-v-the-folded-passage":
    "A portal splits down the middle: crimson thorn-tracery on one side, pale silver rings spiralling into endless light on the other. Two snarling goats guard the gate.",
  "project-sixxx-crest-tapestry-vi-azazels-labyrinth":
    "A floating sphere, half lava-cracked obsidian and half ornate silver, opens onto an impossible labyrinth of endless staircases. Knights stand guard beneath a ruby crown as fog rolls across the floor.",
  "project-sixxx-crest-tapestry-vii-the-goat-sigil":
    "Two snarling horned goats flank a black medallion bearing a ten-pointed star in silver and green enamel. Behind them, black mountains sit under an acid-green aurora.",
  "project-sixxx-crest-tapestry-viii-the-goat-knights-gate":
    "Goat-headed knights in filigreed black plate hold their spears beside a split shield: crimson thorn-tracery on one half, a silver spiral gate on the other.",
  "project-sixxx-crest-tapestry-ix-the-endless-stair":
    "An impossible citadel of crossing staircases burns crimson on one side and fades to white marble on the other. At its heart, a split ring of obsidian and silver holds a radiant star.",
  "project-sixxx-crest-tapestry-x-the-black-millefleur":
    "A dark take on the old millefleur tapestries. Two black goats rear against a rose-window shield under a spiked ruby crown, the ground thick with crimson flowers, moths and ravens.",
};

const FALLBACK_COPY =
  "Original heraldic artwork for the walls of those who chose a side, or refused to.";

export function tapestryLandingPath(slug: string): string {
  return `/drop/${slug}`;
}

export function tapestryBuyUrl(handle: string, storefront?: string): string {
  const url = new URL(shopifyProductUrl(handle, storefront));
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", UTM_MEDIUM);
  url.searchParams.set("utm_campaign", UTM_CAMPAIGN);
  url.searchParams.set("utm_content", `landing-${handle}`);
  return url.toString();
}

export function tapestryCollectionLandingUrl(content: string): string {
  return tapestryCollectionUrl(content);
}

export function shortTapestryTitle(title: string): string {
  const parts = title.split(/\s+[—–-]\s+/);
  return (parts[parts.length - 1] || title).trim();
}

export function tapestrySeries(handle: string, title = ""): TapestryLanding["series"] {
  if (handle.startsWith("horns-halos-") || title.includes("Horns & Halos")) {
    return "Horns & Halos";
  }
  return "Project SiXXX";
}

export function pickHeroImage(product: CrestTapestryProduct): { src: string; alt: string } {
  const images = product.images ?? [];
  const inRoom = images.find((image) => typeof image.src === "string" && /inroom/i.test(image.src));
  const chosen = inRoom ?? images[0];
  return {
    src: chosen?.src ?? "",
    alt: chosen?.alt?.trim() || product.title,
  };
}

export function landingCopy(handle: string, bodyHtml?: string): string {
  const written = TAPESTRY_COPY[handle];
  if (written) return written;
  const text = (bodyHtml ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  const beforeSeries = text.split(/Part of the/i)[0]?.trim() ?? "";
  const sentence = beforeSeries.split(/(?<=\.)\s+/)[0]?.trim() ?? "";
  if (sentence.length >= 24) return sentence;
  return FALLBACK_COPY;
}

export function isTapestryAvailable(product: CrestTapestryProduct): boolean {
  const variants = product.variants ?? [];
  if (variants.length === 0) return false;
  return variants.some((variant) => variant.available === true);
}

export function isListedTapestry(product: CrestTapestryProduct): boolean {
  const handle = product.handle?.trim() ?? "";
  if (!handle || excludedTapestryHandleSet.has(handle)) return false;
  if (!handle.includes("crest-tapestry")) return false;
  return isTapestryAvailable(product);
}

function priceAmountOf(product: CrestTapestryProduct): string {
  const raw = product.variants?.find((variant) => variant.price)?.price;
  if (!raw) return "";
  const amount = Number.parseFloat(raw);
  return Number.isFinite(amount) ? amount.toFixed(2) : raw;
}

export function toTapestryLanding(product: CrestTapestryProduct): TapestryLanding | null {
  const handle = product.handle?.trim() ?? "";
  const title = product.title?.trim() ?? "";
  if (!handle || !title) return null;
  const hero = pickHeroImage(product);
  if (!hero.src) return null;
  const price = catalogPrice(product);
  if (!price) return null;
  return {
    slug: handle,
    title,
    shortTitle: shortTapestryTitle(title),
    series: tapestrySeries(handle, title),
    price,
    priceAmount: priceAmountOf(product),
    image: hero.src,
    imageAlt: hero.alt,
    copy: landingCopy(handle, product.body_html),
    buyUrl: tapestryBuyUrl(handle),
  };
}

export function listTapestryLandingsFrom(products: CrestTapestryProduct[]): TapestryLanding[] {
  const items: TapestryLanding[] = [];
  for (const product of products) {
    if (!isListedTapestry(product)) continue;
    const landing = toTapestryLanding(product);
    if (landing) items.push(landing);
  }
  return items;
}

export async function fetchCrestTapestries(): Promise<CrestTapestryProduct[]> {
  try {
    const response = await fetch(TAPESTRY_COLLECTION_JSON, {
      cache: "force-cache",
      next: { revalidate: 3600 },
    } as RequestInit & { next: { revalidate: number } });
    if (!response.ok) return [];
    const data = (await response.json()) as { products?: CrestTapestryProduct[] };
    return Array.isArray(data.products) ? data.products : [];
  } catch {
    return [];
  }
}

export async function listTapestryLandings(): Promise<TapestryLanding[]> {
  return listTapestryLandingsFrom(await fetchCrestTapestries());
}

export async function getTapestryLanding(slug: string): Promise<TapestryLanding | null> {
  const items = await listTapestryLandings();
  return items.find((item) => item.slug === slug) ?? null;
}

export function relatedTapestries(
  items: TapestryLanding[],
  slug: string,
  count = 3,
): TapestryLanding[] {
  const current = items.find((item) => item.slug === slug);
  const sameSeries = current
    ? items.filter((item) => item.series === current.series && item.slug !== slug)
    : items.filter((item) => item.slug !== slug);
  const pool = sameSeries.length >= count ? sameSeries : items.filter((item) => item.slug !== slug);
  if (pool.length === 0) return [];

  const start = items.findIndex((item) => item.slug === slug);
  const result: TapestryLanding[] = [];
  for (let step = 1; result.length < count && step <= items.length; step += 1) {
    const index = (Math.max(start, 0) + step) % items.length;
    const candidate = items[index];
    if (!candidate || candidate.slug === slug) continue;
    if (!pool.some((item) => item.slug === candidate.slug)) continue;
    if (result.some((item) => item.slug === candidate.slug)) continue;
    result.push(candidate);
  }
  return result;
}
