import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalEditorForm } from "@/components/JournalEditorForm";
import { canSeeJournalAdmin } from "@/config/roles";
import { getPost, isJournalCategory } from "@/lib/journal";
import { getViewer } from "@/lib/session";

type Props = { params: Promise<{ category: string; slug: string }> };

export const metadata: Metadata = { title: "Edit house post" };

export default async function EditHouseJournalPage({ params }: Props) {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  const { category, slug } = await params;
  if (!isJournalCategory(category)) notFound();
  const post = getPost(category, slug);
  if (!post) notFound();

  return (
    <div className="shell">
      <header className="page-head journal-console-head">
        <p className="kicker">Journal console · House · {post.category}</p>
        <h1>Edit house post</h1>
        <p className="lede">
          {post.status === "published"
            ? "This cut is live on the house journal."
            : "This cut is a draft. The public shelf will not list it."}
        </p>
      </header>
      <JournalEditorForm
        defaults={{
          lane: "house",
          title: post.title,
          dek: post.dek,
          excerpt: post.excerpt,
          author: post.author,
          date: post.date,
          category: post.category,
          slug: post.slug,
          status: post.status,
          content: post.content,
          sample: post.sample,
          previousCategory: post.category,
          previousSlug: post.slug,
        }}
      />
    </div>
  );
}
