"use client";

import { useActionState } from "react";
import { BOARD_CATEGORIES, type BoardCategory } from "@/lib/board/categories";
import { createThread, type BoardState } from "@/lib/board/actions";

const initial: BoardState = null;

export function BoardComposer({
  category,
  disabled = false,
}: {
  category?: BoardCategory;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(createThread, initial);
  const chosen = category ?? "great-hall";

  return (
    <form action={action} className="form board-form">
      <label>
        Hall
        <select name="category" defaultValue={chosen} disabled={disabled || pending}>
          {BOARD_CATEGORIES.map((hall) => (
            <option key={hall.slug} value={hall.slug}>
              {hall.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title
        <input name="title" required minLength={3} maxLength={120} disabled={disabled || pending} />
      </label>
      <label>
        Body
        <textarea name="body" required maxLength={4000} disabled={disabled || pending} />
      </label>
      <p className="muted">Plain text. A title runs 3–120 characters. The body stops at 4000.</p>
      {state && !state.ok ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="btn btn-house" type="submit" disabled={disabled || pending}>
        {pending ? "Setting the thread…" : "Open the thread"}
      </button>
    </form>
  );
}
