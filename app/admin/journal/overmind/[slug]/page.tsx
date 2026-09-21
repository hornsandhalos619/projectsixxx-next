import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalEditor } from "@/components/JournalEditor";
import { canSeeJournalAdmin } from "@/config/roles";
import { getOvermindPost } from "@/lib/overmind-journal";
import { journalStoreLabel, journalWritesReady } from "@/lib/journal-store";
import { getViewer } from "@/lib/session";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> };

export const metadata: Metadata = { title: "Edit Overmind post" };
export const dynamic = "force-dynamic";

export default async function EditOvermindPostPage({ params, searchParams }: Props) {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();
  const { slug } = await params;
  const { saved } = await searchParams;
  const post = await getOvermindPost(slug, { includeDrafts: true });
  if (!post) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          <Link href="/admin/journal">Journal console</Link>
          {" · "}
          Overmind
        </p>
        <h1>{post.title}</h1>
        <p className="lede">
          Public URL:{" "}
          <Link href={`/overmind/journal/${post.slug}`}>/overmind/journal/{post.slug}</Link>
        </p>
        {saved ? <p className="muted">Held in the ledger.</p> : null}
      </header>
      <JournalEditor
        lane="overmind"
        mode="edit"
        storeLabel={journalStoreLabel()}
        storeReady={journalWritesReady()}
        initial={{
          title: post.title,
          slug: post.slug,
          body: post.content,
          date: post.date,
          publishState: post.status,
          teaser: post.teaser,
          tags: post.tags.join(", "),
        }}
      />
    </div>
  );
}
