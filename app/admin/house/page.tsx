import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HouseRolesForm } from "@/components/HouseRolesForm";
import { canSeeHouseAdmin } from "@/config/roles";
import { hornsAndHalosLiveUrl, site } from "@/config/site";
import { shopifyUrl, spreadshopUrl } from "@/config/shops";
import { detectLiveStore } from "@/lib/live";
import { listHouseSeats } from "@/lib/house/roles";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "House console" };
export const dynamic = "force-dynamic";

export default async function AdminHousePage() {
  const viewer = await getViewer();
  if (!canSeeHouseAdmin(viewer.role)) notFound();

  const storage = detectLiveStore();
  const seats = await listHouseSeats();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">House console</p>
        <h1>Founder</h1>
        <p className="lede">
          Grant and revoke Blog Admin and Shop Admin. Founder is seeded only from
          FOUNDER_EMAILS — never from this desk.
        </p>
      </header>

      <div className="admin-note">
        <p>
          <strong>Storage:</strong> {storage.label}
        </p>
        <p className="muted">{storage.hint}</p>
      </div>

      <section className="section">
        <p className="kicker">Seats</p>
        <HouseRolesForm seats={seats} writable={storage.writable} actorEmail={viewer.email} />
      </section>

      <section className="section">
        <p className="kicker">Site settings</p>
        <h2>Horns &amp; Halos live URL</h2>
        <p className="muted">
          Display only. When <code>HORNS_AND_HALOS_URL</code> is set, portal CTAs
          open that URL. Empty falls back to <code>{site.portalPath}</code>.
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
        <p className="muted">
          Display only. Values stay in env. No secrets are printed as raw keys.
        </p>
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
