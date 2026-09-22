export const JOURNAL_STREAMS = ["overmind", "house"] as const;
export type JournalStream = (typeof JOURNAL_STREAMS)[number];

export const PUBLISH_STATUSES = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export type StorageKind = "supabase" | "neon" | "blob" | "github" | "local" | "readonly";

export type CmsRecord = {
  stream: JournalStream;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  body: string;
  status: PublishStatus;
  category?: string;
  dek?: string;
  teaser?: string;
  tags?: string[];
  author?: string;
  updatedAt: string;
};

export type JournalStorageInfo = {
  kind: StorageKind;
  writable: boolean;
  label: string;
  hint: string;
};

export function recordKey(stream: JournalStream, slug: string): string {
  return `${stream}:${slug}`;
}

export function isJournalStream(value: string): value is JournalStream {
  return (JOURNAL_STREAMS as readonly string[]).includes(value);
}

export function isPublishStatus(value: string): value is PublishStatus {
  return (PUBLISH_STATUSES as readonly string[]).includes(value);
}
