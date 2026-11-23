import type { ViewerRole } from "@/config/roles";
import { boardCategory, isBoardCategory } from "@/lib/board/categories";
import { canModerate } from "@/lib/board/access";
import type { BoardReplyRecord, BoardThreadRecord } from "@/lib/board/types";

export function sortThreads(threads: BoardThreadRecord[]): BoardThreadRecord[] {
  return [...threads].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const byTime = b.createdAt.localeCompare(a.createdAt);
    if (byTime !== 0) return byTime;
    return a.id.localeCompare(b.id);
  });
}

export function threadsForViewer(
  threads: BoardThreadRecord[],
  role: ViewerRole,
  hall?: string | null,
): BoardThreadRecord[] {
  const category = hall && isBoardCategory(hall) ? hall : null;
  return sortThreads(
    threads.filter((thread) => {
      if (thread.hidden && !canModerate(role)) return false;
      if (category && thread.category !== category) return false;
      return true;
    }),
  );
}

export function repliesForViewer(
  replies: BoardReplyRecord[],
  threadId: string,
  role: ViewerRole,
): BoardReplyRecord[] {
  return replies
    .filter((reply) => reply.threadId === threadId && (!reply.hidden || canModerate(role)))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export function replyLabel(count: number): string {
  if (count === 0) return "No replies";
  if (count === 1) return "1 reply";
  return `${count} replies`;
}

export function categoryTitle(slug: string): string {
  return boardCategory(slug)?.title ?? "Hall";
}

export function formatBoardWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
  }).format(date);
  return `${formatted} UTC`;
}

export function threadSummary(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= 160) return flat;
  return `${flat.slice(0, 157)}…`;
}
