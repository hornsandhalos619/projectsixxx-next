import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import {
  canSeeAccount,
  memberTierLabels,
  publicMemberTier,
  roleConsoleLabels,
} from "@/config/roles";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await getViewer();
  if (!canSeeAccount(viewer.role)) redirect("/signin?callbackUrl=/account");

  const tier = publicMemberTier(viewer.role);
  const consoleLabel =
    viewer.role === "anon" ? "—" : roleConsoleLabels[viewer.role];

  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">
          {tier ? memberTierLabels[tier] : "Member"}
        </p>
        <h1>Account</h1>
        <p className="lede">{viewer.email}</p>
      </header>
      <p className="muted">
        Public tier: {tier ? memberTierLabels[tier] : "—"}. Console role:{" "}
        {consoleLabel}. Consoles appear in the nav only if you own them.
        Initiate → Acolyte → Adept → Founder are Member progression labels —
        they do not grant Blog Admin or Shop Admin.
      </p>
    </div>
  );
}
