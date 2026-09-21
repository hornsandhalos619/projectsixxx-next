import { get, list, put } from "@vercel/blob";
import {
  parseStoredJson,
  type JournalLane,
  type StoredPost,
} from "@/lib/journal-model";
import { treePostKey } from "@/lib/journal-fs";

const PREFIX = "journal";

export function blobTokenPresent(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function blobPathFor(post: StoredPost): string {
  if (post.lane === "overmind") {
    return `${PREFIX}/overmind/${post.slug}.json`;
  }
  return `${PREFIX}/house/${post.category}/${post.slug}.json`;
}

export function blobPrefixFor(lane?: JournalLane): string {
  return lane ? `${PREFIX}/${lane}/` : `${PREFIX}/`;
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

export async function readBlobPosts(lane?: JournalLane): Promise<StoredPost[]> {
  if (!blobTokenPresent()) return [];
  const collected: StoredPost[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: blobPrefixFor(lane), cursor, limit: 1000 });
    for (const blob of page.blobs) {
      if (!blob.pathname.endsWith(".json")) continue;
      const result = await get(blob.pathname, {
        access: "private",
        useCache: false,
      });
      if (!result || result.statusCode !== 200 || !result.stream) continue;
      try {
        collected.push(parseStoredJson(await streamToString(result.stream)));
      } catch {
        // Skip a malformed ledger object; the tree still holds the seed.
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return collected;
}

export async function writeBlobPost(post: StoredPost): Promise<void> {
  if (!blobTokenPresent()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to write the journal ledger.");
  }
  await put(blobPathFor(post), JSON.stringify(post), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export function blobKey(post: StoredPost): string {
  return treePostKey(post);
}
