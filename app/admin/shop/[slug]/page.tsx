import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDeleteButton, AffiliateEditor } from "@/components/AffiliateEditor";
import { canSeeShopAdmin } from "@/config/roles";
import { listAffiliateProducts } from "@/lib/affiliates/store";
import { detectLiveStore } from "@/lib/live";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Edit affiliate" };
export const dynamic = "force-dynamic";

export default async function AdminShopEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const viewer = await getViewer();
  if (!canSeeShopAdmin(viewer.role)) notFound();

  const { slug } = await params;
  const { saved } = await searchParams;
  const product = (await listAffiliateProducts()).find((item) => item.slug === slug);
  if (!product) notFound();
  const storage = detectLiveStore();

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Shop console</p>
        <h1>{product.name}</h1>
        <p className="lede">
          {product.category} · {product.status}
        </p>
      </header>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/shop">All products</Link>
        {" · "}
        <Link href={`/shop/${product.category}/${product.slug}`}>Live page</Link>
        {" · "}
        Storage: {storage.label}
      </p>
      <AffiliateEditor product={product} writable={storage.writable} saved={saved === "1"} />
      <div className="section">
        <AffiliateDeleteButton product={product} writable={storage.writable} />
      </div>
    </div>
  );
}
