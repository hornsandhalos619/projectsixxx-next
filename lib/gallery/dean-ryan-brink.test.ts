import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { artists, isPublishedArtist, publishedArtists } from "../artists";
import sitemap from "../../app/sitemap";
import ArtistPage, { generateStaticParams } from "../../app/gallery/[artist]/page";
import { site } from "../../config/site";
import { ArtistPageView } from "../../components/ArtistPageView";
import { artistPageCopy, DEAN_RYAN_BRINK_MEMORIAL } from "./page-copy";

const LOCKED_MEMORIAL =
  "Aaron Franklin Brink (November 12, 1974 – May 26, 2023) was a Southern California mixed martial artist known in the cage as “The Frijolero.” Over a professional career that stretched from the late 1990s into the late 2010s, he competed for major promotions including the UFC, WEC, King of the Cage, and RINGS, and fought out of the San Diego area. Aaron was a warrior, a scholar, a role model and a friend. In addition to introducing me to his brother Ryan, his endorsement and support of my work when I was formulating Project Sixxx played an integral role to everything that has followed. He is sorely missed and fondly remembered. If Valhalla exists he surely has a seat at the banquet. May his memory be honored with dignity.";

const ALLOWED_HREFS = new Set([
  "https://deanryaninfo.wixsite.com/deanryanbrink",
  "https://deanryaninfo.wixsite.com/deanryanbrink/tattoogallery",
  "https://www.instagram.com/deanbrinktattoos/",
  "https://deanryaninfo.wixsite.com/deanryanbrink/artgallery",
]);

const BANNED = [
  "Intervention",
  "Pain magazine",
  "Skin and Ink",
  "659-9924",
  "419-4692",
  "deanryaninfo@gmail.com",
  "pancreatic",
  "29–27",
  "29-27",
  "Dick Delaware",
  "Sherdog",
  "wixstatic.com",
];

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: string }).digest ?? "";
  const message = error instanceof Error ? error.message : "";
  return digest.includes("404") || message.includes("404") || message.includes("NEXT_NOT_FOUND");
}

async function main() {
  assert.equal(DEAN_RYAN_BRINK_MEMORIAL, LOCKED_MEMORIAL);
  assert.equal(artistPageCopy("dean-ryan-brink")?.memorial, LOCKED_MEMORIAL);

  const dean = artists.find((entry) => entry.slug === "dean-ryan-brink");
  assert.ok(dean, "seed must keep Dean Ryan Brink");
  assert.equal(dean.status, "sample");
  assert.equal(dean.published, false);
  assert.equal(dean.mediaPending, true);
  assert.equal(dean.email, "");
  assert.equal(isPublishedArtist(dean), false);
  assert.ok(!publishedArtists().some((entry) => entry.slug === "dean-ryan-brink"));

  const staticParams = generateStaticParams();
  assert.ok(
    !staticParams.some((param) => param.artist === "dean-ryan-brink"),
    "generateStaticParams must omit unpublished Dean Ryan Brink",
  );

  const entries = await sitemap();
  assert.ok(
    !entries.some((item) => item.url === `${site.url}/gallery/dean-ryan-brink`),
    "sitemap must omit /gallery/dean-ryan-brink until published",
  );

  try {
    await ArtistPage({ params: Promise.resolve({ artist: "christian-boye-larsen" }) });
    throw new Error("expected notFound for unpublished stub without page copy");
  } catch (error) {
    assert.ok(isNotFound(error), `stub collaborator must notFound, got ${String(error)}`);
  }

  const copy = artistPageCopy("dean-ryan-brink");
  assert.ok(copy);
  const markup = renderToStaticMarkup(createElement(ArtistPageView, { artist: dean, copy }));
  assert.ok(
    markup.includes(LOCKED_MEMORIAL),
    "artist page must render the locked memorial paragraph verbatim",
  );
  assert.ok(!markup.includes("[CURATOR INFERENCE]"));
  assert.ok(markup.includes("House still pending"));
  assert.ok(!markup.includes("<img"), "page must not embed or hotlink artwork images");
  assert.equal(dean.images?.length, 6, "seed holds six placeholder gallery stills");
  const credit = "© Dean Ryan Brink, shown with permission";
  for (const image of dean.images ?? []) {
    assert.equal(image.src, undefined, "placeholder stills must not carry a src");
    assert.equal(image.credit, credit);
  }
  assert.equal(
    markup.split(credit).length - 1,
    6,
    "every gallery still must render its credit line",
  );
  assert.ok(markup.includes('rel="noopener"'));
  assert.ok(markup.includes('target="_blank"'));

  for (const phrase of BANNED) {
    assert.ok(!markup.includes(phrase), `page must keep ${phrase} off the public copy`);
  }

  const hrefs = [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (href.startsWith("mailto:")) {
      throw new Error("page must not publish an email address");
    }
    if (href.startsWith("/")) continue;
    assert.ok(ALLOWED_HREFS.has(href), `unexpected outbound href ${href}`);
  }

  const previousVercelEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";
  try {
    await ArtistPage({ params: Promise.resolve({ artist: "dean-ryan-brink" }) });
    throw new Error("expected notFound for unpublished artist in production");
  } catch (error) {
    assert.ok(isNotFound(error), `production unpublished must notFound, got ${String(error)}`);
  }

  process.env.VERCEL_ENV = "preview";
  const preview = await ArtistPage({ params: Promise.resolve({ artist: "dean-ryan-brink" }) });
  assert.equal(preview.type, ArtistPageView);
  assert.equal(preview.props.artist.slug, "dean-ryan-brink");
  assert.equal(preview.props.copy?.memorial, LOCKED_MEMORIAL);

  if (previousVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = previousVercelEnv;

  const page = await ArtistPage({ params: Promise.resolve({ artist: "dean-ryan-brink" }) });
  assert.equal(page.type, ArtistPageView);
  assert.equal(page.props.artist.slug, "dean-ryan-brink");
  assert.equal(page.props.copy?.memorial, LOCKED_MEMORIAL);

  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const viewSource = readFileSync(join(root, "components/ArtistPageView.tsx"), "utf8");
  assert.ok(viewSource.includes("mediaPending"), "pending media state stays on the artist view");
  assert.ok(viewSource.includes('rel="noopener"'));
  assert.ok(viewSource.includes('target="_blank"'));

  const copySource = readFileSync(join(root, "lib/gallery/page-copy.ts"), "utf8");
  assert.ok(copySource.includes(LOCKED_MEMORIAL), "page-copy module must hold the locked memorial");

  console.log("dean ryan brink gallery page ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
