import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Studio",
  description: "House marketing kit — ad concepts and HeyGen script stubs. Not homepage spam.",
};

const adConcepts = [
  {
    title: "Twin Gates — silent cut",
    body: "Void frame. Two gates as architecture and light. Title card: Project SiXXX · Est. in Darkness. No costume devil. CTA: Enter the portal.",
  },
  {
    title: "Craft before consensus",
    body: "Still of a working tool (neck, lens, page). Super: Fine is a cut. Belief line, then Shop or Library — never both at once.",
  },
  {
    title: "San Diego night",
    body: "Local darkness without poverty-porn. Neighborhood light only. Soft CTA to Journal · San Diego.",
  },
  {
    title: "Wearable silver",
    body: "One garment, one body. Silver metal language for Horns & Halos. Outbound only when SHOPIFY_URL or SPREADSHOP_URL is live.",
  },
  {
    title: "Public light",
    body: "Research literacy spot. On-screen rule: public sources only. Point to /links. Never a how-to for harm.",
  },
];

const heygenScripts = [
  {
    title: "House open",
    body: "VO: Project SiXXX is the house. Est. in Darkness. We keep craft before consensus and a portal that is not a merch rack. Visual: void, grain, twin gates. End card: projectsixxx.com",
  },
  {
    title: "Portal invite",
    body: "VO: Horns and Halos — duality as discipline. Two gates. One choice. Visual: ribs that never meet; broken oculus. CTA: Cross the Threshold.",
  },
  {
    title: "Library sample",
    body: "VO: The reading room is open. SAMPLE titles. No fake checkout. Visual: catalog cards, Read sample. CTA: /library",
  },
];

export default function StudioPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Studio</p>
        <h1>House marketing kit</h1>
        <p className="lede">
          Five ad concepts and three HeyGen script stubs for house use. Kept off
          the homepage on purpose — Vein Art house-first stays intact.
        </p>
      </header>

      <section className="section">
        <p className="kicker">Ad concepts</p>
        <div className="grid-2">
          {adConcepts.map((ad) => (
            <article className="card" key={ad.title}>
              <h2>{ad.title}</h2>
              <p className="muted">{ad.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="kicker">HeyGen scripts</p>
        <div className="grid-2">
          {heygenScripts.map((s) => (
            <article className="card" key={s.title}>
              <h2>{s.title}</h2>
              <p className="muted">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="cta-row">
        <Link className="btn" href="/">
          Back to house
        </Link>
        <Link className="btn" href="/links">
          Resource links
        </Link>
      </div>
    </div>
  );
}
