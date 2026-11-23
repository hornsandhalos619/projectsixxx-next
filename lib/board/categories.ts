export const BOARD_CATEGORIES = [
  {
    slug: "great-hall",
    title: "The Great Hall",
    dek: "General talk beneath the vault.",
  },
  {
    slug: "gallery-art",
    title: "Gallery & Art",
    dek: "Frames, marks, and the work on the wall.",
  },
  {
    slug: "forge",
    title: "The Forge",
    dek: "Music, sound, and what the house is making.",
  },
  {
    slug: "shop-releases",
    title: "Shop & Releases",
    dek: "Drops, editions, and what leaves the door.",
  },
] as const;

export type BoardCategory = (typeof BOARD_CATEGORIES)[number]["slug"];

export function isBoardCategory(value: string): value is BoardCategory {
  return BOARD_CATEGORIES.some((hall) => hall.slug === value);
}

export function boardCategory(slug: string) {
  return BOARD_CATEGORIES.find((hall) => hall.slug === slug) ?? null;
}
