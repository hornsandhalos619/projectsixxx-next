import fs from "node:fs";
import path from "node:path";
import { localAllowed } from "@/lib/cms/local-allowed";
import { recordFromUnknown } from "@/lib/cms/serialize";
import type { CmsRecord, JournalStream } from "@/lib/cms/types";

const FILE = path.join(process.cwd(), "data", "journal-cms.json");

export { localAllowed };

function readFile(): CmsRecord[] {
  if (!fs.existsSync(FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => recordFromUnknown(item))
      .filter((record): record is CmsRecord => Boolean(record));
  } catch {
    return [];
  }
}

function writeFile(records: CmsRecord[]): void {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

export async function localList(): Promise<CmsRecord[]> {
  return readFile();
}

export async function localWrite(record: CmsRecord): Promise<void> {
  const records = readFile().filter(
    (item) => !(item.stream === record.stream && item.slug === record.slug),
  );
  records.push(record);
  writeFile(records);
}

export async function localRemove(stream: JournalStream, slug: string): Promise<void> {
  writeFile(readFile().filter((item) => !(item.stream === stream && item.slug === slug)));
}
