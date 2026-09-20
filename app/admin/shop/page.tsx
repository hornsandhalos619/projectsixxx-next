import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/config/affiliates";
import { canSeeShopAdmin } from "@/config/roles";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Shop console" };

export default async function AdminShopPage() {
  const viewer = await getViewer();
  if (!canSeeShopAdmin(viewer.role)) notFound();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop console</p>
        <h1>Affiliates</h1>
        <p className="lede">Catalog is config/affiliates.ts only. Empty tags still link the merchant.</p>
      </header>
      <ul className="muted">
        {products.map((p) => (
          <li key={p.slug}>
            {p.name} · {p.category} · {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
