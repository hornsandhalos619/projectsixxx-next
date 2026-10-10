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
import { artistPageCopy } from "./page-copy";

const SLUGS = [
  "christian-boye-larsen",
  "eliot-kohek",
  "jesse-levitt",
  "rob-borbas",
] as const;

const ALLOWED_HREFS: Record<(typeof SLUGS)[number], Set<string>> = {
  "christian-boye-larsen": new Set([
    "https://www.instagram.com/boyetattoo/",
    "https://dropout.dk/artists/boye/",
    "https://www.threads.com/@boyetattoo",
    "https://www.tattoodo.com/artists/christian_boye_1",
  ]),
  "eliot-kohek": new Set([
    "https://kohek.com/",
    "https://www.instagram.com/eliot.kohek/",
    "https://inkppl.com/en/user/eliot.kohek",
  ]),
  "jesse-levitt": new Set([
    "https://jesselevitt.com/",
    "https://instagram.com/jesselevitt",
    "https://www.instagram.com/darkspaceartcollective/",
    "https://jesselevitt.com/shop/",
    "https://jesselevitt.com/tattoos/",
    "https://jesselevitt.com/paintings/",
  ]),
  "rob-borbas": new Set([
    "https://www.facebook.com/theartofgrindesign/",
    "https://www.tattoolifestore.com/product/incubus-the-art-of-grindesign-by-robert-borbas/",
    "https://www.rockvilag.hu/hirek/soilwork-az-augusztus-vegen-megjeleno-lemez-boritojat-borbas-robi-keszitette/",
    "https://hypeandhyper.com/the-first-book-on-the-art-of-a-hungarian-tattooist-grindesign/",
  ]),
};

const BANNED: Record<(typeof SLUGS)[number], string[]> = {
  "christian-boye-larsen": [
    "Vesterbrogade",
    "boyetattoo.com",
    "world-renowned",
    "Ink Link",
    "Roskilde",
    "Delete my search history",
    "boyetattooshorts",
    "mailing-list",
    "hourly",
  ],
  "eliot-kohek": [
    "Body Luxe",
    "Icons & Prodigies",
    "art school",
    "most talented",
    "visa",
    "clothing-brand",
    "clothing brand",
  ],
  "jesse-levitt": [
    "Tattoo Master",
    "Omega Magazine",
    "Tattoo Society",
    "H2Ocean",
    "Villain Arts",
    "State St",
    "COVID",
    "deposit",
    "day rate",
  ],
  "rob-borbas": [
    "grindesign_tattoo",
    "instagram.com/grindesign",
    "Metallica",
    "Sharon Tate",
    "Grimmy",
    "Kwadron",
    "TattooMe",
    "anxiety",
    "theartofgrindesign.com",
  ],
};

const HEDGING = [
  "[CURATOR INFERENCE]",
  "This is a fit judgment from public materials.",
  "This is a fit judgment drawn from public portfolios and interviews.",
  "This is a fit judgment drawn from public portfolios and press.",
  "This is a fit judgment drawn from public portfolios, books and press.",
];

const FORBIDDEN_COPY = /\bnot\b|\bno\b|\bnever\b|\bwithout\b|n't/i;

function htmlText(markup: string): string {
  return markup
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: string }).digest ?? "";
  const message = error instanceof Error ? error.message : "";
  return digest.includes("404") || message.includes("404") || message.includes("NEXT_NOT_FOUND");
}

function publicCopyStrings(slug: (typeof SLUGS)[number]): string[] {
  const artist = artists.find((entry) => entry.slug === slug);
  assert.ok(artist);
  const copy = artistPageCopy(slug);
  assert.ok(copy);
  return [
    artist.bio,
    ...artist.works.flatMap((work) => [work.title, work.year, work.medium, work.caption]),
    ...artist.social.map((item) => item.label),
    ...artist.store.map((item) => item.label),
    copy.kicker,
    copy.profile,
    copy.whySelected,
    ...copy.skills.flatMap((skill) => [skill.title, skill.detail]),
  ];
}

async function expectNotFound(slug: string, label: string): Promise<void> {
  try {
    await ArtistPage({ params: Promise.resolve({ artist: slug }) });
    throw new Error(`expected notFound for ${label}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("expected notFound")) throw error;
    assert.ok(isNotFound(error), `${label} must notFound, got ${String(error)}`);
  }
}

async function main() {
  const murray = artists.find((entry) => entry.slug === "murray-brothers");
  assert.ok(murray, "Murray Brothers seed stays in place");
  assert.equal(murray.bio.startsWith("Named collaborator slot"), true);
  assert.equal(murray.works.length, 0);
  assert.equal(artistPageCopy("murray-brothers"), undefined);

  const staticParams = generateStaticParams();
  const entries = await sitemap();
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const gallerySource = readFileSync(join(root, "app/gallery/page.tsx"), "utf8");
  assert.ok(
    gallerySource.includes("listPublishedArtists"),
    "/gallery must read the published roster only",
  );

  const previousVercelEnv = process.env.VERCEL_ENV;

  for (const slug of SLUGS) {
    const artist = artists.find((entry) => entry.slug === slug);
    assert.ok(artist, `seed must keep ${slug}`);
    assert.equal(artist.status, "sample");
    assert.equal(artist.published, false);
    assert.equal(artist.mediaPending, true);
    assert.equal(artist.featured, true);
    assert.equal(artist.email, "");
    assert.equal(isPublishedArtist(artist), false);
    assert.ok(!publishedArtists().some((entry) => entry.slug === slug));
    assert.ok(
      !staticParams.some((param) => param.artist === slug),
      `generateStaticParams must omit unpublished ${slug}`,
    );
    assert.ok(
      !entries.some((item) => item.url === `${site.url}/gallery/${slug}`),
      `sitemap must omit /gallery/${slug} until published`,
    );
    assert.ok(
      !publishedArtists().some((entry) => entry.slug === slug),
      `/gallery roster must omit ${slug}`,
    );
    assert.ok(!artist.images?.length, `${slug} uses placeholder frames only`);
    assert.equal(artist.works.length % 2, 1, `${slug} keeps an odd last work tile to center`);
    for (const work of artist.works) {
      assert.equal(work.mediaUrl, undefined, `${slug} works stay link-out only`);
      assert.ok(work.href, `${slug} work ${work.title} needs an outbound href`);
    }

    const copy = artistPageCopy(slug);
    assert.ok(copy, `${slug} needs page copy`);
    const markup = renderToStaticMarkup(createElement(ArtistPageView, { artist, copy }));
    const text = htmlText(markup);
    assert.ok(!text.includes("[CURATOR INFERENCE]"));
    for (const phrase of HEDGING) {
      assert.ok(!text.includes(phrase), `${slug} must drop hedging: ${phrase}`);
    }
    assert.ok(markup.includes("House still pending"));
    assert.ok(!markup.includes("<img"), `${slug} must not embed or hotlink artwork images`);
    assert.ok(markup.includes('rel="noopener"'));
    assert.ok(markup.includes('target="_blank"'));
    assert.ok(text.includes(copy.whySelected), `${slug} must render why-selected copy`);

    for (const phrase of publicCopyStrings(slug)) {
      const hit = phrase.match(FORBIDDEN_COPY);
      assert.equal(hit, null, `${slug} public copy forbids ${hit?.[0] ?? ""} in: ${phrase}`);
    }

    for (const phrase of BANNED[slug]) {
      assert.ok(!markup.includes(phrase), `${slug} must keep ${phrase} off the public copy`);
    }

    const hrefs = [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    for (const href of hrefs) {
      if (href.startsWith("mailto:")) {
        throw new Error(`${slug} must not publish an email address`);
      }
      if (href.startsWith("/")) continue;
      assert.ok(ALLOWED_HREFS[slug].has(href), `${slug} unexpected outbound href ${href}`);
    }
  }

  const jesseMarkup = renderToStaticMarkup(
    createElement(ArtistPageView, {
      artist: artists.find((entry) => entry.slug === "jesse-levitt")!,
      copy: artistPageCopy("jesse-levitt"),
    }),
  );
  assert.ok(jesseMarkup.includes("official bio"), "Jesse page attributes Burlington to the official bio");
  assert.ok(jesseMarkup.includes("Burlington, Vermont"));

  const robMarkup = renderToStaticMarkup(
    createElement(ArtistPageView, {
      artist: artists.find((entry) => entry.slug === "rob-borbas")!,
      copy: artistPageCopy("rob-borbas"),
    }),
  );
  assert.ok(!/instagram/i.test(robMarkup), "Rob Borbas page omits Instagram until the handle is confirmed");

  process.env.VERCEL_ENV = "production";
  for (const slug of SLUGS) {
    await expectNotFound(slug, `unpublished ${slug} in production`);
  }

  process.env.VERCEL_ENV = "preview";
  for (const slug of SLUGS) {
    const preview = await ArtistPage({ params: Promise.resolve({ artist: slug }) });
    assert.equal(preview.type, ArtistPageView);
    assert.equal(preview.props.artist.slug, slug);
    assert.ok(preview.props.copy);
    assert.ok(!String(preview.props.copy.whySelected).includes("[CURATOR INFERENCE]"));
  }

  if (previousVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = previousVercelEnv;

  await expectNotFound("murray-brothers", "unpublished Murray Brothers stub without page copy");

  const styles = readFileSync(join(root, "app/globals.css"), "utf8");
  assert.ok(
    styles.includes(".works .work:last-child:nth-child(odd)"),
    "works grid centers an odd last tile",
  );

  console.log("collaborator gallery pages ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
