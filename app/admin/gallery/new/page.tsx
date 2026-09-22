import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtistEditor } from "@/components/ArtistEditor";
import { canSeeGalleryAdmin } from "@/config/roles";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New artist" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryNewPage() {
  const viewer = await getViewer();
  if (!canSeeGalleryAdmin(viewer.role)) notFound();
  const storage = detectLiveStore();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Gallery console</p>
        <h1>New artist</h1>
        <p className="lede">Attribution only. No invented personal history.</p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/gallery">All artists</Link>
        {" · "}
        Storage: {storage.label}
      </p>
      <ArtistEditor writable={storage.writable} />
    </div>
  );
}
