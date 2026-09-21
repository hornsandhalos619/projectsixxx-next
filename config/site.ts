export const site = {
  name: "Project SiXXX",
  shortName: "SiXXX",
  mood: "Est. in Darkness.",
  domain: "projectsixxx.com",
  url: "https://projectsixxx.com",
  portalPath: "/horns-and-halos",
  description:
    "Project SiXXX is the house. Horns & Halos is a world portal into duality and psyche. Est. in Darkness.",
} as const;

/**
 * When HORNS_AND_HALOS_URL is set, portal CTAs open that URL in a new tab.
 * When empty, fall back to the internal /horns-and-halos portal.
 * Never invent a live external URL.
 */
export const hornsAndHalosLiveUrl = (process.env.HORNS_AND_HALOS_URL ?? "").trim();

export function portalHref(): string {
  return hornsAndHalosLiveUrl || site.portalPath;
}

export function portalIsExternal(): boolean {
  return Boolean(hornsAndHalosLiveUrl);
}

export const primaryNav = [
  { href: "/", label: "House" },
  { href: "/horns-and-halos", label: "Horns & Halos" },
  { href: "/journal", label: "Journal" },
  { href: "/library", label: "Library" },
  { href: "/gallery", label: "Gallery" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
] as const;

export const journalTaxonomy = [
  "religion",
  "politics",
  "cooking",
  "money",
  "fine-art",
  "photography",
  "artists",
  "advertising",
  "buy-sell",
  "san-diego",
  "social-awareness",
  "community",
  "research",
] as const;

export type JournalCategory = (typeof journalTaxonomy)[number];

export const taxonomyCopy: Record<
  JournalCategory,
  { title: string; dek: string }
> = {
  religion: {
    title: "Religion",
    dek: "Belief as a human craft.",
  },
  politics: {
    title: "Politics",
    dek: "Power, civic bone, and the stories that pretend they are not.",
  },
  cooking: {
    title: "Cooking",
    dek: "Heat, patience, and the quiet discipline of feeding people.",
  },
  money: {
    title: "Money",
    dek: "What it buys, what it cannot, and the ledgers we keep in the dark.",
  },
  "fine-art": {
    title: "Fine Art",
    dek: "Craft, intent, and the difference between mood and costume.",
  },
  photography: {
    title: "Photography",
    dek: "Tasteful house photography and editorial — including adult/racy frames treated as craft, never porn spam. Light as a decision. Frame as a cut.",
  },
  artists: {
    title: "Artists",
    dek: "House, guests, and the people who make the work.",
  },
  advertising: {
    title: "Advertising",
    dek: "Belief, outbound, and the ethics of the ask.",
  },
  "buy-sell": {
    title: "Buy / Sell",
    dek: "Commerce as a verdict people confuse with worth.",
  },
  "san-diego": {
    title: "San Diego",
    dek: "Local darkness. Neighborhoods. No poverty-porn.",
  },
  "social-awareness": {
    title: "Social Awareness",
    dek: "Seeing clearly without turning people into content.",
  },
  community: {
    title: "Community",
    dek: "Homeless-support links. See /links.",
  },
  research: {
    title: "Research",
    dek: "Public-source literacy only. Never exploit guides. Never unauthorized access. See /links.",
  },
};
