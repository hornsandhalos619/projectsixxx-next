"use client";

import { useActionState } from "react";
import { createReply, type BoardState } from "@/lib/board/actions";

const initial: BoardState = null;

export function BoardReplyForm({ threadId }: { threadId: string }) {
  const [state, action, pending] = useActionState(createReply, initial);

  return (
    <form action={action} className="form board-form">
      <input type="hidden" name="threadId" value={threadId} />
      <label>
        Reply
        <textarea name="body" required maxLength={2000} disabled={pending} />
      </label>
      <p className="muted">Plain text. A reply stops at 2000 characters.</p>
      {state && !state.ok ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="btn btn-house" type="submit" disabled={pending}>
        {pending ? "Speaking…" : "Leave a reply"}
      </button>
    </form>
  );
}
