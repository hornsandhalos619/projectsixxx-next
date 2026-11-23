import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BoardComposer } from "@/components/BoardComposer";
import { canSpeak } from "@/lib/board/access";
import { isBoardCategory } from "@/lib/board/categories";
import { loadBoard } from "@/lib/board/store";
import { getViewer } from "@/lib/session";
import { shareMetadata } from "@/lib/seo";

const title = "Open a thread";
const description = "Plain words on the house floor. A house key is required.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/board/new", { title, description }),
};

export const dynamic = "force-dynamic";

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ hall?: string }>;
}) {
  const [{ hall }, viewer, board] = await Promise.all([
    searchParams,
    getViewer(),
    loadBoard(),
  ]);
  const next = hall && isBoardCategory(hall) ? `/board/new?hall=${hall}` : "/board/new";
  if (!canSpeak(viewer.role)) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(next)}`);
  }

  const category = hall && isBoardCategory(hall) ? hall : undefined;
  const blocked = !board.configured || board.missing;

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Speak</p>
        <h1>Open a thread</h1>
        <p className="lede">Plain words only. The hall does not take markup.</p>
      </header>

      {blocked ? (
        <p className="admin-banner board-note" role="status">
          {board.missing
            ? "The hall ledger is not seated yet. Speaking waits on the house migration."
            : "This host has no hall ledger yet."}
        </p>
      ) : null}
      {board.unreadable ? (
        <p className="admin-banner admin-banner--err board-note" role="status">
          The hall could not be read. Try again in a moment.
        </p>
      ) : null}

      <BoardComposer category={category} disabled={blocked} />

      <div className="cta-row">
        <Link className="btn" href="/board">
          Back to the floor
        </Link>
      </div>
    </div>
  );
}
