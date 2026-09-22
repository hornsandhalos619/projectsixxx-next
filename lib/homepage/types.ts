export const HOMEPAGE_SLOT_IDS = ["quote", "excerpt", "literature"] as const;
export type HomepageSlotId = (typeof HOMEPAGE_SLOT_IDS)[number];

export type HomepageSlot = {
  slot: HomepageSlotId;
  title: string;
  body: string;
  attribution: string;
  href: string;
  enabled: boolean;
};
