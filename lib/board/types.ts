import type { BoardCategory } from "@/lib/board/categories";

export type BoardThreadRecord = {
  id: string;
  title: string;
  body: string;
  authorAccountId: string;
  category: BoardCategory;
  createdAt: string;
  pinned: boolean;
  locked: boolean;
  hidden: boolean;
};

export type BoardReplyRecord = {
  id: string;
  threadId: string;
  body: string;
  authorAccountId: string;
  createdAt: string;
  hidden: boolean;
};

export type BoardDocument = {
  threads: BoardThreadRecord[];
  replies: BoardReplyRecord[];
};

export type BoardRead = {
  threads: BoardThreadRecord[];
  replies: BoardReplyRecord[];
  missing: boolean;
  unreadable: boolean;
};

export type BoardStore = {
  read(): Promise<BoardRead>;
  insertThread(row: BoardThreadRecord): Promise<void>;
  insertReply(row: BoardReplyRecord): Promise<void>;
  updateThread(
    id: string,
    patch: Partial<Pick<BoardThreadRecord, "pinned" | "locked" | "hidden">>,
  ): Promise<boolean>;
  updateReply(id: string, patch: { hidden: boolean }): Promise<boolean>;
  countSince(authorAccountId: string, sinceIso: string): Promise<number>;
};

export class BoardTablesMissingError extends Error {
  constructor() {
    super("board tables missing");
    this.name = "BoardTablesMissingError";
  }
}

export const emptyRead = (): BoardRead => ({
  threads: [],
  replies: [],
  missing: false,
  unreadable: false,
});
