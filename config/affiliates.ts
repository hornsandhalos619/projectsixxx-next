/**
 * Affiliate catalog lives here only. Empty tags still link the merchant.
 *
 * zZounds founder affiliate IDs already live in the path. The `zzounds`
 * network leaves merchantUrl untouched — do not stamp query tags on it.
 * Next founder zZounds SKU: `${ZZOUNDS_AFFILIATE_BASE}/item--XXXX`
 * (append the product path only; do not invent SKUs).
 *
 * Amazon doors bake `tag=hornsandhal0b-20` into merchantUrl.
 * Where a SKU has both zZounds and Amazon, merchantUrl stays zZounds.
 *
 * Side door only: live SKUs belong on /shop and /shop/[category].
 * Do not put product name, dek, or CTA on app/page.tsx.
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

export const AMAZON_ASSOCIATE_TAG = "hornsandhal0b-20";

export const FOUNDER_PICK_SLUG = "lenovo-legion-5i";

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
  /** Optional listing body. Shop UI prefers this, then belief. */
  body?: string;
  merchant: string;
  merchantUrl: string;
  network: AffiliateNetwork;
  status: "sample" | "live";
  priceHint: string;
  /** Public shop / sitemap / metadata. Default off until the SKU is a real affiliate door. */
  published?: boolean;
};

export function productBody(product: AffiliateProduct) {
  return product.body ?? product.belief;
}

export function isFounderPick(product: Pick<AffiliateProduct, "slug">) {
  return product.slug === FOUNDER_PICK_SLUG;
}

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
    dek: "Instruments that earn the night.",
    seoTitle: "Guitars — Project SiXXX Shop",
    seoDescription:
      "Affiliate guitar shelf. Live Line 6 Helix LT, Helix Stadium XL, HX Stomp, Quad Cortex, Katana-50 Gen 3, and ESP LTD EC-1000. Est. in Darkness.",
  },
  {
    slug: "synths",
    title: "Synths",
    dek: "Voltage, breath, and the machines that refuse to be polite.",
    seoTitle: "Synths — Project SiXXX Shop",
    seoDescription:
      "Affiliate synth shelf. Live MicroFreak, MiniFreak, Minilogue XD, Grandmother, and Digitone II. Est. in Darkness.",
  },
  {
    slug: "tablets",
    title: "Tablets",
    dek: "A drawing surface that can take a beating and still listen.",
    seoTitle: "Tablets — Project SiXXX Shop",
    seoDescription:
      "Affiliate tablet shelf. Live iPad Pro, Cintiq 16, Galaxy Tab S10 Ultra, Surface Pro, Kamvas 13, Intuos Pro, and Artist Pro 16. Est. in Darkness.",
  },
  {
    slug: "art-supplies",
    title: "Art Supplies",
    dek: "Pigment, paper, steel — the unglamorous tools that actually mark.",
    seoTitle: "Art Supplies — Project SiXXX Shop",
    seoDescription:
      "Affiliate art-supply shelf. Live Molotow, POSCA, Sharpie, Zebra Sarasa, Prismacolor Premier, and Apple Pencil Pro. Est. in Darkness.",
  },
  {
    slug: "computer-gear",
    title: "Computer Gear",
    dek: "The box you sit in front of when the house is closed.",
    seoTitle: "Computer Gear — Project SiXXX Shop",
    seoDescription:
      "Affiliate computer-gear shelf. Founder Legion 5i first, then studio headphones, Scarlett 2i2, and T7 Shield. Est. in Darkness.",
  },
];

const HELIX_LT_FOUNDER_COPY =
  "I owned this for years, cleaner than the full HELIX, less unused ports on the back. It's amazing — hands down one of the greatest tone control units ever made for electric guitar. A wonderful start before you get your hands on the Stadium HX.";

const STADIUM_XL_FOUNDER_COPY =
  "This is literally the finest addition to my arsenal ever created. As if the Helix ever came short (which it NEVER DID) the Stadium literally rocks my socks off. Tremendous depth, clarity, punch, everything was refined to the utmost. I play a 9 string and my sound got a little muddy (I admit it) when I play her bottom end. The Stadium took that MUD and turned into clean THUD. It was like night and day. OMGZ. I can't tell you what that does for my tone: My metal is so heavy it's unreal. Crunch... haha.... it's not crunch it's more like Pulp and Mulch. And the funk. Where is Les Claypool. I think he might appreciate this thing more than I do. And that is saying something. From the blackest metal I can summon to the most twinkling footsteps of fairies and the haunting shimmer of ethereal magick, this is the finest tone control I've ever dreamed of. You want it. Trust me. It's worth every penny.";

export const products: AffiliateProduct[] = [
  {
    slug: "line-6-helix-lt",
    category: "guitars",
    name: "Line 6 Helix LT",
    dek: HELIX_LT_FOUNDER_COPY,
    belief: HELIX_LT_FOUNDER_COPY,
    body: HELIX_LT_FOUNDER_COPY,
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--LINHELIXLT`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "line-6-stadium-xl",
    category: "guitars",
    name: "Line 6 Helix Stadium XL",
    dek: STADIUM_XL_FOUNDER_COPY,
    belief: STADIUM_XL_FOUNDER_COPY,
    body: STADIUM_XL_FOUNDER_COPY,
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--LINSTADIUMXL?siid=390641`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "line-6-hx-stomp",
    category: "guitars",
    name: "Line 6 HX Stomp",
    dek: "The Helix library in a pedalboard-sized floor unit.",
    belief: "It earns the shelf as the compact Helix that still carries the full library.",
    body: "A pedalboard-scale unit with the same modeling library as the larger Helix boards.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--LINHXSTOMP`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "neural-dsp-quad-cortex",
    category: "guitars",
    name: "Neural DSP Quad Cortex",
    dek: "A flagship modeler with Neural Capture and a 7-inch touchscreen.",
    belief: "It earns the shelf as a full creative platform for boutique metal and dark-ambient work.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--NERQC`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "boss-katana-50-gen-3",
    category: "guitars",
    name: "Boss Katana-50 Generation 3",
    dek: "A light stage-and-practice combo with Tube Logic and onboard Boss effects.",
    belief: "It earns the shelf as the cab that covers practice, USB recording, and a small stage in one box.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--BOSKTN50V3`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "esp-ltd-ec-1000-evertune-bb",
    category: "guitars",
    name: "ESP LTD EC-1000 EverTune BB",
    dek: "EMG 81/60TW-R firepower with constant-tension EverTune.",
    belief: "It earns the shelf as a locked-in gothic and metal guitar under stage lights.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--ESPEC1000ETBB`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "ibanez-rg-sample",
    category: "guitars",
    name: "Ibanez-style RG",
    dek: "A fast neck. A working trem.",
    belief:
      "If the neck is a hallway and the fretboard is a floor, buy the one you can walk in the dark. A setup is a setup.",
    merchant: "Sweetwater",
    merchantUrl: "https://www.sweetwater.com/c1000--Solidbody_Guitars",
    network: "sweetwater",
    status: "sample",
    published: false,
    priceHint: "Placeholder — confirm live SKU before spend",
  },
  {
    slug: "arturia-microfreak",
    category: "synths",
    name: "Arturia MicroFreak",
    dek: "A hybrid with wavetable engines and poly-aftertouch.",
    belief: "It earns the shelf for experimental dark electronica that wants a compact hybrid.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--ARAMICROFREAK`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "arturia-minifreak",
    category: "synths",
    name: "Arturia MiniFreak",
    dek: "The Freak engine at six voices, with stereo effects and a real keybed.",
    belief: "It earns the shelf as the hybrid poly that still fits a working desk.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--ARAMINIFREAK`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "korg-minilogue-xd",
    category: "synths",
    name: "Korg Minilogue XD",
    dek: "A hybrid analog polysynth for pads, leads, and motion-sequenced textures.",
    belief: "It earns the shelf as the analog-hybrid for dark pads and sequenced motion.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--KORMINILOGUEXD`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "moog-grandmother",
    category: "synths",
    name: "Moog Grandmother",
    dek: "Handmade Moog oscillators, a spring reverb tank, and semi-modular patching.",
    belief: "It earns the shelf for expressive bass and leads with a spring tank in the chain.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--MOOGRANDMOTHER`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "elektron-digitone-ii",
    category: "synths",
    name: "Elektron Digitone II",
    dek: "The FM classic, now 16 tracks and 16 voices.",
    belief: "It earns the shelf for DAWless gothic electronica and intricate sequencing.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--ELKDIGITONEII`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "",
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
    published: false,
    priceHint: "Placeholder",
  },
  {
    slug: "apple-ipad-pro-13-m5-256gb",
    category: "tablets",
    name: "Apple iPad Pro 13-inch (M5) 256GB Wi-Fi Space Black",
    dek: "13-inch iPad Pro with the M5 chip and Ultra Retina XDR.",
    belief: "It earns the shelf as the portable canvas when Procreate and desk apps need real power.",
    body: "Space Black, 256GB, Wi-Fi — the current 13-inch Pro configuration.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0FWD1MS82?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "wacom-cintiq-16",
    category: "tablets",
    name: "Wacom Cintiq 16",
    dek: "An on-screen drawing display with Pro Pen 2 and Full HD.",
    belief: "It earns the shelf for gothic illustration that wants to draw on the pixel.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B07L77GTTY?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "samsung-galaxy-tab-s10-ultra",
    category: "tablets",
    name: "Samsung Galaxy Tab S10 Ultra 14.6-inch (1TB Wi-Fi)",
    dek: "Samsung's largest tablet canvas — a 14.6-inch Dynamic AMOLED 2X slab with S Pen.",
    belief: "It earns the shelf as a huge portable drawing surface for dark digital work.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0DSLSTV1N?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "microsoft-surface-pro-11-x-elite",
    category: "tablets",
    name: "Microsoft Surface Pro 11th Edition (Snapdragon X Elite, 16GB/512GB OLED)",
    dek: "A Windows 2-in-1 with Snapdragon X Elite and an OLED touchscreen.",
    belief: "It earns the shelf when laptop power and stylus sketching need to live in one kickstand slate.",
    body: "16GB, 512GB, OLED — the high-end 11th Edition configuration.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0CXL5KT64?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "huion-kamvas-13-gen-3",
    category: "tablets",
    name: "Huion Kamvas 13 (Gen 3)",
    dek: "Full lamination, Canvas Glass 2.0, and 16,384 pressure levels on a 13-inch screen.",
    belief: "It earns the shelf as the accessible pen display that still takes serious drawing.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0D813G71Q?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "wacom-intuos-pro-medium",
    category: "tablets",
    name: "Wacom Intuos Pro Medium",
    dek: "A screenless Pro Pen 2 tablet with ExpressKeys and Bluetooth.",
    belief: "It earns the shelf for Pro Pen 2 precision, ExpressKeys, and Bluetooth desk workflows.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B01MQU5LW7?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "xp-pen-artist-pro-16-gen-2",
    category: "tablets",
    name: "XP-Pen Artist Pro 16 (Gen 2)",
    dek: "A 16-inch 2.5K laminated pen display with 16K pressure.",
    belief: "It earns the shelf as the mid-tier drawing screen for a large laminated canvas at creator-desk pricing.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0CB1GCGXT?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "tablet-placeholder",
    category: "tablets",
    name: "Drawing tablet (placeholder)",
    dek: "Pressure, tilt, and a screen you can actually see at 2 a.m.",
    belief: "The tool should disappear. The right one stays out of the way.",
    merchant: "B&H",
    merchantUrl: "https://www.bhphotovideo.com/",
    network: "bandh",
    status: "sample",
    published: false,
    priceHint: "Placeholder",
  },
  {
    slug: "molotow-one4all-10-basic-4mm",
    category: "art-supplies",
    name: "Molotow ONE4ALL Acrylic Paint Marker Set, 10 Basic Colors #1, 4mm",
    dek: "Refillable acrylic pump markers — high-opacity, UV-resistant, 4mm.",
    belief: "It earns the shelf for color that holds on canvas, plastic, wood, and almost any surface.",
    body: "Ten basic colors in the #1 set.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B00JP47R4Y?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "posca-pc-3m-8-pack",
    category: "art-supplies",
    name: "uni POSCA PC-3M Water-Based Paint Markers, Fine Tip, Assorted, Pack of 8",
    dek: "Fine-tip water-based paint markers that lay opaque, layerable color.",
    belief: "It earns the shelf as a studio staple for illustration and craft across fifty-plus surfaces.",
    body: "Assorted pack of eight.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0BFB9C8SS?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "sharpie-fine-tip-black-12",
    category: "art-supplies",
    name: "Sharpie Permanent Markers, Fine Tip, Black, 12 Count",
    dek: "Fine-tip black permanent markers, twelve in a box.",
    belief: "It earns the shelf for bold outlines, labeling, and marks that stay on almost every surface.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B00006IFHD?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "zebra-sarasa-fineliner-black-12",
    category: "art-supplies",
    name: "Zebra Pen SARASA Fineliner, Black Ink, 0.8mm, 12-Pack",
    dek: "Archival, acid-free black linework with a metal-reinforced 0.8mm tip.",
    belief: "It earns the shelf for smooth, smudge-resistant detail in journals and illustration.",
    body: "Twelve-pack, 0.8mm.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B01LYFUYVJ?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "prismacolor-premier-72",
    category: "art-supplies",
    name: "Prismacolor Premier Colored Pencils (72 Count)",
    dek: "Seventy-two soft-core pencils with creamy, blendable pigment.",
    belief: "It earns the shelf for rich shadowed color work in gothic illustration.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B000E23RSQ?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "apple-pencil-pro",
    category: "art-supplies",
    name: "Apple Pencil Pro",
    dek: "The stylus for current iPad Pro and Air drawing — squeeze, barrel roll, and hover.",
    belief: "It earns the shelf as essential kit for Procreate on the current iPad boards.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0D3J71RM7?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "art-supplies-placeholder",
    category: "art-supplies",
    name: "Studio kit (placeholder)",
    dek: "Paper that takes ink. Ink that stays. Steel that holds.",
    belief: "Supplies are a decision about permanence.",
    merchant: "Merchant",
    merchantUrl: "https://www.dickblick.com/",
    network: "merchant",
    status: "sample",
    published: false,
    priceHint: "Placeholder",
  },
  {
    slug: "lenovo-legion-5i",
    category: "computer-gear",
    name: 'Lenovo Legion 5i 16" AI Gaming Laptop (Ultra 9 275HX, RTX 5060, 64GB/2TB)',
    dek: "The machine behind the house.",
    belief: "I built this website and every piece of content on it on my Legion 5.",
    body: "Mine runs an i9, an RTX 5060, 64GB of RAM, and a 2TB drive.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0FQTYSHW8?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "audio-technica-ath-m50x",
    category: "computer-gear",
    name: "Audio-Technica ATH-M50x",
    dek: "Closed-back studio monitors for mixing and tracking.",
    belief: "It earns the shelf for closed-back mixing and tracking clarity at the desk.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--AUTATHM50X`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "sony-mdr-7506",
    category: "computer-gear",
    name: "Sony MDR-7506",
    dek: "Foldable studio headphones with decades of broadcast and production use.",
    belief: "It earns the shelf as an industry-standard closed monitor for accurate tracking.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--SNYMDR7506`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "sony-mdr-m1",
    category: "computer-gear",
    name: "Sony MDR-M1 Professional Reference Closed Monitor Headphones",
    dek: "Sony's modern closed-back studio reference, 5Hz–80kHz.",
    belief: "It earns the shelf as the current closed monitor beside the classic 7506.",
    body: "Ultra-wideband playback for creators who want the newer Sony reference.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B0DD8SHVZL?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "focusrite-scarlett-2i2-4th-gen",
    category: "computer-gear",
    name: "Focusrite Scarlett 2i2 4th Gen",
    dek: "A two-in, two-out USB interface at 24-bit/192kHz.",
    belief: "It earns the shelf as the desk interface that arrives with conversion and software ready to record.",
    merchant: "zZounds",
    merchantUrl: `${ZZOUNDS_AFFILIATE_BASE}/item--FOCSCAR2I2V4`,
    network: "zzounds",
    status: "live",
    published: true,
    priceHint: "See zZounds",
  },
  {
    slug: "samsung-t7-shield-1tb",
    category: "computer-gear",
    name: "Samsung T7 Shield 1TB Portable SSD",
    dek: "A rugged USB-C SSD with IP65 sealing and up to ~1050 MB/s transfers.",
    belief: "It earns the shelf for session backups and sample libraries that have to leave the house.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/dp/B09VLK9W3S?tag=hornsandhal0b-20",
    network: "amazon",
    status: "live",
    published: true,
    priceHint: "",
  },
  {
    slug: "computer-gear-placeholder",
    category: "computer-gear",
    name: "Workstation (placeholder)",
    dek: "Quiet fans. Enough RAM. A machine that works.",
    belief: "The machine is a lamp. If it glows more than it works, it is furniture.",
    merchant: "Amazon",
    merchantUrl: "https://www.amazon.com/",
    network: "amazon",
    status: "sample",
    published: false,
    priceHint: "Placeholder",
  },
];

/** Placeholder shelves stay in seed for the desk; public shop only lists explicit live doors. */
export function isPublishedProduct(product: AffiliateProduct): boolean {
  if (typeof product.published === "boolean") return product.published;
  return product.status === "live";
}

export function publishedProducts(list: AffiliateProduct[] = products) {
  return list.filter(isPublishedProduct);
}

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
  return publishedProducts().filter((p) => p.category === slug);
}

export function productBySlugs(category: string, slug: string) {
  return publishedProducts().find((p) => p.category === category && p.slug === slug);
}
