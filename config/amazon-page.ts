/**
 * The single Amazon page (/picks). Amazon affiliate links live ONLY here.
 * Text-only cards: no Amazon images, no prices (PA-API not unlocked yet),
 * no third-party logos. Every link uses the one tag below.
 * Cards are grouped by the lowest budget tier each checked price fits.
 * tierPrice / checkedAt are internal only — never render them.
 */
export const AMAZON_TAG = "hornsandhal0b-20";

export const amazonLink = (asin: string) =>
  `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;

export type AmazonLane = "Horns" | "Halos" | "Both";

export type AmazonTheme =
  | "Candlelight"
  | "Silver and gold"
  | "Steel and black"
  | "Gothic library"
  | "Chess and the desk";

export type AmazonPick = {
  asin: string;
  name: string;
  lane: AmazonLane;
  theme: AmazonTheme;
  note: string;
  /** Internal only. Never render. */
  tierPrice: number;
  /** Internal only. Never render. ISO date the tierPrice was checked. */
  checkedAt: string;
};

export type AmazonSection = {
  id: string;
  title: string;
  dek: string;
  picks: AmazonPick[];
};

export const TIER_CHECKED_AT = "2026-10-16";

export const TIER_DEFS = [
  { id: "under-10", title: "Under $10", dek: "Small doors into the house.", max: 10 },
  { id: "under-25", title: "Under $25", dek: "Everyday dark gifts.", max: 25 },
  { id: "under-50", title: "Under $50", dek: "A fuller shelf, a fuller desk.", max: 50 },
  { id: "under-75", title: "Under $75", dek: "A chain that lasts.", max: 75 },
  { id: "under-100", title: "Under $100", dek: "The long-stay pieces.", max: 100 },
  { id: "100-and-up", title: "$100 and up", dek: "The high shelf.", max: Number.POSITIVE_INFINITY },
] as const;

export type AmazonTierId = (typeof TIER_DEFS)[number]["id"];

export function tierIdForPrice(price: number): AmazonTierId {
  if (price < 10) return "under-10";
  if (price < 25) return "under-25";
  if (price < 50) return "under-50";
  if (price < 75) return "under-75";
  if (price < 100) return "under-100";
  return "100-and-up";
}

/**
 * Live picks with a checked price (rechecked 2026-10-16 PT, one dp page at a time).
 * Held off the page until a price lands: B074274RH9, B0105VZ4GI, 0345337662.
 */
export const amazonPicks: AmazonPick[] = [
  {
    asin: "B096KQMC2T",
    name: "CANDWAX black 10-inch taper candles, 4 pack",
    lane: "Horns",
    theme: "Candlelight",
    note: "Tall, smokeless black tapers sized for a candelabra.",
    tierPrice: 9.95,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B07QWPXY63",
    name: "ETHOON heart leather choker",
    lane: "Horns",
    theme: "Steel and black",
    note: "Soft adjustable black choker with a small heart ring.",
    tierPrice: 7.99,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B071LGZT5Q",
    name: "Stainless steel square signet ring",
    lane: "Both",
    theme: "Steel and black",
    note: "Comes in black, silver or gold. Choose wisely.",
    tierPrice: 9.98,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B08GSG8C41",
    name: "5-arm black metal candelabra",
    lane: "Horns",
    theme: "Candlelight",
    note: "A pure black five-arm holder for taper candles.",
    tierPrice: 21.99,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B079JW6C7Y",
    name: "ASHINE sterling silver box chain",
    lane: "Halos",
    theme: "Silver and gold",
    note: "A pendant-ready sterling chain for the piece you already own.",
    tierPrice: 22.99,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B0D1R5WR6N",
    name: "Jewlpire 14K gold plated sterling cable chain",
    lane: "Halos",
    theme: "Silver and gold",
    note: "Fine gold over sterling, in lengths from 14 to 26 inches.",
    tierPrice: 15.19,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B07WD5NCWT",
    name: "Dickies pullover fleece hoodie (black)",
    lane: "Horns",
    theme: "Steel and black",
    note: "A sturdy black workwear hoodie.",
    tierPrice: 23.5,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "0141439475",
    name: "Frankenstein, Mary Shelley",
    lane: "Horns",
    theme: "Gothic library",
    note: "The creation story of the dark, wise and humane.",
    tierPrice: 6.49,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B0BYDZQY2K",
    name: "AFIING large black desk mat, 47 x 17 in",
    lane: "Horns",
    theme: "Chess and the desk",
    note: "One black surface from keyboard to mouse.",
    tierPrice: 19.99,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B08HC6MKVL",
    name: "Matte black pillar candle holders, set of 3",
    lane: "Horns",
    theme: "Candlelight",
    note: "Three heights of matte black metal for pillar candles.",
    tierPrice: 29.99,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B00IFWO7VI",
    name: "CHH black and frosted glass chess set",
    lane: "Both",
    theme: "Chess and the desk",
    note: "Black and frosted glass pieces on a mirror board.",
    tierPrice: 44.99,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B07SLLZ1CQ",
    name: "Miabella Italian sterling silver rope chain",
    lane: "Halos",
    theme: "Silver and gold",
    note: "Italian sterling rope in 2mm or 3mm.",
    tierPrice: 74.9,
    checkedAt: TIER_CHECKED_AT,
  },
  {
    asin: "B0C8QYB8W6",
    name: "Razer BlackWidow V4 X keyboard, black",
    lane: "Horns",
    theme: "Chess and the desk",
    note: "A full-size mechanical board in black.",
    tierPrice: 99.99,
    checkedAt: TIER_CHECKED_AT,
  },
];

export function buildAmazonSections(picks: AmazonPick[] = amazonPicks): AmazonSection[] {
  return TIER_DEFS.map((tier) => ({
    id: tier.id,
    title: tier.title,
    dek: tier.dek,
    picks: picks.filter((pick) => tierIdForPrice(pick.tierPrice) === tier.id),
  })).filter((section) => section.picks.length > 0);
}

export const amazonSections: AmazonSection[] = buildAmazonSections();
