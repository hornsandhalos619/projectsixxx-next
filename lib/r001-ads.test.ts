import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  R001_ROTATION_DAYS,
  R001_ROTATION_ZONE,
  r001Ads,
  r001DeskPath,
  r001PairIndex,
  r001PublicSrc,
  r001SplashCut,
  utcCalendarDayNumber,
} from "../config/r001-ads";

assert.equal(r001Ads.length, 6);
assert.equal(R001_ROTATION_DAYS, 2);
assert.equal(R001_ROTATION_ZONE, "UTC");
assert.ok(r001Ads.every((cut) => cut.file.endsWith(".mp4")));
assert.deepEqual(
  r001Ads.map((cut) => cut.file),
  [
    "r001-hero-duality-reels-1080x1920-15s.mp4",
    "r001-six-marks-reels-1080x1920-18s.mp4",
    "r001-feed-4x5-1080x1350-15s.mp4",
    "r001-square-1080x1080-12s.mp4",
    "r001-horns-lane-reels-1080x1920-13s.mp4",
    "r001-halos-lane-reels-1080x1920-13s.mp4",
  ],
);

assert.equal(utcCalendarDayNumber(new Date("1970-01-01T12:00:00.000Z")), 0);
assert.equal(r001PairIndex(new Date("1970-01-01T00:00:00.000Z")), 0);
assert.equal(r001PairIndex(new Date("1970-01-02T23:59:59.999Z")), 0);
assert.equal(r001PairIndex(new Date("1970-01-03T00:00:00.000Z")), 1);

const pairStart = new Date("2026-09-26T00:00:00.000Z");
const pairEnd = new Date("2026-09-27T23:59:59.999Z");
const nextPair = new Date("2026-09-28T00:00:00.000Z");
assert.equal(r001PairIndex(pairStart), r001PairIndex(pairEnd));
assert.notEqual(r001PairIndex(pairStart), r001PairIndex(nextPair));
assert.equal(r001SplashCut(pairStart).id, r001SplashCut(pairEnd).id);

const seen = new Set<number>();
for (let i = 0; i < 12; i += 1) {
  seen.add(r001PairIndex(new Date(Date.UTC(2026, 0, 1 + i * 2))));
}
assert.equal(seen.size, 6);

assert.equal(
  r001PublicSrc(r001Ads[0]!),
  "/ads/r001/r001-hero-duality-reels-1080x1920-15s.mp4",
);

const priorBase = process.env.NEXT_PUBLIC_R001_ADS_BASE;
process.env.NEXT_PUBLIC_R001_ADS_BASE = "https://cdn.example.com/ads/r001/";
assert.equal(
  r001PublicSrc(r001Ads[0]!),
  "https://cdn.example.com/ads/r001/r001-hero-duality-reels-1080x1920-15s.mp4",
);
if (priorBase === undefined) delete process.env.NEXT_PUBLIC_R001_ADS_BASE;
else process.env.NEXT_PUBLIC_R001_ADS_BASE = priorBase;

assert.equal(r001DeskPath("/"), false);
assert.equal(r001DeskPath("/shop"), false);
assert.equal(r001DeskPath("/admin"), true);
assert.equal(r001DeskPath("/admin/journal"), true);
assert.equal(r001DeskPath("/signin"), true);
assert.equal(r001DeskPath("/account"), true);

for (const cut of r001Ads) {
  const path = join(process.cwd(), "public/ads/r001", cut.file);
  assert.ok(existsSync(path), `missing hosted cut ${cut.file}`);
}

console.log("r001 ads ok");
