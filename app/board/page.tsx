import type { Metadata } from "next";
import Link from "next/link";
import { BOARD_CATEGORIES, isBoardCategory } from "@/lib/board/categories";
import { canSpeak } from "@/lib/board/access";
import { lookupUsernames } from "@/lib/house/accounts";
import {
  categoryTitle,
  formatBoardWhen,
  replyLabel,
  repliesForViewer,
  threadsForViewer,
} from "@/lib/board/present";
import { loadBoard } from "@/lib/board/store";
import { displayPlain } from "@/lib/board/text";
import { getViewer } from "@/lib/session";
import { shareMetadata } from "@/lib/seo";

const title = "Message board";
const description = "Open to read. A house key is required to speak.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/board", { title, description }),
};

export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ hall?: string }>;
}) {
  const [{ hall }, viewer, board] = await Promise.all([
    searchParams,
    getViewer(),
    loadBoard(),
  ]);
  const active = hall && isBoardCategory(hall) ? hall : null;
  const threads = threadsForViewer(board.threads, viewer.role, active);
  const names = await lookupUsernames(threads.map((thread) => thread.authorAccountId));
  const speakHref = active ? `/board/new?hall=${active}` : "/board/new";

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">The hall</p>
        <h1>Message board</h1>
        <p className="lede">The floor is open to read. A house key is required to speak.</p>
      </header>

      <BoardStatus board={board} />

      <nav className="board-halls" aria-label="Halls">
        {BOARD_CATEGORIES.map((item) => (
          <Link
            key={item.slug}
            className="card"
            href={active === item.slug ? "/board" : `/board?hall=${item.slug}`}
            aria-current={active === item.slug ? "page" : undefined}
          >
            <h2>{item.title}</h2>
            <p className="muted">{item.dek}</p>
          </Link>
        ))}
      </nav>

      <div className="board-floor-head">
        <div>
          <p className="kicker">{active ? categoryTitle(active) : "All halls"}</p>
          <h2>On the floor</h2>
        </div>
        {canSpeak(viewer.role) ? (
          <Link className="btn btn-house" href={speakHref}>
            Open a thread
          </Link>
        ) : (
          <Link className="btn btn-house" href={`/signin?callbackUrl=${encodeURIComponent(speakHref)}`}>
            Sign in to speak
          </Link>
        )}
      </div>

      {threads.length === 0 ? (
        <p className="muted">
          {active
            ? "Nothing rests in this hall yet."
            : "The hall is quiet. No threads rest on the floor."}
        </p>
      ) : (
        <ul className="board-list">
          {threads.map((thread) => {
            const replies = repliesForViewer(board.replies, thread.id, viewer.role).length;
            return (
              <li key={thread.id} className="board-thread">
                <p className="board-meta">
                  <span>{categoryTitle(thread.category)}</span>
                  {thread.pinned ? <span className="board-pin">Pinned</span> : null}
                  {thread.locked ? <span className="board-seal">Locked</span> : null}
                  {thread.hidden ? <span className="board-hold">Hidden</span> : null}
                </p>
                <h3>
                  <Link href={`/board/${thread.id}`}>{displayPlain(thread.title)}</Link>
                </h3>
                <p className="board-meta">
                  <span>{names.get(thread.authorAccountId) ?? "Member"}</span>
                  <span>{formatBoardWhen(thread.createdAt)}</span>
                  <span>{replyLabel(replies)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function BoardStatus({
  board,
}: {
  board: { configured: boolean; missing: boolean; unreadable: boolean };
}) {
  if (!board.configured) {
    return (
      <p className="admin-banner board-note" role="status">
        This host has no hall ledger yet. The floor stays empty.
      </p>
    );
  }
  if (board.missing) {
    return (
      <p className="admin-banner board-note" role="status">
        The hall ledger is not seated yet. The floor stays empty until the house applies the board migration.
      </p>
    );
  }
  if (board.unreadable) {
    return (
      <p className="admin-banner admin-banner--err board-note" role="status">
        The hall could not be read. The floor stays empty for now.
      </p>
    );
  }
  return null;
}
