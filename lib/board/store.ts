import { get, list, put } from "@vercel/blob";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { localAllowed } from "@/lib/cms/local-allowed";
import { localJsonReadObject, localJsonWriteObject } from "@/lib/cms/local-json";
import { neonConfigured } from "@/lib/cms/neon";
import { blobAccountsConfigured } from "@/lib/house/accounts";
import { asDocument, asReply, asThread, countSinceDocument, isMissingRelation } from "@/lib/board/document";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import {
  BoardTablesMissingError,
  emptyRead,
  type BoardDocument,
  type BoardRead,
  type BoardReplyRecord,
  type BoardStore,
  type BoardThreadRecord,
} from "@/lib/board/types";

const LOCAL_FILE = "house-board";
const BLOB_PATH = "house-board/v1/board.json";

function missingOrThrow(error: unknown): never {
  if (isMissingRelation(error)) throw new BoardTablesMissingError();
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "board store failed")
        : "board store failed";
  throw new Error(message);
}

function readFromRows(threads: unknown[], replies: unknown[]): BoardRead {
  return {
    ...emptyRead(),
    threads: threads.map(asThread).filter((row): row is BoardThreadRecord => Boolean(row)),
    replies: replies.map(asReply).filter((row): row is BoardReplyRecord => Boolean(row)),
  };
}

const localBoardStore: BoardStore = {
  async read() {
    return { ...emptyRead(), ...asDocument(localJsonReadObject(LOCAL_FILE, { threads: [], replies: [] })) };
  },
  async insertThread(row) {
    const doc = asDocument(localJsonReadObject(LOCAL_FILE, { threads: [], replies: [] }));
    if (doc.threads.some((thread) => thread.id === row.id)) throw new Error("duplicate thread");
    doc.threads.push(row);
    localJsonWriteObject(LOCAL_FILE, doc);
  },
  async insertReply(row) {
    const doc = asDocument(localJsonReadObject(LOCAL_FILE, { threads: [], replies: [] }));
    if (!doc.threads.some((thread) => thread.id === row.threadId)) throw new Error("missing thread");
    doc.replies.push(row);
    localJsonWriteObject(LOCAL_FILE, doc);
  },
  async updateThread(id, patch) {
    const doc = asDocument(localJsonReadObject(LOCAL_FILE, { threads: [], replies: [] }));
    const index = doc.threads.findIndex((thread) => thread.id === id);
    if (index < 0) return false;
    doc.threads[index] = { ...doc.threads[index], ...patch };
    localJsonWriteObject(LOCAL_FILE, doc);
    return true;
  },
  async updateReply(id, patch) {
    const doc = asDocument(localJsonReadObject(LOCAL_FILE, { threads: [], replies: [] }));
    const index = doc.replies.findIndex((reply) => reply.id === id);
    if (index < 0) return false;
    doc.replies[index] = { ...doc.replies[index], ...patch };
    localJsonWriteObject(LOCAL_FILE, doc);
    return true;
  },
  async countSince(authorAccountId, sinceIso) {
    const doc = asDocument(localJsonReadObject(LOCAL_FILE, { threads: [], replies: [] }));
    return countSinceDocument(doc, authorAccountId, sinceIso);
  },
};

async function readBlobDocument(): Promise<BoardDocument | null> {
  for (const access of ["private", "public"] as const) {
    try {
      const result = await get(BLOB_PATH, { access });
      if (result?.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text();
        if (!text.trim()) return { threads: [], replies: [] };
        return asDocument(JSON.parse(text) as unknown);
      }
    } catch {
      // Missing blob or the other access mode. Fall through.
    }
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 5 });
    const match = blobs.find((entry) => entry.pathname === BLOB_PATH);
    if (!match) return { threads: [], replies: [] };
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(match.url, { cache: "no-store", headers });
    if (response.status === 404) return { threads: [], replies: [] };
    if (!response.ok) return null;
    return asDocument((await response.json()) as unknown);
  } catch (error) {
    console.error("board blob read failed", error instanceof Error ? error.message : "unknown");
    return null;
  }
}

async function writeBlobDocument(doc: BoardDocument): Promise<void> {
  const body = JSON.stringify(doc);
  const base = {
    addRandomSuffix: false as const,
    allowOverwrite: true as const,
    contentType: "application/json",
  };
  try {
    await put(BLOB_PATH, body, { ...base, access: "private" });
    return;
  } catch {
    await put(BLOB_PATH, body, { ...base, access: "public" });
  }
}

const blobBoardStore: BoardStore = {
  async read() {
    const doc = await readBlobDocument();
    if (!doc) return { ...emptyRead(), unreadable: true };
    return { ...emptyRead(), ...doc };
  },
  async insertThread(row) {
    const doc = await readBlobDocument();
    if (!doc) throw new Error("board blob unreadable");
    if (doc.threads.some((thread) => thread.id === row.id)) throw new Error("duplicate thread");
    doc.threads.push(row);
    await writeBlobDocument(doc);
  },
  async insertReply(row) {
    const doc = await readBlobDocument();
    if (!doc) throw new Error("board blob unreadable");
    if (!doc.threads.some((thread) => thread.id === row.threadId)) throw new Error("missing thread");
    doc.replies.push(row);
    await writeBlobDocument(doc);
  },
  async updateThread(id, patch) {
    const doc = await readBlobDocument();
    if (!doc) throw new Error("board blob unreadable");
    const index = doc.threads.findIndex((thread) => thread.id === id);
    if (index < 0) return false;
    doc.threads[index] = { ...doc.threads[index], ...patch };
    await writeBlobDocument(doc);
    return true;
  },
  async updateReply(id, patch) {
    const doc = await readBlobDocument();
    if (!doc) throw new Error("board blob unreadable");
    const index = doc.replies.findIndex((reply) => reply.id === id);
    if (index < 0) return false;
    doc.replies[index] = { ...doc.replies[index], ...patch };
    await writeBlobDocument(doc);
    return true;
  },
  async countSince(authorAccountId, sinceIso) {
    const doc = await readBlobDocument();
    if (!doc) throw new Error("board blob unreadable");
    return countSinceDocument(doc, authorAccountId, sinceIso);
  },
};

function threadInsert(row: BoardThreadRecord) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    author_account_id: row.authorAccountId,
    category: row.category,
    created_at: row.createdAt,
    pinned: row.pinned,
    locked: row.locked,
    hidden: row.hidden,
  };
}

function replyInsert(row: BoardReplyRecord) {
  return {
    id: row.id,
    thread_id: row.threadId,
    body: row.body,
    author_account_id: row.authorAccountId,
    created_at: row.createdAt,
    hidden: row.hidden,
  };
}

const THREAD_COLUMNS =
  "id, title, body, author_account_id, category, created_at, pinned, locked, hidden";
const REPLY_COLUMNS = "id, thread_id, body, author_account_id, created_at, hidden";

const supabaseBoardStore: BoardStore = {
  async read() {
    const threads = await getSupabase().from("board_threads").select(THREAD_COLUMNS);
    if (threads.error) {
      if (isMissingRelation(threads.error)) return { ...emptyRead(), missing: true };
      console.error("board thread read failed", threads.error.message);
      return { ...emptyRead(), unreadable: true };
    }
    const replies = await getSupabase().from("board_replies").select(REPLY_COLUMNS);
    if (replies.error) {
      if (isMissingRelation(replies.error)) return { ...emptyRead(), missing: true };
      console.error("board reply read failed", replies.error.message);
      return { ...emptyRead(), unreadable: true };
    }
    return readFromRows(threads.data ?? [], replies.data ?? []);
  },
  async insertThread(row) {
    const { error } = await getSupabase().from("board_threads").insert(threadInsert(row));
    if (error) missingOrThrow(error);
  },
  async insertReply(row) {
    const { error } = await getSupabase().from("board_replies").insert(replyInsert(row));
    if (error) missingOrThrow(error);
  },
  async updateThread(id, patch) {
    const next: Record<string, boolean> = {};
    if (patch.pinned !== undefined) next.pinned = patch.pinned;
    if (patch.locked !== undefined) next.locked = patch.locked;
    if (patch.hidden !== undefined) next.hidden = patch.hidden;
    const { data, error } = await getSupabase()
      .from("board_threads")
      .update(next)
      .eq("id", id)
      .select("id");
    if (error) missingOrThrow(error);
    return (data?.length ?? 0) > 0;
  },
  async updateReply(id, patch) {
    const { data, error } = await getSupabase()
      .from("board_replies")
      .update({ hidden: patch.hidden })
      .eq("id", id)
      .select("id");
    if (error) missingOrThrow(error);
    return (data?.length ?? 0) > 0;
  },
  async countSince(authorAccountId, sinceIso) {
    const threads = await getSupabase()
      .from("board_threads")
      .select("id", { count: "exact", head: true })
      .eq("author_account_id", authorAccountId)
      .gte("created_at", sinceIso);
    if (threads.error) missingOrThrow(threads.error);
    const replies = await getSupabase()
      .from("board_replies")
      .select("id", { count: "exact", head: true })
      .eq("author_account_id", authorAccountId)
      .gte("created_at", sinceIso);
    if (replies.error) missingOrThrow(replies.error);
    return (threads.count ?? 0) + (replies.count ?? 0);
  },
};

let neonSql: NeonQueryFunction<false, false> | null = null;
let neonReady: Promise<void> | null = null;

function neonClient(): NeonQueryFunction<false, false> {
  if (!neonSql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL or POSTGRES_URL is required for the hall ledger.");
    neonSql = neon(url);
  }
  return neonSql;
}

async function ensureNeonBoard(): Promise<NeonQueryFunction<false, false>> {
  const sql = neonClient();
  if (!neonReady) {
    neonReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS board_threads (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          author_account_id TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          pinned BOOLEAN NOT NULL DEFAULT false,
          locked BOOLEAN NOT NULL DEFAULT false,
          hidden BOOLEAN NOT NULL DEFAULT false
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS board_replies (
          id TEXT PRIMARY KEY,
          thread_id TEXT NOT NULL,
          body TEXT NOT NULL,
          author_account_id TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          hidden BOOLEAN NOT NULL DEFAULT false
        )
      `;
    })();
  }
  await neonReady;
  return sql;
}

const neonBoardStore: BoardStore = {
  async read() {
    try {
      const sql = await ensureNeonBoard();
      const threads = await sql`
        SELECT id, title, body, author_account_id, category, created_at, pinned, locked, hidden
        FROM board_threads
      `;
      const replies = await sql`
        SELECT id, thread_id, body, author_account_id, created_at, hidden
        FROM board_replies
      `;
      return readFromRows(threads, replies);
    } catch (error) {
      if (isMissingRelation(error)) return { ...emptyRead(), missing: true };
      console.error("board neon read failed", error instanceof Error ? error.message : "unknown");
      return { ...emptyRead(), unreadable: true };
    }
  },
  async insertThread(row) {
    try {
      const sql = await ensureNeonBoard();
      await sql`
        INSERT INTO board_threads (
          id, title, body, author_account_id, category, created_at, pinned, locked, hidden
        )
        VALUES (
          ${row.id},
          ${row.title},
          ${row.body},
          ${row.authorAccountId},
          ${row.category},
          ${row.createdAt},
          ${row.pinned},
          ${row.locked},
          ${row.hidden}
        )
      `;
    } catch (error) {
      missingOrThrow(error);
    }
  },
  async insertReply(row) {
    try {
      const sql = await ensureNeonBoard();
      await sql`
        INSERT INTO board_replies (id, thread_id, body, author_account_id, created_at, hidden)
        VALUES (
          ${row.id},
          ${row.threadId},
          ${row.body},
          ${row.authorAccountId},
          ${row.createdAt},
          ${row.hidden}
        )
      `;
    } catch (error) {
      missingOrThrow(error);
    }
  },
  async updateThread(id, patch) {
    try {
      const sql = await ensureNeonBoard();
      if (patch.pinned !== undefined) {
        const rows = await sql`
          UPDATE board_threads SET pinned = ${patch.pinned} WHERE id = ${id} RETURNING id
        `;
        return rows.length > 0;
      }
      if (patch.locked !== undefined) {
        const rows = await sql`
          UPDATE board_threads SET locked = ${patch.locked} WHERE id = ${id} RETURNING id
        `;
        return rows.length > 0;
      }
      if (patch.hidden !== undefined) {
        const rows = await sql`
          UPDATE board_threads SET hidden = ${patch.hidden} WHERE id = ${id} RETURNING id
        `;
        return rows.length > 0;
      }
      return false;
    } catch (error) {
      missingOrThrow(error);
    }
  },
  async updateReply(id, patch) {
    try {
      const sql = await ensureNeonBoard();
      const rows = await sql`
        UPDATE board_replies
        SET hidden = ${patch.hidden}
        WHERE id = ${id}
        RETURNING id
      `;
      return rows.length > 0;
    } catch (error) {
      missingOrThrow(error);
    }
  },
  async countSince(authorAccountId, sinceIso) {
    try {
      const sql = await ensureNeonBoard();
      const threads = await sql`
        SELECT count(*)::int AS total
        FROM board_threads
        WHERE author_account_id = ${authorAccountId}
          AND created_at >= ${sinceIso}
      `;
      const replies = await sql`
        SELECT count(*)::int AS total
        FROM board_replies
        WHERE author_account_id = ${authorAccountId}
          AND created_at >= ${sinceIso}
      `;
      const threadTotal = Number((threads[0] as { total?: unknown } | undefined)?.total ?? 0);
      const replyTotal = Number((replies[0] as { total?: unknown } | undefined)?.total ?? 0);
      return threadTotal + replyTotal;
    } catch (error) {
      missingOrThrow(error);
    }
  },
};

/**
 * Same order as house accounts: Supabase, then Neon, Blob, then local dev files.
 * Supabase does not create tables. A missing relation is an empty hall.
 */
export function liveBoardStore(): BoardStore | null {
  if (supabaseConfigured()) return supabaseBoardStore;
  if (neonConfigured()) return neonBoardStore;
  if (blobAccountsConfigured()) return blobBoardStore;
  if (localAllowed()) return localBoardStore;
  return null;
}

export async function loadBoard(store: BoardStore | null = liveBoardStore()): Promise<
  BoardRead & { configured: boolean }
> {
  if (!store) return { ...emptyRead(), configured: false };
  try {
    const read = await store.read();
    return { ...read, configured: true };
  } catch (error) {
    if (isMissingRelation(error)) return { ...emptyRead(), missing: true, configured: true };
    console.error("board load failed", error instanceof Error ? error.message : "unknown");
    return { ...emptyRead(), unreadable: true, configured: true };
  }
}
