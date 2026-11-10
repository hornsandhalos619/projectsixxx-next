import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { azazelGalleryUrl, houseSocials, site } from "../config/site";
import { tapestryCollectionHandle, tapestryCollectionUrl } from "../config/shops";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relative: string) {
  return readFileSync(join(root, relative), "utf8");
}

assert.equal(houseSocials.length, 3);
assert.deepEqual(
  houseSocials.map((item) => item.href),
  [
    "https://x.com/horns_halos_619",
    "https://www.facebook.com/six.six.92372",
    azazelGalleryUrl,
  ],
);
assert.equal(azazelGalleryUrl, "https://www.deviantart.com/hornsandhaloshouse");
assert.ok(houseSocials.every((item) => !item.href.includes("utm_")));

const component = read("components/FollowTheHouse.tsx");
assert.ok(component.includes('rel="noopener noreferrer"'));
assert.ok(component.includes('target="_blank"'));
assert.ok(component.includes("Follow the House"));
assert.ok(!/instagram|tiktok|pinterest|youtube|threads/i.test(component));
assert.ok(!component.includes("utm_"));

const home = read("app/page.tsx");
assert.ok(home.includes('spot="home"'));
assert.ok(home.includes("Shop the drop"));
assert.ok(home.includes('tapestryCollectionUrl("home-hero")'));
assert.ok(
  home.includes("A house within darkness that gleams in the light."),
  "existing house intro line must stay",
);
assert.ok(
  home.includes("Horns & Halos are the tool and portal to this house."),
  "existing Horns & Halos intro line must stay",
);

const drop = tapestryCollectionUrl("home-hero");
assert.ok(drop.includes(`/collections/${tapestryCollectionHandle}`));
assert.ok(drop.includes("utm_source=projectsixxx"));
assert.ok(drop.includes("utm_medium=referral"));
assert.ok(drop.includes("utm_campaign=tapestry-drop"));
assert.ok(drop.includes("utm_content=home-hero"));

const portal = read("app/horns-and-halos/page.tsx");
assert.ok(portal.includes('spot="portal"'));
assert.ok(portal.includes('shareMetadata("/horns-and-halos"'));

const journal = read("app/journal/page.tsx");
assert.ok(journal.includes('shareMetadata("/journal"'));

const layout = read("app/layout.tsx");
assert.ok(layout.includes('shareMetadata("/"'));
assert.ok(layout.includes("site.description"));

const css = read("app/globals.css");
assert.ok(css.includes(".follow-house"));
assert.ok(css.includes("var(--silver)"));
assert.ok(css.includes("var(--gold)"));
assert.ok(css.includes("var(--crimson)"));

assert.equal(
  site.description,
  "Project SiXXX is the house. Horns & Halos is a world portal into duality and psyche. Est. in Darkness.",
);

console.log("follow-the-house strip + tapestry drop ok");
