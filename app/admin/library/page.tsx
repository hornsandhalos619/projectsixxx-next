import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSeeLibraryAdmin } from "@/config/roles";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";
import { listLibraryTitles } from "@/lib/titles/store";

export const metadata: Metadata = { title: "Library console" };
export const dynamic = "force-dynamic";

export default async function AdminLibraryPage() {
  const viewer = await getViewer();
  if (!canSeeLibraryAdmin(viewer.role)) notFound();
  const storage = detectLiveStore();
  const titles = await listLibraryTitles();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Library console</p>
        <h1>Titles</h1>
        <p className="lede">
          On-site samples. No Stripe. Seed titles in lib/library.ts stay.
        </p>
      </header>
      <div className="admin-note">
        <p>
          <strong>Storage:</strong> {storage.label}
        </p>
        <p className="muted">{storage.hint}</p>
      </div>
      <div className="cta-row" style={{ marginTop: "1.25rem" }}>
        <Link className="btn btn-house" href="/admin/library/new">
          New title
        </Link>
        <Link className="btn" href="/library">
          Public library
        </Link>
      </div>
      <div className="journal-desk">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Home</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {titles.map((work) => (
              <tr key={work.slug}>
                <td>
                  <Link href={`/admin/library/${work.slug}`}>{work.title}</Link>
                  <div className="muted">{work.slug}</div>
                </td>
                <td>{work.status}</td>
                <td>{work.featured ? "Featured" : "—"}</td>
                <td>
                  <Link href={`/admin/library/${work.slug}`}>Edit</Link>
                  {" · "}
                  <Link href={`/library/${work.slug}`}>Live</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
