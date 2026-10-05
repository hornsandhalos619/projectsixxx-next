import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const next = join(dir, name);
    const stat = statSync(next);
    if (stat.isDirectory()) {
      if (name === "admin") return [];
      return walk(next);
    }
    if (/\.(tsx|ts|mdx)$/.test(name)) return [next];
    return [];
  });
}

const publicFiles = [
  ...walk(join(root, "app")),
  ...walk(join(root, "content")),
  ...walk(join(root, "components")),
  join(root, "config/affiliates.ts"),
  join(root, "lib/library.ts"),
];

const allowedComment = /SAMPLE/;
const libraryCommentOnly = join(root, "lib/library.ts");
const ariaSample = /aria-label(?:ledby)?\s*=\s*(?:\{)?["'`][^"'`]*sample/i;

for (const file of publicFiles) {
  const source = readFileSync(file, "utf8");
  const relative = file.slice(root.length + 1);
  if (relative.startsWith("app/admin/") || /Editor\.tsx$/.test(relative)) continue;
  const lines = source.split("\n");
  for (const [index, line] of lines.entries()) {
    if (ariaSample.test(line)) {
      throw new Error(`public file ${relative}:${index + 1} has an aria-label containing 'sample'`);
    }
    if (
      /(visually-hidden|sr-only)/.test(line) &&
      /sample/i.test(line) &&
      !/\/library\/[^"'`\s]+\/sample/.test(line)
    ) {
      throw new Error(`public file ${relative}:${index + 1} has sr-only copy containing 'sample'`);
    }
    if (!line.includes("SAMPLE")) continue;
    const trimmed = line.trim();
    const comment = trimmed.startsWith("*") || trimmed.startsWith("/*") || trimmed.startsWith("//");
    if (comment) continue;
    if (file === libraryCommentOnly && trimmed.startsWith("/**")) continue;
    throw new Error(`public file ${relative}:${index + 1} still contains SAMPLE`);
  }
  void allowedComment;
}

console.log("public SAMPLE copy ok");
