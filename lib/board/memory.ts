import { countSinceDocument } from "@/lib/board/document";
import {
  emptyRead,
  type BoardDocument,
  type BoardRead,
  type BoardReplyRecord,
  type BoardStore,
  type BoardThreadRecord,
} from "@/lib/board/types";

function clone(doc: BoardDocument): BoardDocument {
  return {
    threads: doc.threads.map((row) => ({ ...row })),
    replies: doc.replies.map((row) => ({ ...row })),
  };
}

export function createMemoryBoardStore(seed?: BoardDocument): BoardStore {
  let doc = clone(seed ?? { threads: [], replies: [] });

  function read(): Promise<BoardRead> {
    const snap = clone(doc);
    return Promise.resolve({ ...emptyRead(), threads: snap.threads, replies: snap.replies });
  }

  return {
    read,
    async insertThread(row: BoardThreadRecord) {
      if (doc.threads.some((thread) => thread.id === row.id)) {
        throw new Error("duplicate thread");
      }
      doc = { ...doc, threads: [...doc.threads, { ...row }] };
    },
    async insertReply(row: BoardReplyRecord) {
      if (doc.replies.some((reply) => reply.id === row.id)) {
        throw new Error("duplicate reply");
      }
      if (!doc.threads.some((thread) => thread.id === row.threadId)) {
        throw new Error("missing thread");
      }
      doc = { ...doc, replies: [...doc.replies, { ...row }] };
    },
    async updateThread(id, patch) {
      const index = doc.threads.findIndex((thread) => thread.id === id);
      if (index < 0) return false;
      const next = [...doc.threads];
      next[index] = { ...next[index], ...patch };
      doc = { ...doc, threads: next };
      return true;
    },
    async updateReply(id, patch) {
      const index = doc.replies.findIndex((reply) => reply.id === id);
      if (index < 0) return false;
      const next = [...doc.replies];
      next[index] = { ...next[index], ...patch };
      doc = { ...doc, replies: next };
      return true;
    },
    async countSince(authorAccountId, sinceIso) {
      return countSinceDocument(doc, authorAccountId, sinceIso);
    },
  };
}
