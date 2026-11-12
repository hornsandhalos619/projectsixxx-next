import type { Metadata } from "next";
import { palace } from "@/config/palace";
import { shareMetadata } from "@/lib/seo";
import "../styles/palace.css";

export const metadata: Metadata = {
  title: palace.title,
  description: palace.blurb,
  ...shareMetadata("/palace", {
    title: `${palace.title} — Project SiXXX`,
    description: palace.blurb,
  }),
};

export default function PalaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="palace-layout">{children}</div>;
}
