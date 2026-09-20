import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canSeeHouseAdmin } from "@/config/roles";
import { hornsAndHalosLiveUrl, site } from "@/config/site";
import { shopifyUrl, spreadshopUrl } from "@/config/shops";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "House console" };

export default async function AdminHousePage() {
  const viewer = await getViewer();
  if (!canSeeHouseAdmin(viewer.role)) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">House console</p>
        <h1>Founder</h1>
        <p className="lede">
          Roles are assigned here later. Founder is seeded only from
          FOUNDER_EMAILS. There is no self-serve switcher on this page.
        </p>
      </header>

      <div className="admin-note">
        <p className="muted">
          Signed in as {viewer.email}. Blog Admin and Shop Admin will be granted
          from this desk — not from a public control. Member progression labels
          (Initiate → Acolyte → Adept → Founder) are display-only and never open
          consoles.
        </p>
      </div>

      <section className="section">
        <p className="kicker">Site settings</p>
        <h2>Horns &amp; Halos live URL</h2>
        <p className="muted">
          When set via <code>HORNS_AND_HALOS_URL</code>, all “Enter Horns &amp;
          Halos” / “Cross the Threshold” CTAs open that URL in a new tab. When
          empty, CTAs fall back to the internal portal at{" "}
          <code>{site.portalPath}</code>.
        </p>
        <div className="admin-note" style={{ marginTop: "1rem" }}>
          <p>
            <strong>Current value:</strong>{" "}
            {hornsAndHalosLiveUrl ? (
              <a href={hornsAndHalosLiveUrl} target="_blank" rel="noopener noreferrer">
                {hornsAndHalosLiveUrl}
              </a>
            ) : (
              <span className="muted">(empty — using {site.portalPath})</span>
            )}
          </p>
        </div>
      </section>

      <section className="section">
        <p className="kicker">Shop outbound</p>
        <div className="admin-note">
          <p>
            <strong>SHOPIFY_URL:</strong>{" "}
            {shopifyUrl || <span className="muted">(placeholder empty)</span>}
          </p>
          <p>
            <strong>SPREADSHOP_URL:</strong>{" "}
            {spreadshopUrl || <span className="muted">(placeholder empty)</span>}
          </p>
        </div>
      </section>
    </div>
  );
}
