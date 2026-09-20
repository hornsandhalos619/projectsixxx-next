import type { Metadata } from "next";
import Link from "next/link";
import {
  canSeeHouseAdmin,
  canSeeJournalAdmin,
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
        <p className="lede">{viewer.email} · {viewer.role}</p>
      </header>
      <div className="grid-2">
        {canSeeJournalAdmin(viewer.role) ? (
          <Link className="card" href="/admin/journal">
            <h2>Journal</h2>
            <p className="muted">Blog Admin + Founder</p>
          </Link>
        ) : null}
        {canSeeShopAdmin(viewer.role) ? (
          <Link className="card" href="/admin/shop">
            <h2>Shop</h2>
            <p className="muted">Shop Admin + Founder</p>
          </Link>
        ) : null}
        {canSeeHouseAdmin(viewer.role) ? (
          <Link className="card" href="/admin/house">
            <h2>House</h2>
            <p className="muted">Founder only</p>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
