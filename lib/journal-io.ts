import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type EditorialStatus = "draft" | "published";

export function isEditorialStatus(value: unknown): value is EditorialStatus {
  return value === "draft" || value === "published";
}

/** Legacy house `sample` / `house` and missing status count as published. */
export function parseEditorialStatus(value: unknown): EditorialStatus {
  return value === "draft" ? "draft" : "published";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function assertSafeSlug(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("invalid_slug");
  }
  return slug;
}

export function assertInside(root: string, target: string): string {
  const resolved = path.resolve(target);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    throw new Error("invalid_path");
  }
  return resolved;
}

export function serializeMdx(
  frontmatter: Record<string, unknown>,
  body: string,
): string {
  const content = body.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  const withNl = content.endsWith("\n") ? content : `${content}\n`;
  return matter.stringify(withNl, frontmatter);
}

export function writeMdxFile(
  filePath: string,
  frontmatter: Record<string, unknown>,
  body: string,
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, serializeMdx(frontmatter, body), "utf8");
}

export function removeFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
