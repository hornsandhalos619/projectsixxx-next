import type { Metadata } from "next";
import Link from "next/link";
import {
  canSeeGalleryAdmin,
  canSeeHomepageAdmin,
  canSeeHouseAdmin,
  canSeeJournalAdmin,
  canSeeLibraryAdmin,
  canSeeShopAdmin,
} from "@/config/roles";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHubPage() {
  const viewer = await getViewer();
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Console</p>
        <h1>Admin</h1>
        <p className="lede">
          {viewer.name && viewer.name !== viewer.email ? `${viewer.name} · ` : ""}
          {viewer.email} · {viewer.role}
        </p>
      </header>
      <div className="grid-2">
        {canSeeJournalAdmin(viewer.role) ? (
          <Link className="card" href="/admin/journal">
            <h2>Journal</h2>
            <p className="muted">Create, edit, publish. House + Overmind lanes.</p>
          </Link>
        ) : null}
        {canSeeHomepageAdmin(viewer.role) ? (
          <Link className="card" href="/admin/homepage">
            <h2>Homepage</h2>
            <p className="muted">Quotes, excerpts, literature slots.</p>
          </Link>
        ) : null}
        {canSeeShopAdmin(viewer.role) ? (
          <Link className="card" href="/admin/shop">
            <h2>Shop</h2>
            <p className="muted">Affiliate products. Outbound rel=sponsored nofollow.</p>
          </Link>
        ) : null}
        {canSeeGalleryAdmin(viewer.role) ? (
          <Link className="card" href="/admin/gallery">
            <h2>Gallery</h2>
            <p className="muted">Artists, works, homepage features.</p>
          </Link>
        ) : null}
        {canSeeLibraryAdmin(viewer.role) ? (
          <Link className="card" href="/admin/library">
            <h2>Library</h2>
            <p className="muted">Titles, samples, homepage features.</p>
          </Link>
        ) : null}
        {canSeeHouseAdmin(viewer.role) ? (
          <Link className="card" href="/admin/house">
            <h2>House</h2>
            <p className="muted">Founder only. Grant Blog Admin and Shop Admin.</p>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
