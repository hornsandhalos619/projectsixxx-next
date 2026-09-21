import { del, list, put } from "@vercel/blob";
import { recordFromUnknown, recordToJson } from "@/lib/cms/serialize";
import type { CmsRecord, JournalStream } from "@/lib/cms/types";

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function blobPath(stream: JournalStream, slug: string): string {
  return `journal-cms/${stream}/${slug}.json`;
}

export async function blobList(): Promise<CmsRecord[]> {
  const { blobs } = await list({ prefix: "journal-cms/" });
  const records = await Promise.all(
    blobs.map(async (entry) => {
      const response = await fetch(entry.url, { cache: "no-store" });
      if (!response.ok) return null;
      const data = await response.json();
      return recordFromUnknown(data);
    }),
  );
  return records.filter((record): record is CmsRecord => Boolean(record));
}

export async function blobWrite(record: CmsRecord): Promise<void> {
  await put(blobPath(record.stream, record.slug), recordToJson(record), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function blobRemove(stream: JournalStream, slug: string): Promise<void> {
  await del(blobPath(stream, slug));
}
