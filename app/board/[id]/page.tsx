import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardReplyForm } from "@/components/BoardReplyForm";
import { BoardReplyModeration, BoardThreadModeration } from "@/components/BoardModeration";
import { BoardText } from "@/components/BoardText";
import { canModerate, canSpeak } from "@/lib/board/access";
import { categoryTitle, formatBoardWhen, repliesForViewer } from "@/lib/board/present";
import { loadBoard } from "@/lib/board/store";
import { displayPlain, isUuid } from "@/lib/board/text";
import { lookupUsernames } from "@/lib/house/accounts";
import { getViewer } from "@/lib/session";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Message board" };
  const [viewer, board] = await Promise.all([getViewer(), loadBoard()]);
  const thread = board.threads.find((row) => row.id === id);
  if (!thread || (thread.hidden && !canModerate(viewer.role))) {
    return { title: "Message board" };
  }
  const description = displayPlain(thread.body).replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    title: displayPlain(thread.title),
    description,
    ...shareMetadata(`/board/${id}`, {
      title: displayPlain(thread.title),
      description,
      type: "article",
    }),
  };
}

export default async function BoardThreadPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [viewer, board] = await Promise.all([getViewer(), loadBoard()]);
  const thread = board.threads.find((row) => row.id === id);
  if (!thread || (thread.hidden && !canModerate(viewer.role))) notFound();

  const replies = repliesForViewer(board.replies, thread.id, viewer.role);
  const names = await lookupUsernames([
    thread.authorAccountId,
    ...replies.map((reply) => reply.authorAccountId),
  ]);
  const author = names.get(thread.authorAccountId) ?? "Member";
  const speak = canSpeak(viewer.role);
  const founder = canModerate(viewer.role);

  return (
    <article className="shell">
      <header className="page-head">
        <p className="kicker">
          <Link href={`/board?hall=${thread.category}`}>{categoryTitle(thread.category)}</Link>
        </p>
        <h1>{displayPlain(thread.title)}</h1>
        <p className="board-meta">
          <span>{author}</span>
          <span>{formatBoardWhen(thread.createdAt)}</span>
          {thread.pinned ? <span className="board-pin">Pinned</span> : null}
          {thread.locked ? <span className="board-seal">Locked</span> : null}
          {thread.hidden ? <span className="board-hold">Hidden</span> : null}
        </p>
      </header>

      {thread.hidden ? (
        <p className="admin-banner board-note" role="status">
          Held off the floor. Only the Founder can see this.
        </p>
      ) : null}

      <BoardText text={thread.body} />

      {founder ? (
        <BoardThreadModeration
          threadId={thread.id}
          pinned={thread.pinned}
          locked={thread.locked}
          hidden={thread.hidden}
        />
      ) : null}

      <section className="board-replies" aria-label="Replies">
        <h2>Replies</h2>
        {replies.length === 0 ? (
          <p className="muted">No one has answered yet.</p>
        ) : (
          <ol className="board-list">
            {replies.map((reply) => (
              <li key={reply.id} className="board-reply">
                <h3>{names.get(reply.authorAccountId) ?? "Member"}</h3>
                <p className="board-meta">
                  <span>{formatBoardWhen(reply.createdAt)}</span>
                  {reply.hidden ? <span className="board-hold">Hidden</span> : null}
                </p>
                <BoardText text={reply.body} />
                {founder ? (
                  <BoardReplyModeration threadId={thread.id} replyId={reply.id} hidden={reply.hidden} />
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="board-replies" aria-label="Speak">
        {thread.locked ? (
          <p className="muted">This thread is locked. No further replies.</p>
        ) : speak ? (
          <BoardReplyForm threadId={thread.id} />
        ) : (
          <p className="muted">
            <Link href={`/signin?callbackUrl=${encodeURIComponent(`/board/${thread.id}`)}`}>
              Sign in with a house key
            </Link>{" "}
            to answer.
          </p>
        )}
      </section>

      <div className="cta-row">
        <Link className="btn" href="/board">
          All halls
        </Link>
      </div>
    </article>
  );
}
