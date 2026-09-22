import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSeeShopAdmin } from "@/config/roles";
import { listAffiliateProducts } from "@/lib/affiliates/store";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Shop console" };
export const dynamic = "force-dynamic";

export default async function AdminShopPage() {
  const viewer = await getViewer();
  if (!canSeeShopAdmin(viewer.role)) notFound();

  const storage = detectLiveStore();
  const products = await listAffiliateProducts();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop console</p>
        <h1>Affiliates</h1>
        <p className="lede">
          Create and edit merchant doors. Public outbound keeps rel=sponsored
          nofollow. Seed catalog in config/affiliates.ts stays in the tree.
        </p>
      </header>

      <div className="admin-note">
        <p>
          <strong>Storage:</strong> {storage.label}
        </p>
        <p className="muted">{storage.hint}</p>
      </div>

      <div className="cta-row" style={{ marginTop: "1.25rem" }}>
        <Link className="btn btn-house" href="/admin/shop/new">
          New product
        </Link>
        <Link className="btn" href="/shop">
          Public shop
        </Link>
      </div>

      <div className="journal-desk">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Shelf</th>
              <th>Merchant</th>
              <th>Status</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug}>
                <td>
                  <Link href={`/admin/shop/${product.slug}`}>{product.name}</Link>
                  <div className="muted">{product.slug}</div>
                </td>
                <td>{product.category}</td>
                <td>{product.merchant}</td>
                <td>
                  <span className={`badge-status badge-status--${product.status === "live" ? "published" : "draft"}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/shop/${product.slug}`}>Edit</Link>
                  {" · "}
                  <Link href={`/shop/${product.category}/${product.slug}`}>Live</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
