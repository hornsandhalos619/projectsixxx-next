import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalEditor } from "@/components/JournalEditor";
import { canSeeJournalAdmin } from "@/config/roles";
import { journalStoreLabel, journalWritesReady } from "@/lib/journal-store";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New house post" };
export const dynamic = "force-dynamic";

export default async function NewHousePostPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          <Link href="/admin/journal">Journal console</Link>
          {" · "}
          House
        </p>
        <h1>New house cut</h1>
        <p className="lede">
          Publishes to /journal/{"{shelf}"}/{"{slug}"} when you set the post live.
        </p>
      </header>
      <JournalEditor
        lane="house"
        mode="create"
        storeLabel={journalStoreLabel()}
        storeReady={journalWritesReady()}
        initial={{
          title: "",
          slug: "",
          body: "",
          date: new Date().toISOString().slice(0, 10),
          publishState: "draft",
          category: "fine-art",
          dek: "",
          excerpt: "",
          author: "House",
          kind: "house",
        }}
      />
    </div>
  );
}
