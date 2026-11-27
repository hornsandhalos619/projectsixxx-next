import type { Metadata } from "next";
import { shareMetadata } from "@/lib/seo";
import "./palace.css";

const title = "Palace of Wonders";
const description =
  "Walk the Palace of Wonders, the 3D house of Horns & Halos and Project SiXXX. Every piece in the palace links to the shop.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/palace", {
    title: `${title} — Project SiXXX`,
    description,
  }),
  robots: { index: false, follow: false },
};

export default async function PalacePage({
  searchParams,
}: {
  searchParams: Promise<{ hd?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.hd) ? params.hd[0] : params.hd;
  const src =
    raw === "1" || raw === "0"
      ? `/palace/index.html?hd=${raw}`
      : "/palace/index.html";
  return (
    <iframe
      className="palace-frame"
      src={src}
      title="Palace of Wonders"
    />
  );
}
