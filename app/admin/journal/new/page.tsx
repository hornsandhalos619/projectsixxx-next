import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalEditor } from "@/components/JournalEditor";
import { canSeeJournalAdmin } from "@/config/roles";
import { detectStorage } from "@/lib/cms/store";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New journal entry" };
export const dynamic = "force-dynamic";

export default async function AdminJournalNewPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();
  const storage = detectStorage();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Journal console</p>
        <h1>New entry</h1>
        <p className="lede">
          Title, slug, date, excerpt, and body. Publish to the Overmind shelf or a
          house journal category.
        </p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/journal">All posts</Link>
        {" · "}
        Storage: {storage.label}
      </p>
      <JournalEditor writable={storage.writable} />
    </div>
  );
}
