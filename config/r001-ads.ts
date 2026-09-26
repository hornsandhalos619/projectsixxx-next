/**
 * R001 production cuts. Host H.264 as-is under public/ads/r001/
 * or set NEXT_PUBLIC_R001_ADS_BASE to a Vercel Blob / CDN folder
 * that contains the same filenames.
 *
 * Drop path (preferred): public/ads/r001/<file>
 * Founder must replace stand-in still-films with the production binaries
 * when those files land — keep the filenames and H.264 codec.
 */
export type R001Cut = {
  id: string;
  file: string;
  title: string;
  shortLabel: string;
  dek: string;
  width: number;
  height: number;
  durationSec: number;
};

export const r001Ads = [
  {
    id: "hero-duality",
    file: "r001-hero-duality-reels-1080x1920-15s.mp4",
    title: "Hero duality",
    shortLabel: "Hero duality",
    dek: "Twin gates. One night. Horns and Halos in a single cut.",
    width: 1080,
    height: 1920,
    durationSec: 15,
  },
  {
    id: "six-marks",
    file: "r001-six-marks-reels-1080x1920-18s.mp4",
    title: "Six marks",
    shortLabel: "Six marks",
    dek: "The house mark, held in frame.",
    width: 1080,
    height: 1920,
    durationSec: 18,
  },
  {
    id: "feed-4x5",
    file: "r001-feed-4x5-1080x1350-15s.mp4",
    title: "Feed 4×5",
    shortLabel: "Feed 4×5",
    dek: "R001 on the body. The editorial cut.",
    width: 1080,
    height: 1350,
    durationSec: 15,
  },
  {
    id: "square",
    file: "r001-square-1080x1080-12s.mp4",
    title: "Square",
    shortLabel: "Square",
    dek: "The square cut. Ready for the feed.",
    width: 1080,
    height: 1080,
    durationSec: 12,
  },
  {
    id: "horns-lane",
    file: "r001-horns-lane-reels-1080x1920-13s.mp4",
    title: "Horns lane",
    shortLabel: "Horns",
    dek: "Infinite Conflict.",
    width: 1080,
    height: 1920,
    durationSec: 13,
  },
  {
    id: "halos-lane",
    file: "r001-halos-lane-reels-1080x1920-13s.mp4",
    title: "Halos lane",
    shortLabel: "Halos",
    dek: "Eternal Balance.",
    width: 1080,
    height: 1920,
    durationSec: 13,
  },
] as const satisfies readonly R001Cut[];

export type R001AdId = (typeof r001Ads)[number]["id"];

/** sessionStorage flag — one splash per browser session. */
export const R001_SPLASH_STORAGE_KEY = "projectsixxx.r001.splash.dismissed";

/** Locked rotation: UTC calendar date, one cut per two-day pair. */
export const R001_ROTATION_ZONE = "UTC";
export const R001_ROTATION_DAYS = 2;

export function utcCalendarDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000,
  );
}

export function r001PairIndex(
  date: Date = new Date(),
  count: number = r001Ads.length,
): number {
  if (count <= 0) return 0;
  return Math.floor(utcCalendarDayNumber(date) / R001_ROTATION_DAYS) % count;
}

export function r001SplashCut(date: Date = new Date()): R001Cut {
  return r001Ads[r001PairIndex(date, r001Ads.length)]!;
}

/** Public src. Trailing slash on the env base is ignored. */
export function r001PublicSrc(cut: Pick<R001Cut, "file">): string {
  const base = (process.env.NEXT_PUBLIC_R001_ADS_BASE ?? "").trim().replace(/\/$/, "");
  return base ? `${base}/${cut.file}` : `/ads/r001/${cut.file}`;
}

export function r001DeskPath(pathname: string): boolean {
  return (
    pathname === "/signin" ||
    pathname === "/signout" ||
    pathname === "/login" ||
    pathname === "/account" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api")
  );
}
