import type { Metadata } from "next";
import { shareMetadata } from "@/lib/seo";
import "./palace-game.css";

const title = "Palace game";
const description =
  "Walk the Palace of Wonders: the Entrance Hall and Great Hall of Horns & Halos. Every piece on display links to the shop.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/palace-game", {
    title: `${title} — Project SiXXX`,
    description,
  }),
  robots: { index: false, follow: false },
};

export default async function PalaceGamePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value)) for (const item of value) query.append(key, item);
  }
  const src = query.size
    ? `/palace-game/index.html?${query.toString()}`
    : "/palace-game/index.html";
  return (
    <iframe
      className="palace-game-frame"
      src={src}
      title="Palace of Wonders game"
    />
  );
}
