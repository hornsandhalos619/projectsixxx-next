export type LibraryStatus = "sample" | "house";

export type LibraryWork = {
  slug: string;
  title: string;
  dek: string;
  author: string;
  year: string;
  status: LibraryStatus;
  format: string;
  /** Short sterile blurb for the catalog index. */
  blurb: string;
  /** On-site sample reader body (plain paragraphs). No payments. */
  sample: string[];
};

/** On-site e-book / reading library. SAMPLE titles only — no fake checkout. */
export const libraryWorks: LibraryWork[] = [
  {
    slug: "est-in-darkness",
    title: "Est. in Darkness",
    dek: "A house pamphlet on mood, craft, and the date we keep.",
    author: "House",
    year: "2026",
    status: "sample",
    format: "Pamphlet / e-book",
    blurb: "Mood as discipline. Why the house refuses costume darkness.",
    sample: [
      "Est. in Darkness is a date. It names when the work decided it could stand in bad light.",
      "We do not steal sacred marks. We do not dress the house as a devil or a saint. Atmosphere sits over a clean information architecture — haunting skin, sterile bones.",
      "If a sentence needs a costume to be believed, it does not make the night. This SAMPLE is a door into the longer cut.",
    ],
  },
  {
    slug: "twin-gates",
    title: "Twin Gates",
    dek: "Notes on Horns and Halos as architecture and light.",
    author: "House",
    year: "2026",
    status: "sample",
    format: "Essay / e-book",
    blurb: "Duality without pageant. Ribs that never meet. A ring that breaks.",
    sample: [
      "Horns are two vault ribs that never meet. The gap is the suggestion — oxide, ember at the floor, no goat and no pitchfork.",
      "Halos are an incomplete annulus. Silver rim. Broken at four o'clock so it cannot read as a holy nimbus.",
      "The portal is a choice. This SAMPLE keeps the geometry; the wearable language, when it arrives, uses silver.",
    ],
  },
  {
    slug: "night-ledger",
    title: "Night Ledger",
    dek: "Craft before consensus. Commerce as weather.",
    author: "House",
    year: "2026",
    status: "sample",
    format: "Field notes",
    blurb: "Quiet tests for work that survives a blank name and a blank price.",
    sample: [
      "Craft is the part you cannot vote into existence. Consensus is a room. Rooms are useful. Craft is the work.",
      "Money moves. That is its job. A sale can fund the next night. A sale cannot baptize a weak piece.",
      "Would you keep it if the name went blank. Would you keep it if the price went blank. Those are the tests this SAMPLE keeps open.",
    ],
  },
  {
    slug: "public-light",
    title: "Public Light",
    dek: "Public-source literacy without crossing into harm.",
    author: "House",
    year: "2026",
    status: "sample",
    format: "Literacy brief",
    blurb: "How to read what is already public. Never exploit. Never unauthorized access.",
    sample: [
      "Research on this shelf means public-source literacy — records, citations, and the patience to read what is already out.",
      "It does not mean exploit guides, malware, or unauthorized access. Those are out of house. Always.",
      "This SAMPLE points at /links for community and research doors. The longer brief stays SAMPLE until the founder sets house status.",
    ],
  },
];

export function allLibraryWorks() {
  return libraryWorks;
}

export function libraryBySlug(slug: string) {
  return libraryWorks.find((w) => w.slug === slug);
}
