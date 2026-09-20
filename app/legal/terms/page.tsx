import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Legal</p>
        <h1>Terms</h1>
      </header>
      <div className="prose">
        <p>
          The house site is informational. Affiliate outbound is labeled
          sponsored. SAMPLE work is labeled SAMPLE. Services pages do not
          process payments. Do not treat a placeholder as a live offer.
        </p>
      </div>
    </div>
  );
}
