import { isBoardCategory } from "@/lib/board/categories";
import type { BoardDocument, BoardReplyRecord, BoardThreadRecord } from "@/lib/board/types";

export function emptyDocument(): BoardDocument {
  return { threads: [], replies: [] };
}

function asIso(value: unknown): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();
  const text = String(value ?? "").trim();
  const parsed = new Date(text);
  if (!text || Number.isNaN(parsed.getTime())) return new Date(0).toISOString();
  return parsed.toISOString();
}

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === "true" || value === "t";
}

export function asThread(value: unknown): BoardThreadRecord | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const category = String(row.category ?? "");
  if (!isBoardCategory(category)) return null;
  const id = String(row.id ?? "").trim();
  const title = String(row.title ?? "").trim();
  const body = String(row.body ?? "").trim();
  const authorAccountId = String(row.authorAccountId ?? row.author_account_id ?? "").trim();
  if (!id || !title || !body || !authorAccountId) return null;
  return {
    id,
    title,
    body,
    authorAccountId,
    category,
    createdAt: asIso(row.createdAt ?? row.created_at),
    pinned: asBool(row.pinned),
    locked: asBool(row.locked),
    hidden: asBool(row.hidden),
  };
}

export function asReply(value: unknown): BoardReplyRecord | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  const threadId = String(row.threadId ?? row.thread_id ?? "").trim();
  const body = String(row.body ?? "").trim();
  const authorAccountId = String(row.authorAccountId ?? row.author_account_id ?? "").trim();
  if (!id || !threadId || !body || !authorAccountId) return null;
  return {
    id,
    threadId,
    body,
    authorAccountId,
    createdAt: asIso(row.createdAt ?? row.created_at),
    hidden: asBool(row.hidden),
  };
}

export function asDocument(value: unknown): BoardDocument {
  if (!value || typeof value !== "object") return emptyDocument();
  const row = value as Record<string, unknown>;
  const threads = Array.isArray(row.threads)
    ? row.threads.map(asThread).filter((item): item is BoardThreadRecord => Boolean(item))
    : [];
  const replies = Array.isArray(row.replies)
    ? row.replies.map(asReply).filter((item): item is BoardReplyRecord => Boolean(item))
    : [];
  return { threads, replies };
}

export function countSinceDocument(
  doc: BoardDocument,
  authorAccountId: string,
  sinceIso: string,
): number {
  const since = new Date(sinceIso).getTime();
  const inWindow = (createdAt: string, authorId: string) =>
    authorId === authorAccountId && new Date(createdAt).getTime() >= since;
  return (
    doc.threads.filter((row) => inWindow(row.createdAt, row.authorAccountId)).length +
    doc.replies.filter((row) => inWindow(row.createdAt, row.authorAccountId)).length
  );
}

export function isMissingRelation(error: unknown): boolean {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : String(error ?? "");
  if (code === "42P01" || code === "PGRST205") return true;
  return /does not exist|schema cache|could not find the table/i.test(message);
}
