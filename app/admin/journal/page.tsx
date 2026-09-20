import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canSeeJournalAdmin } from "@/config/roles";
import { allPosts } from "@/lib/journal";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Journal console" };

export default async function AdminJournalPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();
  const posts = allPosts();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Journal console</p>
        <h1>Posts</h1>
        <p className="lede">Add MDX under content/journal. This console does not invent a CMS yet.</p>
      </header>
      <ul className="muted">
        {posts.map((post) => (
          <li key={post.slug}>
            {post.title} · {post.category} · {post.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
