import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JournalEditorForm } from "@/components/JournalEditorForm";
import { canSeeJournalAdmin } from "@/config/roles";
import { todayIsoDate } from "@/lib/journal-io";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New Overmind post" };

export default async function NewOvermindJournalPage() {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  return (
    <div className="shell">
      <header className="page-head journal-console-head">
        <p className="kicker">Journal console · Overmind</p>
        <h1>New Overmind post</h1>
        <p className="lede">
          Writes to <code>content/overmind/journal/&lt;slug&gt;.mdx</code>. Author
          stays Overmind. Drafts do not list on{" "}
          <code>/overmind/journal</code>.
        </p>
      </header>
      <JournalEditorForm
        defaults={{
          lane: "overmind",
          date: todayIsoDate(),
          status: "draft",
        }}
      />
    </div>
  );
}
