/**
 * Affiliate catalog lives here only. Empty tags still link the merchant.
 *
 * zZounds founder affiliate IDs already live in the path. The `zzounds`
 * network leaves merchantUrl untouched — do not stamp query tags on it.
 * Next founder zZounds SKU: `${ZZOUNDS_AFFILIATE_BASE}/item--XXXX`
 * (append the product path only; do not invent SKUs).
 */

export type AffiliateNetwork =
  | "amazon"
  | "sweetwater"
  | "thomann"
  | "bandh"
  | "zzounds"
  | "merchant";

/** Founder zZounds affiliate base. Append `/item--XXXX` for the next live SKU. */
export const ZZOUNDS_AFFILIATE_BASE = "https://www.zzounds.com/a--4000088";

export type ShopCategorySlug =
  | "guitars"
  | "synths"
  | "tablets"
  | "art-supplies"
  | "computer-gear";

export type AffiliateProduct = {
  slug: string;
  category: ShopCategorySlug;
  name: string;
  dek: string;
  belief: string;
  merchant: string;
  merchantUrl: string;
  network: AffiliateNetwork;
  status: "sample" | "live";
  priceHint: string;
};

const tags: Record<Exclude<AffiliateNetwork, "merchant" | "zzounds">, string> = {
  amazon: process.env.AFFILIATE_TAG_AMAZON ?? "",
  sweetwater: process.env.AFFILIATE_TAG_SWEETWATER ?? "",
  thomann: process.env.AFFILIATE_TAG_THOMANN ?? "",
  bandh: process.env.AFFILIATE_TAG_B_AND_H ?? "",
};

export const shopCategories: {
  slug: ShopCategorySlug;
  title: string;
  dek: string;
  seoTitle: string;
  seoDescription: string;
}[] = [
  {
    slug: "guitars",
    title: "Guitars",
    dek: "Instruments that earn the night — not costume hardware.",
    seoTitle: "Guitars — Project SiXXX Shop",
    seoDescription:
      "Affiliate guitar landing. Live Line 6 Helix LT and Helix Stadium XL at zZounds. SAMPLE Ibanez-style pick remains. Est. in Darkness.",
  },
  {
    slug: "synths",
    title: "Synths",
    dek: "Voltage, breath, and the machines that refuse to be polite.",
    seoTitle: "Synths — Project SiXXX Shop",
    seoDescription: "Placeholder synth shelf. Affiliate outbound when tags land.",
  },
  {
    slug: "tablets",
    title: "Tablets",
    dek: "A drawing surface that can take a beating and still listen.",
    seoTitle: "Tablets — Project SiXXX Shop",
    seoDescription: "Placeholder tablet shelf for studio work.",
  },
  {
    slug: "art-supplies",
    title: "Art Supplies",
    dek: "Pigment, paper, steel — the unglamorous tools that actually mark.",
    seoTitle: "Art Supplies — Project SiXXX Shop",
    seoDescription: "Placeholder art-supply shelf.",
  },
  {
    slug: "computer-gear",
    title: "Computer Gear",
    dek: "The box you sit in front of when the house is closed.",
    seoTitle: "Computer Gear — Project SiXXX Shop",
    seoDescription: "Placeholder computer-gear shelf.",
  },
];

export const products: AffiliateProduct[] = [
  {
    slug: "line-6-helix-lt",
    category: "guitars",
    name: "Line 6 Helix LT",
    dek: "I owned this for years, cleaner than the full HELIX, less unused ports on the back.",
    belief:
      "I owned this for years, cleaner than the full HELIX, less unused ports on the back. It's amazing — hands down one of the greatest tone control units ever made for electric guitar. A wonderful start before you get your hands on the Stadium HX.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--LINHELIXLT`,
    network: "zzounds",
    status: "live",
    priceHint: "See zZounds",
  },
  {
    slug: "line-6-stadium-xl",
    category: "guitars",
    name: "Line 6 Helix Stadium XL",
    dek: "This is literally the finest addition to my arsenal ever created.",
    belief:
      "This is literally the finest addition to my arsenal ever created. As if the Helix ever came short (which it NEVER DID) the Stadium literally rocks my socks off. Tremendous depth, clarity, punch, everything was refined to the utmost. I play a 9 string and my sound got a little muddy (I admit it) when I play her bottom end. The Stadium took that MUD and turned into clean THUD. It was like night and day. OMGZ. I can't tell you what that does for my tone: My metal is so heavy it's unreal. Crunch... haha.... it's not crunch it's more like Pulp and Mulch. And the funk. Where is Les Claypool. I think he might appreciate this thing more than I do. And that is saying something. From the blackest metal I can summon to the most twinkling footsteps of fairies and the haunting shimmer of ethereal magick, this is the finest tone control I've ever dreamed of. You want it. Trust me. It's worth every penny.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--LINSTADIUMXL?siid=390641`,
    network: "zzounds",
    status: "live",
    priceHint: "See zZounds",
  },
  {
    slug: "ibanez-rg-sample",
    category: "guitars",
    name: "Ibanez-style RG",
    dek: "A fast neck. A working trem. SAMPLE pick — not an endorsement theater.",
    belief:
      "If the neck is a hallway and the fretboard is a floor, buy the one you can walk in the dark. Flash is not a setup. A setup is a setup.",
    merchant: "Sweetwater",
    merchantUrl: "https://www.sweetwater.com/c1000--Solidbody_Guitars",
    network: "sweetwater",
    status: "sample",
    priceHint: "Placeholder — confirm live SKU before spend",
  },
  {
    slug: "synth-placeholder",
    category: "synths",
    name: "Polyphonic synth (placeholder)",
    dek: "A keyboard that can hold a chord without apology.",
    belief: "Tone first. Menu-diving last.",
    merchant: "Sweetwater",
    merchantUrl: "https://www.sweetwater.com/c1035--Synthesizers",
    network: "sweetwater",
    status: "sample",
    priceHint: "Placeholder",
  },
  {
    slug: "tablet-placeholder",
    category: "tablets",
    name: "Drawing tablet (placeholder)",
    dek: "Pressure, tilt, and a screen you can actually see at 2 a.m.",
    belief: "The tool should disappear. If it fights you, it is not the tool.",
    merchant: "B&H",
    merchantUrl: "https://www.bhphotovideo.com/",
    network: "bandh",
    status: "sample",
    priceHint: "Placeholder",
  },
  {
    slug: "art-supplies-placeholder",
    category: "art-supplies",
    name: "Studio kit (placeholder)",
    dek: "Paper that takes ink. Ink that stays. Steel that does not flex.",
    belief: "Supplies are not a personality. They are a decision about permanence.",
    merchant: "Merchant",
    merchantUrl: "https://www.dickblick.com/",
    network: "merchant",
    status: "sample",
    priceHint: "Placeholder",
  },
  {
    slug: "computer-gear-placeholder",
    category: "computer-gear",
    name: "Workstation (placeholder)",
    dek: "Quiet fans. Enough RAM. No RGB sermon.",
    belief: "The machine is a lamp. If it glows more than it works, it is furniture.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/",
    network: "amazon",
    status: "sample",
    priceHint: "Placeholder",
  },
];

function withTag(url: string, network: AffiliateNetwork): string {
  if (network === "merchant" || network === "zzounds") return url;
  const tag = tags[network];
  if (!tag) return url;
  const u = new URL(url);
  if (network === "amazon") u.searchParams.set("tag", tag);
  else if (network === "sweetwater") u.searchParams.set("utm_source", tag);
  else if (network === "thomann") u.searchParams.set("offid", tag);
  else if (network === "bandh") u.searchParams.set("BI", tag);
  return u.toString();
}

export function outboundUrl(product: AffiliateProduct): string {
  return withTag(product.merchantUrl, product.network);
}

export function categoryBySlug(slug: string) {
  return shopCategories.find((c) => c.slug === slug);
}

export function productsIn(slug: string) {
  return products.filter((p) => p.category === slug);
}

export function productBySlugs(category: string, slug: string) {
  return products.find((p) => p.category === category && p.slug === slug);
}
