import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  assertSafeSlug,
  excerptFromBody,
  isJournalCategory,
  normalizeDate,
  serializeHouseMdx,
  serializeOvermindMdx,
  type HouseKind,
  type StoredPost,
} from "@/lib/journal-model";
import type { JournalCategory } from "@/config/site";

export function contentRoot(): string {
  return process.env.JOURNAL_CONTENT_ROOT || process.cwd();
}

export function overmindJournalDir(): string {
  return path.join(contentRoot(), "content/overmind/journal");
}

export function houseJournalDir(): string {
  return path.join(contentRoot(), "content/journal");
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) return [full];
    return [];
  });
}

function readFile(file: string): { data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  return { data: parsed.data as Record<string, unknown>, content: parsed.content };
}

export function readOvermindTree(): StoredPost[] {
  return walk(overmindJournalDir()).flatMap((file) => {
    const { data, content } = readFile(file);
    const tags = Array.isArray(data.tags) ? data.tags.map((t) => String(t)) : [];
    const candidate = String(data.slug ?? path.basename(file, path.extname(file)));
    let slug: string;
    try {
      slug = assertSafeSlug(candidate);
    } catch {
      return [];
    }
    return [
      {
        lane: "overmind",
        title: String(data.title ?? ""),
        slug,
        body: content,
        date: normalizeDate(String(data.date ?? "")),
        publishState: data.status === "published" ? "published" : "draft",
        updatedAt: "",
        updatedBy: null,
        author: "Overmind",
        tags,
        teaser: String(data.teaser ?? excerptFromBody(content)).slice(0, 160),
      },
    ];
  });
}

export function readHouseTree(): StoredPost[] {
  return walk(houseJournalDir()).flatMap((file) => {
    const { data, content } = readFile(file);
    const categoryRaw = String(data.category ?? "");
    if (!isJournalCategory(categoryRaw)) return [];
    const candidate = String(data.slug ?? path.basename(file, path.extname(file)));
    let slug: string;
    try {
      slug = assertSafeSlug(candidate);
    } catch {
      return [];
    }
    const visibility = data.visibility === "draft" ? "draft" : "published";
    const kind: HouseKind = data.status === "house" ? "house" : "sample";
    return [
      {
        lane: "house",
        title: String(data.title ?? ""),
        slug,
        body: content,
        date: normalizeDate(String(data.date ?? "")),
        publishState: visibility,
        updatedAt: "",
        updatedBy: null,
        category: categoryRaw as JournalCategory,
        dek: String(data.dek ?? ""),
        excerpt: String(data.excerpt ?? ""),
        author: String(data.author ?? "House"),
        kind,
      },
    ];
  });
}

function assertInside(root: string, target: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (
    resolvedTarget !== resolvedRoot &&
    !resolvedTarget.startsWith(resolvedRoot + path.sep)
  ) {
    throw new Error("Journal path left the content tree.");
  }
}

export function writeStoredToTree(post: StoredPost): void {
  if (post.lane === "overmind") {
    const dir = overmindJournalDir();
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${post.slug}.mdx`);
    assertInside(dir, file);
    fs.writeFileSync(file, serializeOvermindMdx(post), "utf8");
    return;
  }
  if (!post.category || !isJournalCategory(post.category)) {
    throw new Error("House posts need a journal shelf.");
  }
  const dir = path.join(houseJournalDir(), post.category);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${post.slug}.mdx`);
  assertInside(houseJournalDir(), file);
  fs.writeFileSync(file, serializeHouseMdx(post), "utf8");
}

export function treePostKey(post: StoredPost): string {
  if (post.lane === "overmind") return `overmind:${post.slug}`;
  return `house:${post.category}:${post.slug}`;
}
