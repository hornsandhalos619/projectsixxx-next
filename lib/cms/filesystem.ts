import fs from "node:fs";
import path from "node:path";
import { mdxToRecord } from "@/lib/cms/serialize";
import type { CmsRecord, JournalStream } from "@/lib/cms/types";

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(next);
    if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) return [next];
    return [];
  });
}

function parseHouseFile(file: string): CmsRecord | null {
  const raw = fs.readFileSync(file, "utf8");
  const category = path.basename(path.dirname(file));
  const slug = path.basename(file, path.extname(file));
  return mdxToRecord(raw, { stream: "house", slug, category });
}

function parseOvermindFile(file: string): CmsRecord | null {
  const raw = fs.readFileSync(file, "utf8");
  const slug = path.basename(file, path.extname(file));
  return mdxToRecord(raw, { stream: "overmind", slug });
}

export function readFilesystemRecords(stream?: JournalStream): CmsRecord[] {
  const houseRoot = path.join(process.cwd(), "content/journal");
  const overmindRoot = path.join(process.cwd(), "content/overmind/journal");
  const house =
    stream && stream !== "house" ? [] : walk(houseRoot).map(parseHouseFile);
  const overmind =
    stream && stream !== "overmind" ? [] : walk(overmindRoot).map(parseOvermindFile);
  return [...house, ...overmind].filter((record): record is CmsRecord => Boolean(record));
}

export function filesystemHas(stream: JournalStream, slug: string): boolean {
  return readFilesystemRecords(stream).some((record) => record.slug === slug);
}
