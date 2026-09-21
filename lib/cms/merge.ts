import { recordKey, type CmsRecord, type JournalStream } from "@/lib/cms/types";

export function mergeRecords(base: CmsRecord[], overlay: CmsRecord[]): CmsRecord[] {
  const map = new Map<string, CmsRecord>();
  for (const record of base) {
    map.set(recordKey(record.stream, record.slug), record);
  }
  for (const record of overlay) {
    map.set(recordKey(record.stream, record.slug), record);
  }
  return [...map.values()].sort((a, b) => {
    if (a.date === b.date) return a.title.localeCompare(b.title);
    return a.date < b.date ? 1 : -1;
  });
}

export function findRecord(
  records: CmsRecord[],
  stream: JournalStream,
  slug: string,
): CmsRecord | undefined {
  return records.find((record) => record.stream === stream && record.slug === slug);
}
