import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { primaryNav } from "../../config/site";
import { canModerate, canSpeak } from "./access";
import { BOARD_CATEGORIES } from "./categories";
import { boardCopy, RATE_LIMIT } from "./copy";
import { isMissingRelation } from "./document";
import { createMemoryBoardStore } from "./memory";
import { applyThreadModeration, submitReply, submitThread } from "./post";
import { repliesForViewer, sortThreads, threadsForViewer } from "./present";
import { createRateGate } from "./rate";
import { displayPlain, validateReplyBody, validateTitle } from "./text";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

async function main() {
  assert.equal(canSpeak("anon"), false);
  assert.equal(canSpeak("member"), true);
  assert.equal(canSpeak("founder"), true);
  assert.equal(canSpeak("blog_admin"), true);
  assert.equal(canModerate("founder"), true);
  assert.equal(canModerate("member"), false);
  assert.equal(canModerate("blog_admin"), false);

  assert.equal(validateTitle("  The vault  ").ok, true);
  assert.equal(validateTitle("Hi").ok, false);
  assert.equal(validateTitle("<script>alert(1)</script>").ok, false);
  if (!validateTitle("<b>no</b>").ok) {
    assert.equal(validateTitle("<b>no</b>").ok, false);
  }
  const marked = validateTitle("Horns < Halos");
  assert.equal(marked.ok, false);
  if (!marked.ok) assert.equal(marked.error, boardCopy.markup);
  assert.equal(validateReplyBody("").ok, false);
  assert.equal(validateReplyBody("A reply.").ok, true);
  assert.equal(displayPlain("safe <em>text</em>"), "safe emtext/em");
  assert.equal(displayPlain("line\u0000break"), "linebreak");

  const store = createMemoryBoardStore();
  const gate = createRateGate();
  const accountId = "11111111-1111-4111-8111-111111111111";
  const now = Date.parse("2026-11-23T09:00:00.000Z");

  const created = await submitThread({
    store,
    accountId,
    role: "member",
    title: "The vault is open",
    body: "Plain words under the vault.\n\nNo markup.",
    category: "great-hall",
    now,
    gate,
  });
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("thread create failed");

  const rejected = await submitThread({
    store,
    accountId,
    role: "anon",
    title: "Should not land",
    body: "A visitor does not speak.",
    category: "forge",
    now: now + 1,
    gate,
  });
  assert.equal(rejected.ok, false);

  const html = await submitThread({
    store,
    accountId,
    role: "member",
    title: "Clean title",
    body: "<p>injected</p>",
    category: "gallery-art",
    now: now + 2,
    gate,
  });
  assert.equal(html.ok, false);
  if (!html.ok) assert.equal(html.error, boardCopy.markup);

  const reply = await submitReply({
    store,
    accountId,
    role: "member",
    threadId: created.id,
    body: "The floor heard you.",
    now: now + 3,
    gate,
  });
  assert.equal(reply.ok, true);

  const pinned = await applyThreadModeration({
    store,
    role: "founder",
    threadId: created.id,
    intent: "pin",
  });
  assert.equal(pinned.ok, true);
  const memberMove = await applyThreadModeration({
    store,
    role: "member",
    threadId: created.id,
    intent: "hide",
  });
  assert.equal(memberMove.ok, false);
  if (!memberMove.ok) assert.equal(memberMove.error, boardCopy.founderOnly);

  const later = await submitThread({
    store,
    accountId,
    role: "shop_admin",
    title: "A later mark",
    body: "This one is newer and unpinned.",
    category: "forge",
    now: now + 4,
    gate,
  });
  assert.equal(later.ok, true);
  if (!later.ok) throw new Error("later thread failed");

  const snapshot = await store.read();
  const ordered = sortThreads(snapshot.threads);
  assert.equal(ordered[0]?.id, created.id, "pinned thread leads");
  assert.equal(threadsForViewer(snapshot.threads, "anon", "forge").length, 1);
  assert.equal(repliesForViewer(snapshot.replies, created.id, "member").length, 1);

  const hidden = await applyThreadModeration({
    store,
    role: "founder",
    threadId: later.id,
    intent: "hide",
  });
  assert.equal(hidden.ok, true);
  const afterHide = await store.read();
  assert.equal(threadsForViewer(afterHide.threads, "member").some((row) => row.id === later.id), false);
  assert.equal(threadsForViewer(afterHide.threads, "founder").some((row) => row.id === later.id), true);

  const memberPeek = await submitReply({
    store,
    accountId,
    role: "member",
    threadId: later.id,
    body: "I should not see this.",
    now: now + 5,
    gate,
  });
  assert.equal(memberPeek.ok, false);
  if (!memberPeek.ok) assert.equal(memberPeek.error, boardCopy.missingThread);

  const sealed = await applyThreadModeration({
    store,
    role: "founder",
    threadId: created.id,
    intent: "lock",
  });
  assert.equal(sealed.ok, true);
  const sealedReply = await submitReply({
    store,
    accountId,
    role: "founder",
    threadId: created.id,
    body: "Even the Founder waits when a thread is locked.",
    now: now + 6,
    gate,
  });
  assert.equal(sealedReply.ok, false);
  if (!sealedReply.ok) assert.equal(sealedReply.error, boardCopy.sealed);

  const burst = createMemoryBoardStore();
  const burstGate = createRateGate();
  for (let index = 0; index < RATE_LIMIT; index += 1) {
    const result = await submitThread({
      store: burst,
      accountId,
      role: "member",
      title: `Mark ${index + 1} on the floor`,
      body: "A measured word.",
      category: "shop-releases",
      now: now + 1000 + index,
      gate: burstGate,
    });
    assert.equal(result.ok, true, `post ${index + 1} should land`);
  }
  const slowed = await submitThread({
    store: burst,
    accountId,
    role: "member",
    title: "One word too many",
    body: "The hall should refuse this.",
    category: "great-hall",
    now: now + 2000,
    gate: burstGate,
  });
  assert.equal(slowed.ok, false);
  if (!slowed.ok) assert.equal(slowed.error, boardCopy.slowDown);

  assert.equal(isMissingRelation({ code: "PGRST205", message: "schema cache" }), true);
  assert.equal(isMissingRelation({ code: "42P01", message: 'relation "board_threads" does not exist' }), true);
  assert.equal(isMissingRelation(new Error("permission denied")), false);

  assert.equal(BOARD_CATEGORIES.length, 4);
  assert.deepEqual(
    BOARD_CATEGORIES.map((hall) => hall.title),
    ["The Great Hall", "Gallery & Art", "The Forge", "Shop & Releases"],
  );
  assert.ok(primaryNav.some((item) => item.href === "/board" && item.label === "Board"));

  const migration = read("supabase/migrations/0005_house_board.sql");
  for (const needle of [
    "board_threads",
    "board_replies",
    "author_account_id",
    "pinned",
    "locked",
    "hidden",
    "enable row level security",
    "great-hall",
    "gallery-art",
    "forge",
    "shop-releases",
  ]) {
    assert.ok(migration.includes(needle), `migration missing ${needle}`);
  }

  const live = read("lib/board/store.ts");
  const picker = live.slice(live.indexOf("export function liveBoardStore"));
  assert.ok(picker.indexOf("supabaseConfigured") < picker.indexOf("neonConfigured"));
  assert.ok(picker.indexOf("neonConfigured") < picker.indexOf("blobAccountsConfigured"));
  assert.ok(picker.indexOf("blobAccountsConfigured") < picker.indexOf("localAllowed"));
  assert.ok(live.includes("missing: true"));

  const files = [
    "app/board/page.tsx",
    "app/board/new/page.tsx",
    "app/board/[id]/page.tsx",
    "components/BoardText.tsx",
    "components/BoardComposer.tsx",
    "components/BoardReplyForm.tsx",
    "components/BoardModeration.tsx",
    "lib/board/actions.ts",
    "lib/board/copy.ts",
    "config/site.ts",
  ];
  const banned = /\b(christmas|christ|jesus|gospel|nativity|easter)\b/i;
  for (const file of files) {
    const source = read(file);
    assert.equal(source.includes("dangerouslySetInnerHTML"), false, `${file} must not inject HTML`);
    assert.equal(banned.test(source), false, `${file} must stay clear of doctrine and Christmas`);
  }
  assert.ok(read("components/BoardText.tsx").includes("displayPlain"));
  assert.ok(read("lib/board/actions.ts").includes('"use server"'));
  assert.ok(read("components/Header.tsx").includes("primaryNav") || read("config/site.ts").includes('href: "/board"'));

  const boardDir = readdirSync(join(root, "app/board"), { recursive: true }).join("\n");
  assert.equal(banned.test(boardDir), false);

  console.log("house board ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
