import { canModerate, canSpeak } from "@/lib/board/access";
import { boardCopy, RATE_LIMIT, RATE_WINDOW_MS } from "@/lib/board/copy";
import { boardRateGate, type RateGate } from "@/lib/board/rate";
import { isUuid, validateCategory, validateReplyBody, validateTitle, validateThreadBody } from "@/lib/board/text";
import { BoardTablesMissingError, type BoardStore } from "@/lib/board/types";
import type { ViewerRole } from "@/config/roles";

export type BoardResult = { ok: true; id: string } | { ok: false; error: string };

const THREAD_INTENTS = ["pin", "unpin", "lock", "unlock", "hide", "restore"] as const;
const REPLY_INTENTS = ["hide", "restore"] as const;

type ThreadIntent = (typeof THREAD_INTENTS)[number];
type ReplyIntent = (typeof REPLY_INTENTS)[number];

function isThreadIntent(value: string): value is ThreadIntent {
  return (THREAD_INTENTS as readonly string[]).includes(value);
}

function isReplyIntent(value: string): value is ReplyIntent {
  return (REPLY_INTENTS as readonly string[]).includes(value);
}

async function reserve(
  store: BoardStore,
  accountId: string,
  now: number,
  gate: RateGate,
): Promise<{ ok: false; error: string } | null> {
  let recent = 0;
  try {
    recent = await store.countSince(accountId, new Date(now - RATE_WINDOW_MS).toISOString());
  } catch (error) {
    if (error instanceof BoardTablesMissingError) return { ok: false, error: boardCopy.unseated };
    console.error("board rate read failed", error instanceof Error ? error.message : "unknown");
    return { ok: false, error: boardCopy.keepFailed };
  }
  if (recent >= RATE_LIMIT || !gate.allow(accountId, now)) {
    return { ok: false, error: boardCopy.slowDown };
  }
  return null;
}

function failure(error: unknown, gate: RateGate, accountId: string): { ok: false; error: string } {
  gate.release(accountId);
  if (error instanceof BoardTablesMissingError) return { ok: false, error: boardCopy.unseated };
  console.error("board write failed", error instanceof Error ? error.message : "unknown");
  return { ok: false, error: boardCopy.keepFailed };
}

export async function submitThread(input: {
  store: BoardStore;
  accountId: string;
  role: ViewerRole;
  title: string;
  body: string;
  category: string;
  now?: number;
  gate?: RateGate;
}): Promise<BoardResult> {
  if (!canSpeak(input.role)) return { ok: false, error: boardCopy.signIn };
  const category = validateCategory(input.category);
  if (!category.ok) return category;
  const title = validateTitle(input.title);
  if (!title.ok) return title;
  const body = validateThreadBody(input.body);
  if (!body.ok) return body;

  const now = input.now ?? Date.now();
  const gate = input.gate ?? boardRateGate;
  const limited = await reserve(input.store, input.accountId, now, gate);
  if (limited) return limited;

  const id = crypto.randomUUID();
  try {
    await input.store.insertThread({
      id,
      title: title.value,
      body: body.value,
      authorAccountId: input.accountId,
      category: category.value,
      createdAt: new Date(now).toISOString(),
      pinned: false,
      locked: false,
      hidden: false,
    });
  } catch (error) {
    return failure(error, gate, input.accountId);
  }
  return { ok: true, id };
}

export async function submitReply(input: {
  store: BoardStore;
  accountId: string;
  role: ViewerRole;
  threadId: string;
  body: string;
  now?: number;
  gate?: RateGate;
}): Promise<BoardResult> {
  if (!canSpeak(input.role)) return { ok: false, error: boardCopy.signIn };
  if (!isUuid(input.threadId)) return { ok: false, error: boardCopy.missingThread };
  const body = validateReplyBody(input.body);
  if (!body.ok) return body;

  let thread;
  try {
    const read = await input.store.read();
    if (read.missing) return { ok: false, error: boardCopy.unseated };
    if (read.unreadable) return { ok: false, error: boardCopy.keepFailed };
    thread = read.threads.find((row) => row.id === input.threadId) ?? null;
  } catch (error) {
    if (error instanceof BoardTablesMissingError) return { ok: false, error: boardCopy.unseated };
    console.error("board thread read failed", error instanceof Error ? error.message : "unknown");
    return { ok: false, error: boardCopy.keepFailed };
  }

  if (!thread || (thread.hidden && !canModerate(input.role))) {
    return { ok: false, error: boardCopy.missingThread };
  }
  if (thread.locked) return { ok: false, error: boardCopy.sealed };

  const now = input.now ?? Date.now();
  const gate = input.gate ?? boardRateGate;
  const limited = await reserve(input.store, input.accountId, now, gate);
  if (limited) return limited;

  const id = crypto.randomUUID();
  try {
    await input.store.insertReply({
      id,
      threadId: thread.id,
      body: body.value,
      authorAccountId: input.accountId,
      createdAt: new Date(now).toISOString(),
      hidden: false,
    });
  } catch (error) {
    return failure(error, gate, input.accountId);
  }
  return { ok: true, id };
}

export async function applyThreadModeration(input: {
  store: BoardStore;
  role: ViewerRole;
  threadId: string;
  intent: string;
}): Promise<BoardResult> {
  if (!canModerate(input.role)) return { ok: false, error: boardCopy.founderOnly };
  if (!isUuid(input.threadId)) return { ok: false, error: boardCopy.missingThread };
  if (!isThreadIntent(input.intent)) return { ok: false, error: boardCopy.intent };
  const patch =
    input.intent === "pin"
      ? { pinned: true }
      : input.intent === "unpin"
        ? { pinned: false }
        : input.intent === "lock"
          ? { locked: true }
          : input.intent === "unlock"
            ? { locked: false }
            : input.intent === "hide"
              ? { hidden: true }
              : { hidden: false };
  try {
    const updated = await input.store.updateThread(input.threadId, patch);
    if (!updated) return { ok: false, error: boardCopy.missingThread };
  } catch (error) {
    if (error instanceof BoardTablesMissingError) return { ok: false, error: boardCopy.unseated };
    console.error("board moderate failed", error instanceof Error ? error.message : "unknown");
    return { ok: false, error: boardCopy.keepFailed };
  }
  return { ok: true, id: input.threadId };
}

export async function applyReplyModeration(input: {
  store: BoardStore;
  role: ViewerRole;
  replyId: string;
  intent: string;
}): Promise<BoardResult> {
  if (!canModerate(input.role)) return { ok: false, error: boardCopy.founderOnly };
  if (!isUuid(input.replyId)) return { ok: false, error: boardCopy.missingThread };
  if (!isReplyIntent(input.intent)) return { ok: false, error: boardCopy.intent };
  try {
    const updated = await input.store.updateReply(input.replyId, {
      hidden: input.intent === "hide",
    });
    if (!updated) return { ok: false, error: boardCopy.missingThread };
  } catch (error) {
    if (error instanceof BoardTablesMissingError) return { ok: false, error: boardCopy.unseated };
    console.error("board reply moderate failed", error instanceof Error ? error.message : "unknown");
    return { ok: false, error: boardCopy.keepFailed };
  }
  return { ok: true, id: input.replyId };
}
