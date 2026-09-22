import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSeeGalleryAdmin } from "@/config/roles";
import { isFeaturedArtist } from "@/lib/artists";
import { listArtists } from "@/lib/gallery/store";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Gallery console" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const viewer = await getViewer();
  if (!canSeeGalleryAdmin(viewer.role)) notFound();
  const storage = detectLiveStore();
  const roster = await listArtists();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Gallery console</p>
        <h1>Roster</h1>
        <p className="lede">
          Artists, works, and homepage features. Seed roster in lib/artists.ts
          stays. Desk writes overlay that store.
        </p>
      </header>
      <div className="admin-note">
        <p>
          <strong>Storage:</strong> {storage.label}
        </p>
        <p className="muted">{storage.hint}</p>
      </div>
      <div className="cta-row" style={{ marginTop: "1.25rem" }}>
        <Link className="btn btn-house" href="/admin/gallery/new">
          New artist
        </Link>
        <Link className="btn" href="/gallery">
          Public gallery
        </Link>
      </div>
      <div className="journal-desk">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Home</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((artist) => (
              <tr key={artist.slug}>
                <td>
                  <Link href={`/admin/gallery/${artist.slug}`}>{artist.name}</Link>
                  <div className="muted">{artist.slug}</div>
                </td>
                <td>{artist.role}</td>
                <td>{artist.status}</td>
                <td>{isFeaturedArtist(artist) ? "Featured" : "—"}</td>
                <td>
                  <Link href={`/admin/gallery/${artist.slug}`}>Edit</Link>
                  {" · "}
                  <Link href={`/gallery/${artist.slug}`}>Live</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
