import assert from "node:assert/strict";
import { artists } from "../artists";
import { isMissingPublishedColumnError, seedPublishedFallback } from "./published-column";

assert.equal(isMissingPublishedColumnError(null), false);
assert.equal(
  isMissingPublishedColumnError({
    code: "PGRST204",
    message: "Could not find the 'published' column of 'artists' in the schema cache",
  }),
  true,
);
assert.equal(
  isMissingPublishedColumnError({
    code: "42703",
    message: 'column artists.published does not exist',
  }),
  true,
);
assert.equal(
  isMissingPublishedColumnError({
    message: "Could not find the 'published' column of 'artists' in the schema cache",
  }),
  true,
);
assert.equal(
  isMissingPublishedColumnError({ code: "42501", message: "permission denied" }),
  false,
);

const overlay = [
  { slug: "project-sixxx", name: "Overlay House", role: "House", status: "house" as const, bio: "overlay", email: "", social: [], store: [], works: [] },
  { slug: "eliot-kohek", name: "Eliot Kohek", role: "Collaborator", status: "sample" as const, bio: "overlay", email: "", social: [], store: [], works: [] },
  { slug: "brand-new-guest", name: "Guest", role: "Collaborator", status: "sample" as const, bio: "new", email: "", social: [], store: [], works: [] },
];

const gated = seedPublishedFallback(overlay, artists);
assert.equal(gated.find((item) => item.slug === "project-sixxx")?.published, true);
assert.equal(gated.find((item) => item.slug === "eliot-kohek")?.published, false);
assert.equal(gated.find((item) => item.slug === "brand-new-guest")?.published, false);

console.log("published-column overlay fallback ok");
