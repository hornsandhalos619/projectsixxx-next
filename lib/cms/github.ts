import { githubPathFor, mdxToRecord, recordToMdx } from "@/lib/cms/serialize";
import type { CmsRecord, JournalStream } from "@/lib/cms/types";

export function githubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

function repoSlug(): string {
  if (process.env.GITHUB_REPO) return process.env.GITHUB_REPO;
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const name = process.env.VERCEL_GIT_REPO_SLUG;
  if (owner && name) return `${owner}/${name}`;
  return "hornsandhalos619/projectsixxx-next";
}

function branchName(): string {
  return process.env.GITHUB_BRANCH || "main";
}

type ContentItem = {
  name: string;
  path: string;
  type: string;
  sha?: string;
  download_url?: string | null;
};

async function githubFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for GitHub journal storage.");
  }
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function listDirectory(dir: string): Promise<ContentItem[]> {
  const url = `https://api.github.com/repos/${repoSlug()}/contents/${dir}?ref=${encodeURIComponent(branchName())}`;
  const response = await githubFetch(url);
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`GitHub list failed (${response.status}) for ${dir}.`);
  }
  const data = (await response.json()) as ContentItem[] | ContentItem;
  return Array.isArray(data) ? data : [];
}

async function readFile(path: string, stream: JournalStream, category?: string): Promise<CmsRecord | null> {
  const url = `https://api.github.com/repos/${repoSlug()}/contents/${path}?ref=${encodeURIComponent(branchName())}`;
  const response = await githubFetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as { content?: string; encoding?: string; name?: string };
  if (!data.content) return null;
  const raw = Buffer.from(data.content, (data.encoding as BufferEncoding) || "base64").toString("utf8");
  const slug = (data.name ?? path.split("/").pop() ?? "").replace(/\.mdx?$/, "");
  return mdxToRecord(raw, { stream, slug, category });
}

export async function githubList(): Promise<CmsRecord[]> {
  const overmindFiles = await listDirectory("content/overmind/journal");
  const overmind = await Promise.all(
    overmindFiles
      .filter((item) => item.type === "file" && /\.mdx?$/.test(item.name))
      .map((item) => readFile(item.path, "overmind")),
  );

  const houseRoot = await listDirectory("content/journal");
  const houseDirs = houseRoot.filter((item) => item.type === "dir");
  const house: Array<CmsRecord | null> = [];
  for (const dir of houseDirs) {
    const files = await listDirectory(dir.path);
    const parsed = await Promise.all(
      files
        .filter((item) => item.type === "file" && /\.mdx?$/.test(item.name))
        .map((item) => readFile(item.path, "house", dir.name)),
    );
    house.push(...parsed);
  }

  return [...overmind, ...house].filter((record): record is CmsRecord => Boolean(record));
}

async function fileSha(path: string): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${repoSlug()}/contents/${path}?ref=${encodeURIComponent(branchName())}`;
  const response = await githubFetch(url);
  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(`GitHub read failed (${response.status}) for ${path}.`);
  }
  const data = (await response.json()) as { sha?: string };
  return data.sha;
}

export async function githubWrite(record: CmsRecord): Promise<void> {
  const path = githubPathFor(record);
  const sha = await fileSha(path);
  const body = {
    message: `journal: ${record.status} ${record.stream}/${record.slug}`,
    content: Buffer.from(recordToMdx(record), "utf8").toString("base64"),
    branch: branchName(),
    sha,
  };
  const url = `https://api.github.com/repos/${repoSlug()}/contents/${path}`;
  const response = await githubFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub write failed (${response.status}): ${detail.slice(0, 180)}`);
  }
}

export async function githubRemove(record: Pick<CmsRecord, "stream" | "slug" | "category">): Promise<void> {
  const path = githubPathFor(record);
  const sha = await fileSha(path);
  if (!sha) return;
  const url = `https://api.github.com/repos/${repoSlug()}/contents/${path}`;
  const response = await githubFetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `journal: remove ${record.stream}/${record.slug}`,
      sha,
      branch: branchName(),
    }),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`GitHub delete failed (${response.status}) for ${path}.`);
  }
}
