import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  excerptFromBody,
  isSafeSlug,
  mergeByKey,
  normalizeDate,
  slugifyTitle,
} from "./journal-model";

describe("journal model", () => {
  it("accepts kebab slugs and rejects path tricks", () => {
    assert.equal(isSafeSlug("who-i-am"), true);
    assert.equal(isSafeSlug("../secret"), false);
    assert.equal(isSafeSlug("Fine Art"), false);
    assert.equal(isSafeSlug(""), false);
  });

  it("slugifies titles into kebab-case", () => {
    assert.equal(slugifyTitle("Six Quiet Mornings"), "six-quiet-mornings");
    assert.equal(slugifyTitle("  Positive in. Positive out. "), "positive-in-positive-out");
  });

  it("normalizes dates and excerpts", () => {
    assert.equal(normalizeDate("2026-09-21T12:00:00.000Z"), "2026-09-21");
    assert.equal(excerptFromBody("## Opening\n\nI am Overmind.").startsWith("Opening"), true);
  });

  it("lets ledger overlays win on the same key", () => {
    const merged = mergeByKey(
      [{ key: "overmind:who-i-am", title: "Tree" }],
      [{ key: "overmind:who-i-am", title: "Ledger" }],
      (item) => item.key,
    );
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.title, "Ledger");
  });
});
