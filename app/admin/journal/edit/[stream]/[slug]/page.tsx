import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalDeleteButton, JournalEditor } from "@/components/JournalEditor";
import { canSeeJournalAdmin } from "@/config/roles";
import { detectStorage, getJournalRecord, publicHref } from "@/lib/cms/store";
import { isJournalStream } from "@/lib/cms/types";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Edit journal entry" };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ stream: string; slug: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminJournalEditPage({ params, searchParams }: Props) {
  const viewer = await getViewer();
  if (!canSeeJournalAdmin(viewer.role)) notFound();

  const { stream, slug } = await params;
  const { saved } = await searchParams;
  if (!isJournalStream(stream)) notFound();

  const record = await getJournalRecord(stream, slug);
  if (!record) notFound();

  const storage = detectStorage();
  const live = publicHref(record);

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Journal console</p>
        <h1>{record.title}</h1>
        <p className="lede">
          {record.stream}
          {record.category ? ` · ${record.category}` : ""} · {record.status}
        </p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/journal">All posts</Link>
        {live ? (
          <>
            {" · "}
            <Link href={live}>Live page</Link>
          </>
        ) : null}
        {" · "}
        Storage: {storage.label}
      </p>
      <JournalEditor record={record} writable={storage.writable} saved={saved === "1"} />
      <div className="section">
        <JournalDeleteButton record={record} writable={storage.writable} />
      </div>
    </div>
  );
}
