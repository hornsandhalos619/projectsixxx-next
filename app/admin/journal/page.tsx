import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSeeJournalAdmin } from "@/config/roles";
import { allPosts } from "@/lib/journal";
import { allOvermindPosts } from "@/lib/overmind-journal";
import { getViewer } from "@/lib/session";
import { journalStoreLabel, journalWritesReady } from "@/lib/journal-store";

export const metadata: Metadata = { title: "Journal console" };
export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  const [house, overmind] = await Promise.all([
    allPosts({ includeDrafts: true }),
    allOvermindPosts({ includeDrafts: true }),
  ]);
  const storeReady = journalWritesReady();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Journal console</p>
        <h1>Posts</h1>
        <p className="lede">
          Create, edit, and publish from this desk. Drafts remain here. Published
          cuts appear on the public Overmind and house indexes.
        </p>
      </header>

      <div className="admin-note journal-store-banner">
        <p>
          Signed in as {viewer.email}. Ledger: {journalStoreLabel()}.
        </p>
        {!storeReady ? (
          <p className="muted">
            Set BLOB_READ_WRITE_TOKEN on the Vercel project to persist writes in
            production.
          </p>
        ) : null}
      </div>

      <div className="cta-row">
        <Link className="btn btn-house" href="/admin/journal/new">
          New cut
        </Link>
        <Link className="btn" href="/admin/journal/new/overmind">
          New Overmind
        </Link>
        <Link className="btn" href="/admin/journal/new/house">
          New house cut
        </Link>
      </div>

      <section className="section">
        <p className="kicker">Overmind</p>
        <h2>AI journal</h2>
        <p className="muted">Public path stays /overmind/journal.</p>
        <ul className="journal-admin-list">
          {overmind.map((post) => (
            <li key={post.slug}>
              <Link href={`/admin/journal/overmind/${post.slug}`}>
                <span>{post.title}</span>
                <span className={`status-pill status-pill--${post.status}`}>
                  {post.status}
                </span>
              </Link>
              <p className="muted">
                {post.date} · {post.slug}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <p className="kicker">House</p>
        <h2>Shelves</h2>
        <ul className="journal-admin-list">
          {house.map((post) => (
            <li key={`${post.category}/${post.slug}`}>
              <Link href={`/admin/journal/house/${post.category}/${post.slug}`}>
                <span>{post.title}</span>
                <span className={`status-pill status-pill--${post.visibility}`}>
                  {post.visibility}
                </span>
              </Link>
              <p className="muted">
                {post.date} · {post.category} · {post.status}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
