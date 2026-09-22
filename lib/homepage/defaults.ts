import type { HomepageSlot } from "./types";

export const defaultHomepageSlots: HomepageSlot[] = [
  {
    slot: "quote",
    title: "House line",
    body: "Est. in Darkness is a date, not a filter.",
    attribution: "House",
    href: "",
    enabled: true,
  },
  {
    slot: "excerpt",
    title: "From the cut",
    body: "Fine is a cut: craft before consensus, commerce as weather, the quiet tests that survive a name going blank. If it needs a costume to be believed, it does not make the night.",
    attribution: "What Makes Art Fine",
    href: "/journal/fine-art/what-makes-art-fine",
    enabled: true,
  },
  {
    slot: "literature",
    title: "Reading room",
    body: "On-site samples. No fake checkout.",
    attribution: "Library",
    href: "/library",
    enabled: true,
  },
];
