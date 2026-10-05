export type ArtistStatus = "sample" | "house";

export type Work = {
  title: string;
  year: string;
  medium: string;
  caption: string;
  mediaUrl?: string;
  href?: string;
  links?: { label: string; href: string }[];
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
  /** Public gallery / sitemap / metadata. Default off until the person approves. */
  published?: boolean;
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
    published: true,
    bio: "The house name, not a legal caption. Project SiXXX holds journal, gallery, portal, library, and shop. This roster card waits for the founder to set the public artist line.",
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
    published: false,
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
    featured: true,
    published: false,
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
    featured: true,
    published: false,
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
    featured: true,
    published: false,
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
    featured: true,
    published: false,
    bio: "Named collaborator slot for Rob Borbas. SAMPLE — media pending. No invented personal history. Page holds the name until the house sets the public credit.",
    email: "",
    social: [],
    store: [],
    works: [],
  },
  {
    slug: "dean-ryan-brink",
    name: "Dean Ryan Brink",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    featured: true,
    published: false,
    bio: "Southern California original artist and custom tattoo specialist whose work moves between skin, paint, and underground craft — dark realism, saturated color, and macabre elegance. Honored on the Project SiXXX roster for that language, and for the path that first brought it to this house.",
    email: "",
    social: [
      { label: "Site", href: "https://deanryaninfo.wixsite.com/deanryanbrink" },
      { label: "Instagram", href: "https://www.instagram.com/deanbrinktattoos/" },
      { label: "Tattoo Gallery", href: "https://deanryaninfo.wixsite.com/deanryanbrink/tattoogallery" },
      { label: "Art Gallery", href: "https://deanryaninfo.wixsite.com/deanryanbrink/artgallery" },
    ],
    store: [],
    works: [
      {
        title: "Tattoo Gallery",
        year: "ongoing",
        medium: "Custom tattoo · link-out",
        caption: "Large-scale color and dark surreal work — view on Dean’s official Tattoo Gallery.",
        href: "https://deanryaninfo.wixsite.com/deanryanbrink/tattoogallery",
      },
      {
        title: "Dark-realism vocabulary",
        year: "ongoing",
        medium: "Motif study · link-out",
        caption: "Skulls, roses, ocular motifs — beauty set against the macabre. View the vocabulary on the Tattoo Gallery and Instagram.",
        href: "https://deanryaninfo.wixsite.com/deanryanbrink/tattoogallery",
        links: [
          { label: "Tattoo Gallery", href: "https://deanryaninfo.wixsite.com/deanryanbrink/tattoogallery" },
          { label: "Instagram", href: "https://www.instagram.com/deanbrinktattoos/" },
        ],
      },
      {
        title: "Art Gallery",
        year: "ongoing",
        medium: "Original dark-fantasy painting · link-out",
        caption: "Nightmarish mythic forms and distorted portraiture — view on Dean’s official Art Gallery.",
        href: "https://deanryaninfo.wixsite.com/deanryanbrink/artgallery",
      },
    ],
  },
  // Expandable empty slots — founder can fill later without route surgery.
  {
    slug: "slot-open-01",
    name: "Open slot",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    published: false,
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
    published: false,
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

/** Named collaborators stay off the public site until this is explicitly true. */
export function isPublishedArtist(artist: Artist): boolean {
  if (typeof artist.published === "boolean") return artist.published;
  return artist.role === "House";
}

export function featuredCollaborators() {
  return artists.filter(isFeaturedArtist);
}

export function publishedArtists(list: Artist[] = artists) {
  return list.filter(isPublishedArtist);
}
