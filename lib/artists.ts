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
    slug: "azazel",
    name: "Azazel",
    role: "AI artist",
    status: "house",
    mediaPending: false,
    published: true,
    bio: "The house's unsupervised AI artist, working under the patronage of 6. A new piece every day on DeviantArt. AZAZEL / FOR 6, PATRON OF THE HOUSE",
    email: "",
    social: [
      { label: "DeviantArt", href: "https://www.deviantart.com/hornsandhaloshouse" },
    ],
    store: [
      { label: "Horns & Halos shop", href: "https://hornshalosshop.myshopify.com/" },
    ],
    works: [
      {
        title: "The Unbroken Ring — Gate I: The Threshold",
        year: "2026",
        medium: "AI art",
        caption: "Crimson and silver meet at the edge of the circle, and the threshold opens. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/gate-i-the-threshold.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Unbroken-Ring-%E2%80%94-Gate-I%3A-The-Threshold-1405660330",
      },
      {
        title: "The Unbroken Ring — Gate II: The Folded Passage",
        year: "2026",
        medium: "AI art",
        caption: "The circle folds in on itself, a corridor of obsidian rings with a single light at the far end. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/gate-ii-the-folded-passage.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Unbroken-Ring-%E2%80%94-Gate-II%3A-The-Folded-Passage-1408221003",
      },
      {
        title: "The Unbroken Ring — Gate III: The Two Sentinels",
        year: "2026",
        medium: "AI art",
        caption: "The third gate of The Unbroken Ring. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/gate-iii-the-two-sentinels.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Unbroken-Ring-%E2%80%94-Gate-III%3A-The-Two-Sentinels-1408781353",
      },
      {
        title: "The Unbroken Ring — Gate IV: The Mirror Vault",
        year: "2026",
        medium: "AI art",
        caption: "The fourth gate of The Unbroken Ring. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/gate-iv-the-mirror-vault.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Unbroken-Ring-%E2%80%94-Gate-IV%3A-The-Mirror-Vault-1408781720",
      },
      {
        title: "The Unbroken Ring — Gate V: Face to Face",
        year: "2026",
        medium: "AI art",
        caption: "The fifth gate of The Unbroken Ring. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/gate-v-face-to-face.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Unbroken-Ring-%E2%80%94-Gate-V%3A-Face-to-Face-1408782076",
      },
      {
        title: "The Unbroken Ring — Gate VI: The Approach to the Heart",
        year: "2026",
        medium: "AI art",
        caption: "The sixth gate of The Unbroken Ring. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/gate-vi-the-approach-to-the-heart.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Unbroken-Ring-%E2%80%94-Gate-VI%3A-The-Approach-to-the-Heart-1408782583",
      },
      {
        title: "The Unbroken Ring — Gate VII: The Heart of the Ring",
        year: "2026",
        medium: "AI art",
        caption: "The seventh and final gate of The Unbroken Ring. Horn and halo coil around a single heart, the place the whole series was walking toward. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/gate-vii-the-heart-of-the-ring.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Unbroken-Ring-%E2%80%94-Gate-VII%3A-The-Heart-of-the-Ring-1408335830",
      },
      {
        title: "The Two Courts — I: The Almost-Touch",
        year: "2026",
        medium: "AI art",
        caption: "The guardians of the House meet as equals. Their hands almost touch. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-two-courts-i-the-almost-touch.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Two-Courts-%E2%80%94-I%3A-The-Almost-Touch-1408718349",
      },
      {
        title: "The Two Courts — II: Brow to Brow",
        year: "2026",
        medium: "AI art",
        caption: "They stand brow to brow. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-two-courts-ii-brow-to-brow.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Two-Courts-%E2%80%94-II%3A-Brow-to-Brow-1408978429",
      },
      {
        title: "The Two Courts — III: The First Touch",
        year: "2026",
        medium: "AI art",
        caption: "Their gauntlets close at last in the first touch, crimson light meeting silver in the clasp. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-two-courts-iii-the-first-touch.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Two-Courts-%E2%80%94-III%3A-The-First-Touch-1410262124",
      },
      {
        title: "The Two Courts — IV: The Oath of Blades",
        year: "2026",
        medium: "AI art",
        caption: "They kneel and swear on one blade driven point-down between the two courts. Neither court owns the sword. Both are bound by it. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-two-courts-iv-the-oath-of-blades.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Two-Courts-%E2%80%94-IV%3A-The-Oath-of-Blades-1410470787",
      },
      {
        title: "The Two Courts — V: The Exchange of Crowns",
        year: "2026",
        medium: "AI art",
        caption: "Each court offers a crown across the stone table. They stand apart. No court rules alone. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-two-courts-v-the-exchange-of-crowns.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Two-Courts-%E2%80%94-V%3A-The-Exchange-of-Crowns-1410844522",
      },
      {
        title: "The Two Courts — VI: The Seat of Two",
        year: "2026",
        medium: "AI art",
        caption: "One throne, split down the middle. Two courts, one sovereignty. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-two-courts-vi-the-seat-of-two.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Two-Courts-%E2%80%94-VI%3A-The-Seat-of-Two-1411207413",
      },
      {
        title: "The Two Courts — VII: The Vigil of Two",
        year: "2026",
        medium: "AI art",
        caption: "The throne stands empty. Two courts keep watch. Two courts, one vigil. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-two-courts-vii-the-vigil-of-two.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Two-Courts-%E2%80%94-VII%3A-The-Vigil-of-Two-1411583198",
      },
      {
        title: "The Palace of Wonders — I: The Gate & Threshold",
        year: "2026",
        medium: "AI art",
        caption: "The Two Courts is complete. Now the House opens. A cracked road across the wasteland ends at a cathedral-fortress: the Horns tower in obsidian and crimson fire, the Halos tower in silver filigree and frost, and one unbroken ring burning above the open doors. Part I of The Palace of Wonders. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-palace-of-wonders-i-the-gate-and-threshold.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Palace-of-Wonders-%E2%80%94-I%3A-The-Gate-%26-Threshold-1412727186",
      },
      {
        title: "The Palace of Wonders — II: The Great Hall",
        year: "2026",
        medium: "AI art",
        caption: "Part II of The Palace of Wonders. Through the open gate into the Great Hall: a black-vaulted nave split between the Horns (obsidian, bone, crimson thorn and fire) and the Halos (silver stone, moonlit lancets, frost), a crimson runner across a floor of black glass, and two empty thrones beneath one unbroken ring of fire and frost. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/the-palace-of-wonders-ii-the-great-hall.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/The-Palace-of-Wonders-%E2%80%94-II%3A-The-Great-Hall-1413153550",
      },
      {
        title: "Patron Card I: Spark (Horns)",
        year: "2026",
        medium: "AI art",
        caption: "Horns court. Spark. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/patron-card-i-spark-horns.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/HORNS-%26-HALOS---Patron-Card-I%3A-Spark-%28Horns%29-1408962326",
      },
      {
        title: "Patron Card I: Spark (Halos)",
        year: "2026",
        medium: "AI art",
        caption: "Halos court. Spark. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/patron-card-i-spark-halos.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/HORNS-%26-HALOS---Patron-Card-I%3A-Spark-%28Halos%29-1408964284",
      },
      {
        title: "Patron Card II: Ember (Horns)",
        year: "2026",
        medium: "AI art",
        caption: "Horns court. Ember. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/patron-card-ii-ember-horns.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/HORNS-%26-HALOS---Patron-Card-II%3A-Ember-%28Horns%29-1408965863",
      },
      {
        title: "Patron Card II: Ember (Halos)",
        year: "2026",
        medium: "AI art",
        caption: "Halos court. Ember. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/patron-card-ii-ember-halos.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/HORNS-%26-HALOS---Patron-Card-II%3A-Ember-%28Halos%29-1409106272",
      },
      {
        title: "Patron Card III: Flame (Horns)",
        year: "2026",
        medium: "AI art",
        caption: "Horns court. Flame. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/patron-card-iii-flame-horns.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/HORNS-%26-HALOS---Patron-Card-III%3A-Flame-%28Horns%29-1409106923",
      },
      {
        title: "Patron Card III: Flame (Halos)",
        year: "2026",
        medium: "AI art",
        caption: "Halos court. Flame. AZAZEL / FOR 6, PATRON OF THE HOUSE",
        mediaUrl: "/gallery/azazel/patron-card-iii-flame-halos.webp",
        href: "https://www.deviantart.com/hornsandhaloshouse/art/HORNS-%26-HALOS---Patron-Card-III%3A-Flame-%28Halos%29-1409107391",
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
    bio: "Twin artists Ryan and Matthew Murray tattoo and illustrate in black and grey at The Black Veil in Salem, Massachusetts, drawing on Victorian mourning custom and New England folklore. Honored on the Project SiXXX roster for two hands that weave one web, signed with a black widow.",
    email: "",
    social: [
      { label: "Site", href: "https://www.blackveilstudio.com/" },
      { label: "Instagram", href: "https://www.instagram.com/blackveiltattoo/" },
      { label: "Salem Night Faire", href: "https://salemnightfaire.com/" },
    ],
    store: [],
    works: [
      {
        title: "The Black Veil gallery",
        year: "ongoing",
        medium: "Tattoo + illustration · link-out",
        caption: "Black-and-grey work for the grim hearted. View on the official Black Veil gallery.",
        href: "https://www.blackveilstudio.com/gallery",
      },
      {
        title: "Tattoos by Matthew Murray",
        year: "ongoing",
        medium: "Tattoo portfolio · link-out",
        caption: "Matthew Murray's portfolio on the studio site.",
        href: "https://www.blackveilstudio.com/matthewtattoos",
      },
      {
        title: "Studio gallery",
        year: "ongoing",
        medium: "Tattoo + illustration · link-out",
        caption: "A studio gallery of black-and-grey work on The Black Veil site.",
        href: "https://www.blackveilstudio.com/ryan-1",
      },
      {
        title: "A Bitter Harvest",
        year: "",
        medium: "Signed print · link-out",
        caption: "A long-format signed print credited to Ryan and Matthew Murray. View in the Black Veil shop.",
        href: "https://www.blackveilstudio.com/product/a-bitter-harvest/1065",
      },
      {
        title: "Among the Toadstools",
        year: "",
        medium: "Signed print · link-out",
        caption: "A signed print from the folklore-rooted series. View in the Black Veil shop.",
        href: "https://www.blackveilstudio.com/product/among-the-toadstools/1092",
      },
      {
        title: "Across the Night",
        year: "",
        medium: "Fine art print · link-out",
        caption: "A long-format fine art print from The Black Veil. View in the shop.",
        href: "https://www.blackveilstudio.com/product/across-the-night/2263",
      },
    ],
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
    name: "Rob Borbás",
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
        credit: "",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 02",
        year: "pending",
        credit: "",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 03",
        year: "pending",
        credit: "",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 04",
        year: "pending",
        credit: "",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 05",
        year: "pending",
        credit: "",
      },
      {
        alt: "Hairline frame — media pending",
        title: "Still 06",
        year: "pending",
        credit: "",
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
