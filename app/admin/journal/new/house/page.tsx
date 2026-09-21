import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalEditorForm } from "@/components/JournalEditorForm";
import { canSeeJournalAdmin } from "@/config/roles";
import { todayIsoDate } from "@/lib/journal-io";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New house post" };

export default async function NewHouseJournalPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  return (
    <div className="shell">
      <header className="page-head journal-console-head">
        <p className="kicker">Journal console · House</p>
        <h1>New house post</h1>
        <p className="lede">
          Writes to <code>content/journal/&lt;shelf&gt;/&lt;slug&gt;.mdx</code>.
          Keep the post on draft until the cut is ready.
        </p>
      </header>
      <JournalEditorForm
        defaults={{
          lane: "house",
          author: "House",
          date: todayIsoDate(),
          category: "fine-art",
          status: "draft",
        }}
      />
    </div>
  );
}
