import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSeeJournalAdmin } from "@/config/roles";
import { detectStorage, editHref, listJournalRecords, publicHref } from "@/lib/cms/store";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Journal console" };
export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  const storage = detectStorage();
  const posts = await listJournalRecords();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Journal console</p>
        <h1>Posts</h1>
        <p className="lede">
          Create, edit, and publish Overmind and house journal entries. Published
          posts appear on /overmind/journal and /journal.
        </p>
      </header>

      <div className="admin-note">
        <p>
          <strong>Storage:</strong> {storage.label}
        </p>
        <p className="muted">{storage.hint}</p>
      </div>

      <div className="cta-row" style={{ marginTop: "1.25rem" }}>
        <Link className="btn btn-house" href="/admin/journal/new">
          New entry
        </Link>
        <Link className="btn" href="/overmind/journal">
          Overmind shelf
        </Link>
        <Link className="btn" href="/journal">
          House shelves
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          No entries yet. Write the first cut.
        </p>
      ) : (
        <div className="journal-desk">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Stream</th>
                <th>Date</th>
                <th>Status</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const live = publicHref(post);
                return (
                  <tr key={`${post.stream}:${post.slug}`}>
                    <td>
                      <Link href={editHref(post)}>{post.title || post.slug}</Link>
                      <div className="muted">{post.slug}</div>
                    </td>
                    <td>
                      {post.stream}
                      {post.category ? ` · ${post.category}` : ""}
                    </td>
                    <td>{post.date}</td>
                    <td>
                      <span className={`badge-status badge-status--${post.status}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>
                      <Link href={editHref(post)}>Edit</Link>
                      {live ? (
                        <>
                          {" · "}
                          <Link href={live}>Live</Link>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
