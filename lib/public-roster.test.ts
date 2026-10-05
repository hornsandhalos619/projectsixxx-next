import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  artists,
  isFeaturedArtist,
  isPublishedArtist,
  publishedArtists,
} from "./artists";
import { isFeaturedRosterEnabled } from "./gallery/flags";

const hiddenNames = [
  "Christian Boye Larsen",
  "Eliot Kohek",
  "The Murray Brothers",
  "Jesse Levitt",
  "Dean Ryan Brink",
];

assert.equal(isFeaturedRosterEnabled(), false, "featured roster flag must default off");

for (const name of hiddenNames) {
  const artist = artists.find((entry) => entry.name === name);
  assert.ok(artist, `seed must keep ${name}`);
  assert.equal(artist.published, false, `${name} must stay unpublished until they approve`);
  assert.ok(isFeaturedArtist(artist), `${name} stays in the featured seed for a later return`);
  assert.equal(isPublishedArtist(artist), false);
}

const publicRoster = publishedArtists();
assert.ok(publicRoster.every((artist) => artist.role === "House"));
for (const name of hiddenNames) {
  assert.ok(
    !publicRoster.some((artist) => artist.name === name),
    `${name} must not be in the public roster`,
  );
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = readFileSync(join(root, "app/page.tsx"), "utf8");
assert.ok(
  home.includes("isFeaturedRosterEnabled"),
  "homepage must gate the featured roster behind the flag",
);
assert.ok(
  /showRoster \? listFeaturedArtists\(\) : Promise\.resolve\(\[\]\)/.test(home),
  "homepage must not fetch featured artists when the flag is off",
);
assert.ok(
  /collabs\.length \? \(/.test(home),
  "homepage must omit the roster section when the list is empty",
);

console.log("public roster gate ok");
