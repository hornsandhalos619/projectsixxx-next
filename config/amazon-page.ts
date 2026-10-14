/**
 * The single Amazon page (/amazon). Amazon affiliate links live ONLY here.
 * Text-only cards: no Amazon images, no prices (PA-API not unlocked yet),
 * no third-party logos. Every link uses the one tag below.
 * Section order follows personas.md shelf priorities (Oct: altar + gothic decor first).
 */
export const AMAZON_PAGE_TAG = "hornsandhal0b-20";

export const amazonLink = (asin: string) =>
  `https://www.amazon.com/dp/${asin}?tag=${AMAZON_PAGE_TAG}`;

export type AmazonPick = {
  asin: string;
  name: string;
  lane: "Horns" | "Halos" | "Both";
  note: string;
};

export type AmazonSection = {
  id: string;
  title: string;
  dek: string;
  picks: AmazonPick[];
};

export const amazonSections: AmazonSection[] = [
  {
    id: "altar",
    title: "Altar and candlelight",
    dek: "Black wax and black iron for the long nights.",
    picks: [
      { asin: "B08RC8V9QN", name: "CANDWAX 3x3 black pillar candles, set of 3", lane: "Horns", note: "Unscented, no-drip black pillars for an altar or a table." },
      { asin: "B096KQMC2T", name: "CANDWAX black 10-inch taper candles, 4 pack", lane: "Horns", note: "Tall, smokeless black tapers sized for a candelabra." },
      { asin: "B08GSG8C41", name: "5-arm black metal candelabra", lane: "Horns", note: "A pure black five-arm holder for taper candles." },
      { asin: "B08HC6MKVL", name: "Matte black pillar candle holders, set of 3", lane: "Horns", note: "Three heights of matte black metal for pillar candles." },
    ],
  },
  {
    id: "silver-and-gold",
    title: "Silver and gold",
    dek: "Crescents and chains in the Halos metals.",
    picks: [
      { asin: "B074274RH9", name: "Sterling silver crescent phases moon necklace", lane: "Halos", note: "A sterling crescent made for daily wear." },
      { asin: "B0105VZ4GI", name: "Silvershake sterling waning crescent filigree pendant", lane: "Halos", note: "Filigree crescent on an 18-inch Venetian box chain." },
      { asin: "B079JW6C7Y", name: "ASHINE sterling silver box chain", lane: "Halos", note: "A pendant-ready sterling chain for the piece you already own." },
      { asin: "B07SLLZ1CQ", name: "Miabella Italian sterling silver rope chain", lane: "Halos", note: "Italian sterling rope in 2mm or 3mm." },
      { asin: "B0D1R5WR6N", name: "Jewlpire 14K gold plated sterling cable chain", lane: "Halos", note: "Fine gold over sterling, in lengths from 14 to 26 inches." },
    ],
  },
  {
    id: "steel-and-black",
    title: "Steel and black",
    dek: "Everyday pieces in the Horns tones.",
    picks: [
      { asin: "B071LGZT5Q", name: "Stainless steel square signet ring", lane: "Both", note: "Comes in black, silver or gold. Pick your side." },
      { asin: "B07QWPXY63", name: "ETHOON heart leather choker", lane: "Horns", note: "Soft adjustable black choker with a small heart ring." },
      { asin: "B07WD5NCWT", name: "Dickies pullover fleece hoodie (black)", lane: "Horns", note: "A sturdy black workwear hoodie." },
    ],
  },
  {
    id: "library",
    title: "Gothic library",
    dek: "Two doorways into the house.",
    picks: [
      { asin: "0141439475", name: "Frankenstein, Mary Shelley", lane: "Horns", note: "The creation story of the dark, wise and humane." },
      { asin: "0345337662", name: "Interview with the Vampire, Anne Rice", lane: "Halos", note: "Lush, grieving and elegant." },
    ],
  },
  {
    id: "chess-and-desk",
    title: "Chess and the desk",
    dek: "Black-and-frost chess and a dark desk.",
    picks: [
      { asin: "B00IFWO7VI", name: "CHH black and frosted glass chess set", lane: "Both", note: "Black and frosted glass pieces on a mirror board." },
      { asin: "B0BYDZQY2K", name: "AFIING large black desk mat, 47 x 17 in", lane: "Horns", note: "One black surface from keyboard to mouse." },
      { asin: "B0C8QYB8W6", name: "Razer BlackWidow V4 X keyboard, black", lane: "Horns", note: "A full-size mechanical board in black." },
    ],
  },
];
