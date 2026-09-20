import Link from "next/link";
import { site } from "@/config/site";
import { duality, portalArt } from "@/config/duality";
import { housePillars } from "@/config/pillars";
import { PortalCta } from "@/components/PortalCta";
import { SampleBadge } from "@/components/SampleBadge";
import { featuredCollaborators } from "@/lib/artists";
import { allPosts } from "@/lib/journal";
import { shopCategories } from "@/config/affiliates";
import { shopifyUrl } from "@/config/shops";

export default function HomePage() {
  const posts = allPosts().slice(0, 3);
  const collabs = featuredCollaborators();
  const shopTeaser = shopCategories.slice(0, 3);

  return (
    <>
      <section className="hero hero--centered">
        <div className="shell hero-inner">
          {/* Equal Horns + Halos soft logo bed — house statement (Vein Art) stays first */}
          <div className="logo-bed logo-bed--home logo-bed--dual void-glass">
            <div className="logo-bed-split" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-bed-art logo-bed-art--horns" src={portalArt.hornsBg} alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="logo-bed-art logo-bed-art--halos" src={portalArt.halosBg} alt="" />
            </div>
            <div className="logo-bed-veil" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-logo"
              src="/brand/project-sixxx-mark-horns-web.png"
              alt="Project SiXXX"
              width={720}
              height={720}
            />
            {/* Companion wax-seal 6 — secondary to Outerwright mark; does not replace */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-wax-seal"
              src="/brand/wax-seal-6.png"
              alt=""
              width={120}
              height={120}
              aria-hidden
            />
          </div>
          <p className="kicker">The house</p>
          <h1 className="display visually-hidden">Project SiXXX</h1>
          <p className="mood house">{site.mood}</p>
          <p className="lede">
            A house for work that can stand in bad light. Art, music, film,
            literature, fashion, technology, and frontier AI — under one night.
            Horns &amp; Halos is the portal, not a merch rack.
          </p>
        </div>
      </section>

      <section className="section section--centered obsidian-hero" aria-label="Obsidian glass">
        <div className="shell">
          <p className="kicker">Obsidian glass</p>
          <h2 className="display">Horns material</h2>
          <p className="lede" style={{ marginInline: "auto" }}>
            Polished obsidian glass. Crimson fissure base. Void field — sculpture, not a CSS blob.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="obsidian-hero-plate void-fissure"
            src={portalArt.hornsObsidianGlass}
            alt="Obsidian glass horns with crimson fissure base"
            width={1200}
            height={1200}
          />
        </div>
      </section>

      <section className="twin" aria-label="Horns and Halos">
        <div className="shell twin-head" style={{ marginBottom: "1.5rem" }}>
          <p className="kicker">{duality.title}</p>
          <p className="lede">{duality.first}</p>
          <p className="portal-second">{duality.second}</p>
        </div>
        <PortalCta className="gate gate--horns">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gate-art" src={portalArt.hornsBg} alt="" />
          <div className="gate-veil" aria-hidden />
          <span className="label">Horns</span>
          <p className="hint">{duality.hornsStandalone}</p>
        </PortalCta>
        <PortalCta className="gate gate--halos">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="gate-art" src={portalArt.halosBg} alt="" />
          <div className="gate-veil" aria-hidden />
          <span className="label">Halos</span>
          <p className="hint">{duality.halosStandalone}</p>
        </PortalCta>
      </section>

      <section className="strips" aria-label="House surfaces">
        <div className="shell">
          <Link className="strip" href="/journal">
            <span className="name">Journal</span>
            <h2>The cut we keep</h2>
            <p>Craft, commerce, and the quiet tests.</p>
          </Link>
          <Link className="strip" href="/library">
            <span className="name">Library</span>
            <h2>Reading room</h2>
            <p>On-site samples. No fake checkout.</p>
          </Link>
          <Link className="strip" href="/gallery">
            <span className="name">Gallery</span>
            <h2>Roster in the void</h2>
            <p>House first. Collaborators SAMPLE until media lands.</p>
          </Link>
          <a className="strip" href={shopifyUrl} rel="noopener noreferrer" target="_blank">
            <span className="name">Shop</span>
            <h2>Horns &amp; Halos</h2>
            <p>Shopify store — R001 live. Open now.</p>
          </a>
          <Link className="strip" href="/services">
            <span className="name">Services</span>
            <h2>Tech in the dark</h2>
            <p>Web, agents, B2B — sterile bones.</p>
          </Link>
        </div>
      </section>

      <section className="section section--centered" aria-label="Horns chrome sample">
        <div className="shell">
          <div className="parchment-panel void-glass">
            <p className="parchment-title">House lanes</p>
            <ul className="parchment-nav">
              <li><Link href="/journal">Journal</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/library">Library</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="kicker">Collaborators</p>
          <h2>Featured roster</h2>
          <p className="muted">SAMPLE slots — media pending. No invented personal history.</p>
          <div className="grid-2" style={{ marginTop: "1.25rem" }}>
            {collabs.map((artist) => (
              <Link className="card" key={artist.slug} href={`/gallery/${artist.slug}`}>
                <SampleBadge label="SAMPLE" />
                <h3>{artist.name}</h3>
                <p className="muted">{artist.bio}</p>
              </Link>
            ))}
          </div>
          <div className="cta-row">
            <Link className="btn btn-house" href="/gallery">
              Full gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="kicker">Soft launch</p>
          <h2>Horns &amp; Halos store</h2>
          <p className="muted">
            Primary door is Shopify — public shop. Affiliate shelves stay on the house hub.
          </p>
          <div className="grid-2" style={{ marginTop: "1.25rem" }}>
            {shopTeaser.map((cat) => (
              <Link className="card" key={cat.slug} href={`/shop/${cat.slug}`}>
                <h3>{cat.title}</h3>
                <p className="muted">{cat.dek}</p>
              </Link>
            ))}
          </div>
          <div className="cta-row">
            <a
              className="btn btn-ember"
              href={shopifyUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Enter Shopify store
            </a>
            <Link className="btn btn-house" href="/shop">
              House shop hub
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="kicker">Services</p>
          <h2>Tech that can sit next to the art</h2>
          <p className="muted">
            Web design, agentic bots, B2B — and the seven pillars that keep music,
            film, and literature visible beside technology.
          </p>
          <div className="cta-row">
            <Link className="btn btn-house" href="/services">
              Services
            </Link>
            <Link className="btn" href="/schedule">
              Schedule
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="kicker">Journal</p>
          <h2>Recent cuts</h2>
          {posts.length === 0 ? (
            <p className="muted">Shelves are built. Posts arrive as the house sets them.</p>
          ) : (
            <div className="grid-2" style={{ marginTop: "1.25rem" }}>
              {posts.map((post) => (
                <article className="card" key={`${post.category}/${post.slug}`}>
                  {post.status === "sample" ? <SampleBadge /> : null}
                  <p className="kicker">{post.category}</p>
                  <h3>
                    <Link href={`/journal/${post.category}/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="muted">{post.dek}</p>
                </article>
              ))}
            </div>
          )}
          <div className="cta-row">
            <Link className="btn btn-house" href="/journal">
              All shelves
            </Link>
            <Link className="btn btn-silver" href="/overmind/journal">
              Overmind Journal
            </Link>
            <Link className="btn" href="/library">
              Library
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="kicker">Manifesto</p>
          <h2>Est. in Darkness is a date, not a filter.</h2>
          <div className="prose prose--centered">
            <p>
              We do not steal sacred marks. We do not dress the house as a devil
              or a saint. Atmosphere sits over a clean information architecture —
              haunting skin, sterile bones.
            </p>
            <p>
              Fine is a cut: craft before consensus, commerce as weather, the
              quiet tests that survive a name going blank. If it needs a costume
              to be believed, it does not make the night.
            </p>
          </div>
          <p className="kicker" style={{ marginTop: "2rem" }}>
            Seven pillars
          </p>
          <div className="pillars pillars-seven">
            {housePillars.map((pillar) => (
              <article className="pillar" key={pillar.slug}>
                <h3>{pillar.title}</h3>
                <p>{pillar.dek}</p>
              </article>
            ))}
          </div>
          <div className="cta-row">
            <Link className="btn btn-house" href="/journal/fine-art/what-makes-art-fine">
              Read the cut
            </Link>
            <PortalCta className="btn btn-silver">Cross the Threshold</PortalCta>
            <Link className="btn" href="/contact">
              Contact the house
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
