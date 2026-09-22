import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomepageSlotsForm } from "@/components/HomepageSlotsForm";
import { canSeeHomepageAdmin } from "@/config/roles";
import { listHomepageSlots } from "@/lib/homepage/store";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";
import { listFeaturedLibrary } from "@/lib/titles/store";

export const metadata: Metadata = { title: "Homepage console" };
export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const viewer = await getViewer();
  if (!canSeeHomepageAdmin(viewer.role)) notFound();
  const storage = detectLiveStore();
  const slots = await listHomepageSlots();
  const featured = await listFeaturedLibrary();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Homepage console</p>
        <h1>Featured slots</h1>
        <p className="lede">
          Quote, excerpt, and literature doors on the house front. Library
          feature flags are set on each title.
        </p>
      </header>
      <div className="admin-note">
        <p>
          <strong>Storage:</strong> {storage.label}
        </p>
        <p className="muted">{storage.hint}</p>
      </div>
      <section className="section">
        <HomepageSlotsForm slots={slots} writable={storage.writable} />
      </section>
      <section className="section">
        <p className="kicker">Featured literature</p>
        {featured.length === 0 ? (
          <p className="muted">No titles flagged. Mark them on the library desk.</p>
        ) : (
          <ul className="muted">
            {featured.map((work) => (
              <li key={work.slug}>
                <Link href={`/admin/library/${work.slug}`}>{work.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
