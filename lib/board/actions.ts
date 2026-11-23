"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { liveAccountStore, normalizeEmail } from "@/lib/house/accounts";
import { getViewer } from "@/lib/session";
import { canModerate } from "@/lib/board/access";
import { boardCopy } from "@/lib/board/copy";
import {
  applyReplyModeration,
  applyThreadModeration,
  submitReply,
  submitThread,
} from "@/lib/board/post";
import { liveBoardStore } from "@/lib/board/store";

export type BoardState = { ok: false; error: string } | { ok: true } | null;

async function speaker() {
  const viewer = await getViewer();
  if (viewer.role === "anon" || !viewer.email) {
    return { ok: false as const, error: boardCopy.signIn, viewer };
  }
  const accounts = liveAccountStore();
  if (!accounts) return { ok: false as const, error: boardCopy.noLedger, viewer };
  try {
    const account = await accounts.findByEmail(normalizeEmail(viewer.email));
    if (!account) return { ok: false as const, error: boardCopy.unknownKey, viewer };
    return { ok: true as const, account, viewer };
  } catch (error) {
    console.error("board account lookup failed", error instanceof Error ? error.message : "unknown");
    return { ok: false as const, error: boardCopy.keepFailed, viewer };
  }
}

function refresh(threadId?: string) {
  revalidatePath("/board");
  if (threadId) revalidatePath(`/board/${threadId}`);
}

export async function createThread(_prev: BoardState, formData: FormData): Promise<BoardState> {
  const gate = await speaker();
  if (!gate.ok) return { ok: false, error: gate.error };
  const store = liveBoardStore();
  if (!store) return { ok: false, error: boardCopy.noLedger };
  const result = await submitThread({
    store,
    accountId: gate.account.id,
    role: gate.viewer.role,
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    category: String(formData.get("category") ?? ""),
  });
  if (!result.ok) return result;
  refresh(result.id);
  redirect(`/board/${result.id}`);
}

export async function createReply(_prev: BoardState, formData: FormData): Promise<BoardState> {
  const gate = await speaker();
  if (!gate.ok) return { ok: false, error: gate.error };
  const store = liveBoardStore();
  if (!store) return { ok: false, error: boardCopy.noLedger };
  const threadId = String(formData.get("threadId") ?? "");
  const result = await submitReply({
    store,
    accountId: gate.account.id,
    role: gate.viewer.role,
    threadId,
    body: String(formData.get("body") ?? ""),
  });
  if (!result.ok) return result;
  refresh(threadId);
  redirect(`/board/${threadId}`);
}

export async function moderateThread(_prev: BoardState, formData: FormData): Promise<BoardState> {
  const viewer = await getViewer();
  if (!canModerate(viewer.role)) return { ok: false, error: boardCopy.founderOnly };
  const store = liveBoardStore();
  if (!store) return { ok: false, error: boardCopy.noLedger };
  const result = await applyThreadModeration({
    store,
    role: viewer.role,
    threadId: String(formData.get("threadId") ?? ""),
    intent: String(formData.get("intent") ?? ""),
  });
  if (!result.ok) return result;
  refresh(result.id);
  return { ok: true };
}

export async function moderateReply(_prev: BoardState, formData: FormData): Promise<BoardState> {
  const viewer = await getViewer();
  if (!canModerate(viewer.role)) return { ok: false, error: boardCopy.founderOnly };
  const store = liveBoardStore();
  if (!store) return { ok: false, error: boardCopy.noLedger };
  const result = await applyReplyModeration({
    store,
    role: viewer.role,
    replyId: String(formData.get("replyId") ?? ""),
    intent: String(formData.get("intent") ?? ""),
  });
  if (!result.ok) return result;
  refresh(String(formData.get("threadId") ?? ""));
  return { ok: true };
}
