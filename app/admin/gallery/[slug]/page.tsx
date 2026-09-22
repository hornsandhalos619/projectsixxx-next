import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtistDeleteButton, ArtistEditor } from "@/components/ArtistEditor";
import { canSeeGalleryAdmin } from "@/config/roles";
import { getArtist } from "@/lib/gallery/store";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Edit artist" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const viewer = await getViewer();
  if (!canSeeGalleryAdmin(viewer.role)) notFound();
  const { slug } = await params;
  const { saved } = await searchParams;
  const artist = await getArtist(slug);
  if (!artist) notFound();
  const storage = detectLiveStore();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Gallery console</p>
        <h1>{artist.name}</h1>
        <p className="lede">
          {artist.role} · {artist.status}
        </p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/gallery">All artists</Link>
        {" · "}
        <Link href={`/gallery/${artist.slug}`}>Live page</Link>
        {" · "}
        Storage: {storage.label}
      </p>
      <ArtistEditor artist={artist} writable={storage.writable} saved={saved === "1"} />
      <div className="section">
        <ArtistDeleteButton artist={artist} writable={storage.writable} />
      </div>
    </div>
  );
}
