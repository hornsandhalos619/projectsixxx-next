import type { Metadata } from "next";
import { PolicyLinks } from "@/components/PolicyLinks";

export const metadata: Metadata = { title: "Policies" };

export default function LegalIndexPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Legal</p>
        <h1>Policies</h1>
      </header>
      <PolicyLinks />
    </div>
  );
}
