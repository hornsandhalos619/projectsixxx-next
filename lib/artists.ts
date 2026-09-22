export type ArtistStatus = "sample" | "house";

export type Work = {
  title: string;
  year: string;
  medium: string;
  caption: string;
  mediaUrl?: string;
};

export type Artist = {
  slug: string;
  name: string;
  role: string;
  status: ArtistStatus;
  bio: string;
  email: string;
  social: { label: string; href: string }[];
  store: { label: string; href: string }[];
  works: Work[];
  mediaPending?: boolean;
  featured?: boolean;
  featuredRank?: number;
};

/**
 * Roster seeds. SAMPLE / media pending until the founder lands approved stills.
 * Bios are attribution-only — no invented personal history, no style imitation.
 */
export const artists: Artist[] = [
  {
    slug: "project-sixxx",
    name: "Project SiXXX",
    role: "House",
    status: "sample",
    mediaPending: true,
    bio: "The house name, not a legal caption. Project SiXXX holds journal, gallery, portal, library, and shop. This roster card is SAMPLE until the founder sets the public artist line.",
    email: "house@projectsixxx.com",
    social: [{ label: "Site", href: "/" }],
    store: [
      { label: "Shop hub", href: "/shop" },
      { label: "Horns & Halos portal", href: "/horns-and-halos" },
    ],
    works: [
      {
        title: "Est. in Darkness",
        year: "2026",
        medium: "House mark / void study",
        caption: "Mood lockup. Not a costume. Media pending.",
      },
      {
        title: "Twin Gates",
        year: "2026",
        medium: "Architecture / light",
        caption: "Horns as vault ribs. Halos as a broken oculus.",
      },
    ],
  },
  {
    slug: "christian-boye-larsen",
    name: "Christian Boye Larsen",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    featured: true,
    bio: "Named collaborator slot for Christian Boye Larsen. SAMPLE — media pending. No invented biography. Page expands when the house lands approved stills and a founder-blessed credit line.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
  {
    slug: "eliot-kohek",
    name: "Eliot Kohek",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    bio: "Named collaborator slot for Eliot Kohek. SAMPLE — media pending. Attribution placeholder only. No style imitation and no fabricated personal history.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
  {
    slug: "murray-brothers",
    name: "The Murray Brothers",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    bio: "Named collaborator slot for the Murray Brothers. SAMPLE — media pending. Credit line reserved; works and contact land when the founder approves materials.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
  {
    slug: "jesse-levitt",
    name: "Jesse Levitt",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    bio: "Named collaborator slot for Jesse Levitt. SAMPLE — media pending. Short attribution only. Expandable when approved media and links arrive.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
  {
    slug: "rob-borbas",
    name: "Rob Borbas",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    bio: "Named collaborator slot for Rob Borbas. SAMPLE — media pending. No invented personal history. Page holds the name until the house sets the public credit.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
  // Expandable empty slots — founder can fill later without route surgery.
  {
    slug: "slot-open-01",
    name: "Open slot",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    bio: "Expandable collaborator slot. SAMPLE until named. Reserved for a future house guest — no placeholder persona.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
  {
    slug: "slot-open-02",
    name: "Open slot",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    bio: "Expandable collaborator slot. SAMPLE until named. Kept empty of invented history on purpose.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
];

export function artistBySlug(slug: string) {
  return artists.find((a) => a.slug === slug);
}

export function isFeaturedArtist(artist: Artist): boolean {
  if (typeof artist.featured === "boolean") return artist.featured;
  return artist.role === "Collaborator" && !artist.slug.startsWith("slot-open");
}

export function featuredCollaborators() {
  return artists.filter(isFeaturedArtist);
}
