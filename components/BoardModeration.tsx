"use client";

import { useActionState } from "react";
import { moderateReply, moderateThread, type BoardState } from "@/lib/board/actions";

const initial: BoardState = null;

export function BoardThreadModeration({
  threadId,
  pinned,
  locked,
  hidden,
}: {
  threadId: string;
  pinned: boolean;
  locked: boolean;
  hidden: boolean;
}) {
  const [state, action, pending] = useActionState(moderateThread, initial);

  return (
    <form action={action} className="board-tools">
      <input type="hidden" name="threadId" value={threadId} />
      <button className="btn btn-silver" type="submit" name="intent" value={pinned ? "unpin" : "pin"} disabled={pending}>
        {pinned ? "Unpin" : "Pin"}
      </button>
      <button className="btn btn-house" type="submit" name="intent" value={locked ? "unlock" : "lock"} disabled={pending}>
        {locked ? "Unlock" : "Lock"}
      </button>
      <button className="btn" type="submit" name="intent" value={hidden ? "restore" : "hide"} disabled={pending}>
        {hidden ? "Restore" : "Hide"}
      </button>
      {state && !state.ok ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function BoardReplyModeration({
  threadId,
  replyId,
  hidden,
}: {
  threadId: string;
  replyId: string;
  hidden: boolean;
}) {
  const [state, action, pending] = useActionState(moderateReply, initial);

  return (
    <form action={action} className="board-tools">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="replyId" value={replyId} />
      <button className="btn" type="submit" name="intent" value={hidden ? "restore" : "hide"} disabled={pending}>
        {hidden ? "Restore reply" : "Hide reply"}
      </button>
      {state && !state.ok ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
