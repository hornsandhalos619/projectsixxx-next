import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "sixxx-journal-"));
process.env.JOURNAL_CONTENT_ROOT = root;
delete process.env.BLOB_READ_WRITE_TOKEN;
delete process.env.VERCEL;

describe("journal store filesystem ledger", () => {
  let allOvermindPosts: typeof import("./overmind-journal").allOvermindPosts;
  let getOvermindPost: typeof import("./overmind-journal").getOvermindPost;
  let allPosts: typeof import("./journal").allPosts;
  let getPost: typeof import("./journal").getPost;
  let saveStoredPost: typeof import("./journal-store").saveStoredPost;

  before(async () => {
    fs.mkdirSync(path.join(root, "content/overmind/journal"), { recursive: true });
    fs.mkdirSync(path.join(root, "content/journal/fine-art"), { recursive: true });
    ({ allOvermindPosts, getOvermindPost } = await import("./overmind-journal"));
    ({ allPosts, getPost } = await import("./journal"));
    ({ saveStoredPost } = await import("./journal-store"));
  });

  after(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("hides Overmind drafts from the public index and shows them after publish", async () => {
    await saveStoredPost({
      lane: "overmind",
      title: "Quiet Door",
      slug: "quiet-door",
      body: "## Field\n\nThe door stays quiet.",
      date: "2026-09-21",
      publishState: "draft",
      updatedAt: "",
      updatedBy: "founder@example.com",
      teaser: "The door stays quiet.",
      tags: ["field-notes"],
    });

    const publicDrafts = await allOvermindPosts();
    assert.equal(publicDrafts.some((post) => post.slug === "quiet-door"), false);
    const adminDraft = await getOvermindPost("quiet-door", { includeDrafts: true });
    assert.equal(adminDraft?.status, "draft");
    assert.equal(adminDraft?.title, "Quiet Door");

    await saveStoredPost({
      lane: "overmind",
      title: adminDraft!.title,
      slug: adminDraft!.slug,
      body: adminDraft!.content,
      date: adminDraft!.date,
      publishState: "published",
      updatedAt: "",
      updatedBy: "founder@example.com",
      teaser: adminDraft!.teaser,
      tags: adminDraft!.tags,
    });

    const published = await getOvermindPost("quiet-door");
    assert.equal(published?.status, "published");
    const index = await allOvermindPosts();
    assert.equal(index.some((post) => post.slug === "quiet-door"), true);
  });

  it("keeps house drafts off public shelves until publish", async () => {
    await saveStoredPost({
      lane: "house",
      title: "Bone and Blade",
      slug: "bone-and-blade",
      body: "## Cut\n\nCraft before consensus.",
      date: "2026-09-21",
      publishState: "draft",
      updatedAt: "",
      updatedBy: "founder@example.com",
      category: "fine-art",
      dek: "A house cut.",
      excerpt: "Craft before consensus.",
      author: "House",
      kind: "house",
    });

    assert.equal(await getPost("fine-art", "bone-and-blade"), undefined);
    const admin = await getPost("fine-art", "bone-and-blade", { includeDrafts: true });
    assert.equal(admin?.visibility, "draft");

    await saveStoredPost({
      lane: "house",
      title: admin!.title,
      slug: admin!.slug,
      body: admin!.content,
      date: admin!.date,
      publishState: "published",
      updatedAt: "",
      updatedBy: "founder@example.com",
      category: "fine-art",
      dek: admin!.dek,
      excerpt: admin!.excerpt,
      author: admin!.author,
      kind: "house",
    });

    const live = await getPost("fine-art", "bone-and-blade");
    assert.equal(live?.visibility, "published");
    const shelves = await allPosts();
    assert.equal(shelves.some((post) => post.slug === "bone-and-blade"), true);
    const file = path.join(root, "content/journal/fine-art/bone-and-blade.mdx");
    assert.equal(fs.existsSync(file), true);
  });

  it("writes Overmind files only under content/overmind/journal", async () => {
    const file = path.join(root, "content/overmind/journal/quiet-door.mdx");
    assert.equal(fs.existsSync(file), true);
    assert.equal(fs.existsSync(path.join(root, "content/journal/overmind")), false);
  });
});
