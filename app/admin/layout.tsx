import { redirect } from "next/navigation";
import { AdminClosed } from "@/components/AdminClosed";
import { canSeeAdminHub } from "@/config/roles";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();
  if (viewer.role === "anon") {
    redirect("/signin?callbackUrl=/admin");
  }
  if (!canSeeAdminHub(viewer.role)) {
    return <AdminClosed email={viewer.email} desk="House consoles" />;
  }
  return children;
}
