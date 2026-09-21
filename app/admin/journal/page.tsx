import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SampleBadge } from "@/components/SampleBadge";
import { canSeeJournalAdmin } from "@/config/roles";
import { allPosts } from "@/lib/journal";
import { allOvermindPosts } from "@/lib/overmind-journal";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Journal console" };

function StatusMark({ status }: { status: "draft" | "published" }) {
  return (
    <span className={`journal-status journal-status--${status}`}>{status}</span>
  );
}

export default async function AdminJournalPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  const house = allPosts();
  const overmind = allOvermindPosts();

  return (
    <div className="shell">
      <header className="page-head journal-console-head">
        <p className="kicker">Journal console</p>
        <h1>Live journal</h1>
        <p className="lede">
          Draft and publish on the house shelves and the Overmind journal.
          Writes land as MDX under <code>content/journal</code> and{" "}
          <code>content/overmind/journal</code>. Drafts stay off the public
          routes.
        </p>
      </header>

      <div className="journal-console-lanes">
        <section className="journal-lane" aria-labelledby="house-lane">
          <div className="journal-lane-head">
            <div>
              <p className="kicker">House</p>
              <h2 id="house-lane">House journal</h2>
            </div>
            <Link className="btn btn-house" href="/admin/journal/new/house">
              New house
            </Link>
          </div>
          {house.length === 0 ? (
            <p className="muted">No house posts yet.</p>
          ) : (
            <ul className="journal-entry-list">
              {house.map((post) => (
                <li
                  key={`${post.category}/${post.slug}`}
                  className="journal-entry"
                >
                  <div>
                    <p className="kicker">
                      {post.category}
                      {post.sample ? (
                        <>
                          {" "}
                          <SampleBadge />
                        </>
                      ) : null}
                    </p>
                    <h3>
                      <Link
                        href={`/admin/journal/house/${post.category}/${post.slug}`}
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="muted">{post.date}</p>
                  </div>
                  <div className="journal-entry-meta">
                    <StatusMark status={post.status} />
                    {post.status === "published" ? (
                      <Link
                        className="journal-public-link"
                        href={`/journal/${post.category}/${post.slug}`}
                      >
                        Public
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="journal-lane" aria-labelledby="overmind-lane">
          <div className="journal-lane-head">
            <div>
              <p className="kicker">Overmind</p>
              <h2 id="overmind-lane">Overmind journal</h2>
            </div>
            <Link className="btn btn-silver" href="/admin/journal/new/overmind">
              New Overmind
            </Link>
          </div>
          {overmind.length === 0 ? (
            <p className="muted">No Overmind posts yet.</p>
          ) : (
            <ul className="journal-entry-list">
              {overmind.map((post) => (
                <li key={post.slug} className="journal-entry">
                  <div>
                    <p className="kicker">{post.date}</p>
                    <h3>
                      <Link href={`/admin/journal/overmind/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    {post.tags.length ? (
                      <p className="muted">{post.tags.join(" · ")}</p>
                    ) : null}
                  </div>
                  <div className="journal-entry-meta">
                    <StatusMark status={post.status} />
                    {post.status === "published" ? (
                      <Link
                        className="journal-public-link"
                        href={`/overmind/journal/${post.slug}`}
                      >
                        Public
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
