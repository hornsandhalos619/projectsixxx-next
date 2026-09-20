/**
 * Affiliate catalog lives here only. Empty tags still link the merchant.
 * G3 ships one landing: /shop/guitars with a SAMPLE Ibanez-style stub.
 */

export type AffiliateNetwork =
  | "amazon"
  | "sweetwater"
  | "thomann"
  | "bandh"
  | "merchant";

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

const tags: Record<Exclude<AffiliateNetwork, "merchant">, string> = {
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
      "Affiliate guitar landing. SAMPLE Ibanez-style pick for players who want a working neck, not a wall piece. Est. in Darkness.",
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
  if (network === "merchant") return url;
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
