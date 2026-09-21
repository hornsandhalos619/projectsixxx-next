import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalEditor } from "@/components/JournalEditor";
import { canSeeJournalAdmin } from "@/config/roles";
import { getPost, isJournalCategory } from "@/lib/journal";
import { journalStoreLabel, journalWritesReady } from "@/lib/journal-store";
import { getViewer } from "@/lib/session";

type Props = {
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export const metadata: Metadata = { title: "Edit house post" };
export const dynamic = "force-dynamic";

export default async function EditHousePostPage({ params, searchParams }: Props) {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();
  const { category, slug } = await params;
  const { saved } = await searchParams;
  if (!isJournalCategory(category)) notFound();
  const post = await getPost(category, slug, { includeDrafts: true });
  if (!post) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          <Link href="/admin/journal">Journal console</Link>
          {" · "}
          House
        </p>
        <h1>{post.title}</h1>
        <p className="lede">
          Public URL:{" "}
          <Link href={`/journal/${post.category}/${post.slug}`}>
            /journal/{post.category}/{post.slug}
          </Link>
        </p>
        {saved ? <p className="muted">Held in the ledger.</p> : null}
      </header>
      <JournalEditor
        lane="house"
        mode="edit"
        storeLabel={journalStoreLabel()}
        storeReady={journalWritesReady()}
        initial={{
          title: post.title,
          slug: post.slug,
          body: post.content,
          date: post.date,
          publishState: post.visibility,
          category: post.category,
          dek: post.dek,
          excerpt: post.excerpt,
          author: post.author,
          kind: post.status,
        }}
      />
    </div>
  );
}
