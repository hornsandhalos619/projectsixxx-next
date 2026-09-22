import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LibraryDeleteButton, LibraryEditor } from "@/components/LibraryEditor";
import { canSeeLibraryAdmin } from "@/config/roles";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";
import { getLibraryTitle } from "@/lib/titles/store";

export const metadata: Metadata = { title: "Edit library title" };
export const dynamic = "force-dynamic";

export default async function AdminLibraryEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const viewer = await getViewer();
  if (!canSeeLibraryAdmin(viewer.role)) notFound();
  const { slug } = await params;
  const { saved } = await searchParams;
  const work = await getLibraryTitle(slug);
  if (!work) notFound();
  const storage = detectLiveStore();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Library console</p>
        <h1>{work.title}</h1>
        <p className="lede">
          {work.author} · {work.year}
        </p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/library">All titles</Link>
        {" · "}
        <Link href={`/library/${work.slug}`}>Live page</Link>
        {" · "}
        Storage: {storage.label}
      </p>
      <LibraryEditor work={work} writable={storage.writable} saved={saved === "1"} />
      <div className="section">
        <LibraryDeleteButton work={work} writable={storage.writable} />
      </div>
    </div>
  );
}
