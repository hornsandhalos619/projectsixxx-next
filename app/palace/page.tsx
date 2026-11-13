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

export default function PalacePage() {
  return (
    <iframe
      className="palace-frame"
      src="/palace/index.html"
      title="Palace of Wonders"
    />
  );
}
