import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agentic bots",
  description: "Constrained agents. House rules. No unauthorized-access theater.",
};

export default function AgenticBotsPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Services</p>
        <h1>Agentic bots</h1>
        <p className="lede">
          Agents that read, draft, and file. They do not pick locks. Research
          on this house means public-source literacy — never exploit how-tos.
        </p>
      </header>
      <div className="cta-row">
        <Link className="btn btn-house" href="/schedule">
          Schedule
        </Link>
      </div>
    </div>
  );
}
