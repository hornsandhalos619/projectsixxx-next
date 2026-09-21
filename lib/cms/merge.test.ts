import { mergeRecords, findRecord } from "./merge";
import type { CmsRecord } from "./types";

function sample(partial: Partial<CmsRecord> & Pick<CmsRecord, "stream" | "slug" | "title">): CmsRecord {
  return {
    date: "2026-09-21",
    excerpt: "",
    body: "",
    status: "published",
    updatedAt: "2026-09-21T00:00:00.000Z",
    ...partial,
  };
}

const seed = sample({ stream: "overmind", slug: "field-notes-day-one", title: "Seed" });
const overlay = sample({
  stream: "overmind",
  slug: "field-notes-day-one",
  title: "Desk edit",
  status: "draft",
});
const extra = sample({ stream: "house", slug: "new-cut", title: "New cut", category: "fine-art" });

const merged = mergeRecords([seed], [overlay, extra]);
const hit = findRecord(merged, "overmind", "field-notes-day-one");

if (merged.length !== 2) throw new Error(`expected 2 records, got ${merged.length}`);
if (hit?.title !== "Desk edit") throw new Error("overlay should win on slug");
if (hit?.status !== "draft") throw new Error("overlay status should replace seed");
if (!findRecord(merged, "house", "new-cut")) throw new Error("new house record should appear");

console.log("cms merge ok");
