import { founderEmails } from "@/config/roles";

export type DemoIdentity = {
  id: string;
  email: string;
  name: string;
};

/**
 * House-key login. Exact id `6` maps to the first FOUNDER_EMAILS entry.
 * Founder emails and other emails still work; `6` is an alias for the first founder seat.
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
