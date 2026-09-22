import { founderEmails } from "@/config/roles";

export type DemoIdentity = {
  id: string;
  email: string;
  name: string;
};

/**
 * AUTH_DEMO login. Exact id `6` maps to the first FOUNDER_EMAILS entry.
 * Founder emails and other emails still work; `6` is an alias, not an OAuth id.
 */
export function resolveDemoIdentity(loginId: string): DemoIdentity | null {
  const raw = String(loginId ?? "").trim();
  if (!raw) return null;

  if (raw === "6") {
    const email = founderEmails()[0];
    if (!email) return null;
    return { id: email, email, name: "6" };
  }

  const email = raw.toLowerCase();
  if (!email.includes("@")) return null;
  return { id: email, email, name: email };
}
