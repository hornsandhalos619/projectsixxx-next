import type { Metadata } from "next";
import Link from "next/link";
import { SampleBadge } from "@/components/SampleBadge";

export const metadata: Metadata = {
  title: "B2B",
  description: "B2B engagements. SAMPLE labels: Abacus Films, Oakwood-Residential.",
};

export default function B2BPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Services</p>
        <h1>B2B</h1>
        <p className="lede">Quiet work for companies that do not need a carnival.</p>
      </header>
      <div className="grid-2">
        <article className="card">
          <SampleBadge />
          <h2>Abacus Films</h2>
          <p className="muted">SAMPLE engagement label. Production house, night-side tooling.</p>
        </article>
        <article className="card">
          <SampleBadge />
          <h2>Oakwood-Residential</h2>
          <p className="muted">SAMPLE engagement label. Residential operations, sterile IA.</p>
        </article>
      </div>
      <div className="cta-row">
        <Link className="btn btn-house" href="/schedule">
          Schedule
        </Link>
      </div>
    </div>
  );
}
