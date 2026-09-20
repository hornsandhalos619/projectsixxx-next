import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Web design",
  description: "House web design — haunting atmosphere over sterile IA.",
};

export default function WebDesignPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Services</p>
        <h1>Web design</h1>
        <p className="lede">
          Dual surface: night skin, corporate bones. Tokens, type, and routes
          that do not collapse into a template.
        </p>
      </header>
      <p className="muted">Shell for G3. Scope, rate, and timeline live on the schedule form — no fake checkout.</p>
      <div className="cta-row">
        <Link className="btn btn-house" href="/schedule">
          Schedule
        </Link>
        <Link className="btn" href="/contact">
          Contact
        </Link>
      </div>
    </div>
  );
}
