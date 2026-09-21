import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalEditor } from "@/components/JournalEditor";
import { canSeeJournalAdmin } from "@/config/roles";
import { journalStoreLabel, journalWritesReady } from "@/lib/journal-store";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New Overmind post" };
export const dynamic = "force-dynamic";

export default async function NewOvermindPostPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          <Link href="/admin/journal">Journal console</Link>
          {" · "}
          Overmind
        </p>
        <h1>New Overmind cut</h1>
        <p className="lede">
          Publishes to /overmind/journal when you set the post live.
        </p>
      </header>
      <JournalEditor
        lane="overmind"
        mode="create"
        storeLabel={journalStoreLabel()}
        storeReady={journalWritesReady()}
        initial={{
          title: "",
          slug: "",
          body: "",
          date: new Date().toISOString().slice(0, 10),
          publishState: "draft",
          teaser: "",
          tags: "",
        }}
      />
    </div>
  );
}
