import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LibraryEditor } from "@/components/LibraryEditor";
import { canSeeLibraryAdmin } from "@/config/roles";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New library title" };
export const dynamic = "force-dynamic";

export default async function AdminLibraryNewPage() {
  const viewer = await getViewer();
  if (!canSeeLibraryAdmin(viewer.role)) notFound();
  const storage = detectLiveStore();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Library console</p>
        <h1>New title</h1>
        <p className="lede">Sample paragraphs only. No checkout.</p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/library">All titles</Link>
        {" · "}
        Storage: {storage.label}
      </p>
      <LibraryEditor writable={storage.writable} />
    </div>
  );
}
