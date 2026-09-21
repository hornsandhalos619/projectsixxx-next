export type LinkItem = {
  title: string;
  href: string;
  dek: string;
};

export type LinkShelf = {
  slug: "community" | "research";
  title: string;
  dek: string;
  items: LinkItem[];
};

/**
 * Resource hub shelves. Community = homeless-support links, not charity theater.
 * Research = public-source literacy only — no exploit how-tos.
 */
export const linkShelves: LinkShelf[] = [
  {
    slug: "community",
    title: "Community",
    dek: "Homeless-support and mutual-aid doors.",
    items: [
      {
        title: "National Homelessness Hotline (US)",
        href: "https://www.211.org/",
        dek: "Dial 211 or use the directory for local housing and crisis resources.",
      },
      {
        title: "Homeless Shelter Directory",
        href: "https://www.homelessshelterdirectory.org/",
        dek: "Public directory of shelters and services by location.",
      },
      {
        title: "National Alliance to End Homelessness",
        href: "https://endhomelessness.org/",
        dek: "Policy, research, and pathways for ending homelessness.",
      },
      {
        title: "SAMHSA National Helpline",
        href: "https://www.samhsa.gov/find-help/national-helpline",
        dek: "Treatment referral and information — public, confidential.",
      },
    ],
  },
  {
    slug: "research",
    title: "Research",
    dek: "Public-source literacy. Cite what is already public. Never unauthorized access.",
    items: [
      {
        title: "Congress.gov",
        href: "https://www.congress.gov/",
        dek: "Bills, resolutions, and the federal legislative record.",
      },
      {
        title: "Regulations.gov",
        href: "https://www.regulations.gov/",
        dek: "Proposed and final rules in the public docket.",
      },
      {
        title: "data.gov",
        href: "https://data.gov/",
        dek: "U.S. government open datasets.",
      },
      {
        title: "Internet Archive",
        href: "https://archive.org/",
        dek: "Public web and media archives for citation.",
      },
      {
        title: "Google Scholar",
        href: "https://scholar.google.com/",
        dek: "Scholarly literature discovery. Read what publishers already opened.",
      },
    ],
  },
];
