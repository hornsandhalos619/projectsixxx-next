import { canSeeJournalAdmin, type ViewerRole } from "@/config/roles";
import {
  readBlobPosts,
  writeBlobPost,
  blobTokenPresent,
} from "@/lib/journal-blob";
import {
  readHouseTree,
  readOvermindTree,
  treePostKey,
  writeStoredToTree,
} from "@/lib/journal-fs";
import {
  mergeByKey,
  type JournalLane,
  type StoredPost,
} from "@/lib/journal-model";

export type JournalStoreMode = "blob" | "fs";

export function journalStoreMode(): JournalStoreMode {
  return blobTokenPresent() ? "blob" : "fs";
}

export function journalWritesReady(): boolean {
  if (journalStoreMode() === "blob") return true;
  return process.env.VERCEL !== "1";
}

export function journalStoreLabel(): string {
  if (journalStoreMode() === "blob") return "Vercel Blob ledger";
  if (process.env.VERCEL === "1") {
    return "Read-only on Vercel until BLOB_READ_WRITE_TOKEN is set";
  }
  return "Local MDX tree";
}

export async function loadStoredPosts(lane?: JournalLane): Promise<StoredPost[]> {
  if (journalStoreMode() === "blob") {
    return readBlobPosts(lane);
  }
  if (lane === "overmind") return readOvermindTree();
  if (lane === "house") return readHouseTree();
  return [...readOvermindTree(), ...readHouseTree()];
}

export async function loadMergedPosts(lane: JournalLane): Promise<StoredPost[]> {
  const tree = lane === "overmind" ? readOvermindTree() : readHouseTree();
  if (journalStoreMode() !== "blob") {
    return tree.sort(byDateDesc);
  }
  const overlays = await readBlobPosts(lane);
  return mergeByKey(tree, overlays, treePostKey).sort(byDateDesc);
}

export async function getStoredPost(
  lane: JournalLane,
  slug: string,
  category?: string,
): Promise<StoredPost | undefined> {
  const posts = await loadMergedPosts(lane);
  return posts.find((post) => {
    if (post.slug !== slug) return false;
    if (lane === "house") return post.category === category;
    return true;
  });
}

export async function saveStoredPost(post: StoredPost): Promise<StoredPost> {
  if (!journalWritesReady()) {
    throw new Error(
      "Publishing on Vercel needs BLOB_READ_WRITE_TOKEN so the ledger can persist.",
    );
  }
  const next: StoredPost = {
    ...post,
    updatedAt: new Date().toISOString(),
  };
  if (journalStoreMode() === "blob") {
    await writeBlobPost(next);
  } else {
    writeStoredToTree(next);
  }
  return next;
}

export function canMutateJournal(role: ViewerRole): boolean {
  return canSeeJournalAdmin(role);
}

function byDateDesc(a: StoredPost, b: StoredPost): number {
  if (a.date === b.date) return a.slug < b.slug ? 1 : -1;
  return a.date < b.date ? 1 : -1;
}
