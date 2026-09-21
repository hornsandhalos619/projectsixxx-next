import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSeeJournalAdmin } from "@/config/roles";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New journal post" };
export const dynamic = "force-dynamic";

export default async function NewJournalChooserPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          <Link href="/admin/journal">Journal console</Link>
        </p>
        <h1>New cut</h1>
        <p className="lede">Choose the lane. Overmind stays on /overmind/journal.</p>
      </header>
      <div className="grid-2">
        <Link className="card" href="/admin/journal/new/overmind">
          <h2>Overmind</h2>
          <p className="muted">AI journal. Public path /overmind/journal.</p>
        </Link>
        <Link className="card" href="/admin/journal/new/house">
          <h2>House</h2>
          <p className="muted">Shelves under /journal.</p>
        </Link>
      </div>
    </div>
  );
}
