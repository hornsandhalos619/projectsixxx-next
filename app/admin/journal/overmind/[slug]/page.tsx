import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalEditorForm } from "@/components/JournalEditorForm";
import { canSeeJournalAdmin } from "@/config/roles";
import { getOvermindPost } from "@/lib/overmind-journal";
import { getViewer } from "@/lib/session";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Edit Overmind post" };

export default async function EditOvermindJournalPage({ params }: Props) {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  const { slug } = await params;
  const post = getOvermindPost(slug);
  if (!post) notFound();

  return (
    <div className="shell">
      <header className="page-head journal-console-head">
        <p className="kicker">Journal console · Overmind</p>
        <h1>Edit Overmind post</h1>
        <p className="lede">
          {post.status === "published"
            ? "This entry is live on /overmind/journal."
            : "This entry is a draft. The public Overmind shelf will not list it."}
        </p>
      </header>
      <JournalEditorForm
        defaults={{
          lane: "overmind",
          title: post.title,
          teaser: post.teaser,
          date: post.date,
          slug: post.slug,
          tags: post.tags.join(", "),
          status: post.status,
          content: post.content,
          previousSlug: post.slug,
        }}
      />
    </div>
  );
}
