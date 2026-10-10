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

export type ArtistImage = {
  src?: string;
  alt: string;
  title: string;
  year: string;
  credit: string;
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
  images?: ArtistImage[];
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
    bio: "Copenhagen tattooer Christian Boye Larsen draws horror monsters freehand, straight onto the body, in black and grey built to follow muscle and movement. Honored on the Project SiXXX roster for monsters with flow and a villain's charm.",
    email: "",
    social: [
      { label: "Instagram", href: "https://www.instagram.com/boyetattoo/" },
      { label: "Studio", href: "https://dropout.dk/artists/boye/" },
      { label: "Threads", href: "https://www.threads.com/@boyetattoo" },
    ],
    store: [],
    works: [
      {
        title: "Instagram portfolio",
        year: "ongoing",
        medium: "Freehand tattoo · link-out",
        caption: "Monsters, villains and full-body flow in black and grey. View on @boyetattoo.",
        href: "https://www.instagram.com/boyetattoo/",
      },
      {
        title: "Dropout artist page",
        year: "ongoing",
        medium: "Studio page · link-out",
        caption: "The Copenhagen studio home for the work and its session-based large projects.",
        href: "https://dropout.dk/artists/boye/",
      },
      {
        title: "Portfolio and flash",
        year: "ongoing",
        medium: "Tattoo portfolio + flash · link-out",
        caption: "A broad public archive of finished pieces plus a flash set, hosted on Tattoodo.",
        href: "https://www.tattoodo.com/artists/christian_boye_1",
      },
    ],
  },
  {
    slug: "eliot-kohek",
    name: "Eliot Kohek",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    featured: true,
    published: false,
    bio: "Eliot Kohek tattoos dark realism in pure black and grey from a private studio in Annecy, France: skulls, gothic ruin and apocalyptic scenes with charcoal-deep shadow. Honored on the Project SiXXX roster for light carved out of darkness.",
    email: "",
    social: [
      { label: "Site", href: "https://kohek.com/" },
      { label: "Instagram", href: "https://www.instagram.com/eliot.kohek/" },
    ],
    store: [],
    works: [
      {
        title: "Dark Arts",
        year: "ongoing",
        medium: "Official site · link-out",
        caption: "Realistic tattoos with a dark atmosphere in black and grey. View on kohek.com.",
        href: "https://kohek.com/",
      },
      {
        title: "Instagram portfolio",
        year: "ongoing",
        medium: "Tattoo portfolio · link-out",
        caption: "Large-scale dark realism, regularly updated. View on @eliot.kohek.",
        href: "https://www.instagram.com/eliot.kohek/",
      },
      {
        title: "Portfolio on iNKPPL",
        year: "ongoing",
        medium: "Tattoo portfolio · link-out",
        caption: "A browsable public set across horror, portrait and realism.",
        href: "https://inkppl.com/en/user/eliot.kohek",
      },
    ],
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
    bio: "Jesse Levitt tattoos and paints abstracted dark art, conceiving every piece personally and drawing it freehand onto the body in black and grey. Honored on the Project SiXXX roster for a wholly personal visual language and a gallery-first studio built around dark art.",
    email: "",
    social: [
      { label: "Site", href: "https://jesselevitt.com/" },
      { label: "Instagram", href: "https://instagram.com/jesselevitt" },
      { label: "Darkspace Art Collective", href: "https://www.instagram.com/darkspaceartcollective/" },
    ],
    store: [{ label: "Originals & prints", href: "https://jesselevitt.com/shop/" }],
    works: [
      {
        title: "Tattoo portfolio",
        year: "ongoing",
        medium: "Freehand tattoo · link-out",
        caption: "Freehand, self-conceived dark art on skin. View on jesselevitt.com.",
        href: "https://jesselevitt.com/tattoos/",
      },
      {
        title: "Paintings",
        year: "ongoing",
        medium: "Oil painting · link-out",
        caption: "Canvas work carrying the same organic darkness. View on jesselevitt.com.",
        href: "https://jesselevitt.com/paintings/",
      },
      {
        title: "Skull (11×14, oil)",
        year: "",
        medium: "Original oil painting · link-out",
        caption: "A titled original offered in the artist's shop, alongside small oil studies.",
        href: "https://jesselevitt.com/shop/",
      },
    ],
  },
  {
    slug: "rob-borbas",
    name: "Rob Borbas",
    role: "Collaborator",
    status: "sample",
    mediaPending: true,
    featured: true,
    published: false,
    bio: "Budapest tattooer and illustrator Róbert \"Rob\" Borbás, known as Grindesign, draws grim skulls, ghouls and folkloric demons in fine black line and dotwork. Honored on the Project SiXXX roster for etching-deep darkness that travels from skin to metal album covers.",
    email: "",
    social: [{ label: "Facebook", href: "https://www.facebook.com/theartofgrindesign/" }],
    store: [
      {
        label: "INCUBUS (book)",
        href: "https://www.tattoolifestore.com/product/incubus-the-art-of-grindesign-by-robert-borbas/",
      },
    ],
    works: [
      {
        title: "INCUBUS – The Art of Grindesign",
        year: "2025",
        medium: "Monograph · Tattoo Life · link-out",
        caption: "More than 300 works from five years of tattoo, illustration and sketch, with the Lidérc at its heart.",
        href: "https://www.tattoolifestore.com/product/incubus-the-art-of-grindesign-by-robert-borbas/",
      },
      {
        title: "Soilwork – The Ride Majestic",
        year: "2015",
        medium: "Album cover illustration · link-out",
        caption: "Cover art for Soilwork's 2015 album. Linked to the release announcement.",
        href: "https://www.rockvilag.hu/hirek/soilwork-az-augusztus-vegen-megjeleno-lemez-boritojat-borbas-robi-keszitette/",
      },
      {
        title: "Ten Years of Grindesign",
        year: "2020",
        medium: "Monograph · Tattoo Life · link-out",
        caption: "The first book, gathering roughly 300 works from the first decade.",
        href: "https://hypeandhyper.com/the-first-book-on-the-art-of-a-hungarian-tattooist-grindesign/",
      },
    ],
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
    images: [
      {
        alt: "Hairline frame — media pending",
        title: "Still 01",
        year: "pending",
        credit: "© Dean Ryan Brink, shown with permission",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 02",
        year: "pending",
        credit: "© Dean Ryan Brink, shown with permission",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 03",
        year: "pending",
        credit: "© Dean Ryan Brink, shown with permission",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 04",
        year: "pending",
        credit: "© Dean Ryan Brink, shown with permission",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 05",
        year: "pending",
        credit: "© Dean Ryan Brink, shown with permission",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 06",
        year: "pending",
        credit: "© Dean Ryan Brink, shown with permission",
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
