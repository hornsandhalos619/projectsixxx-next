import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateEditor } from "@/components/AffiliateEditor";
import { canSeeShopAdmin } from "@/config/roles";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "New affiliate" };
export const dynamic = "force-dynamic";

export default async function AdminShopNewPage() {
  const viewer = await getViewer();
  if (!canSeeShopAdmin(viewer.role)) notFound();
  const storage = detectLiveStore();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop console</p>
        <h1>New product</h1>
        <p className="lede">Belief first. Then a merchant door.</p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/shop">All products</Link>
        {" · "}
        Storage: {storage.label}
      </p>
      <AffiliateEditor writable={storage.writable} />
    </div>
  );
}
