import { notFound } from "next/navigation";
import { canSeeAdminHub } from "@/config/roles";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();
  if (!canSeeAdminHub(viewer.role)) notFound();
  return children;
}
