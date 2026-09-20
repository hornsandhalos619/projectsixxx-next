/**
 * Console roles only. Public Member progression (Initiate → Acolyte → Adept → Founder)
 * is display labels — not a second role system and never mapped to Blog/Shop Admin.
 */
export const ROLES = ["founder", "blog_admin", "shop_admin", "member"] as const;
export type Role = (typeof ROLES)[number];
export type ViewerRole = Role | "anon";

/** Public-facing Member ladder. Labels only — consoles still use Role above. */
export const MEMBER_TIERS = ["initiate", "acolyte", "adept", "founder"] as const;
export type MemberTier = (typeof MEMBER_TIERS)[number];

export const memberTierLabels: Record<MemberTier, string> = {
  initiate: "Initiate",
  acolyte: "Acolyte",
  adept: "Adept",
  founder: "Founder",
};

export const roleConsoleLabels: Record<Role, string> = {
  founder: "Founder",
  blog_admin: "Blog Admin",
  shop_admin: "Shop Admin",
  member: "Member",
};

/**
 * Default signed-in Members display as Initiate.
 * Founder console role also shows Founder on the public ladder.
 * Blog Admin / Shop Admin keep their console label; public tier stays Initiate until house grants otherwise.
 */
export function publicMemberTier(role: ViewerRole): MemberTier | null {
  if (role === "anon") return null;
  if (role === "founder") return "founder";
  return "initiate";
}

export function founderEmails(): string[] {
  return (process.env.FOUNDER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Founder is seeded ONLY via FOUNDER_EMAILS. First signup is never Founder. */
export function roleForEmail(email: string | null | undefined): Role {
  if (!email) return "member";
  if (founderEmails().includes(email.toLowerCase())) return "founder";
  return "member";
}

export function canSeeAccount(role: ViewerRole): boolean {
  return role !== "anon";
}

export function canSeeJournalAdmin(role: ViewerRole): boolean {
  return role === "founder" || role === "blog_admin";
}

export function canSeeShopAdmin(role: ViewerRole): boolean {
  return role === "founder" || role === "shop_admin";
}

export function canSeeHouseAdmin(role: ViewerRole): boolean {
  return role === "founder";
}

export function canSeeAdminHub(role: ViewerRole): boolean {
  return canSeeJournalAdmin(role) || canSeeShopAdmin(role) || canSeeHouseAdmin(role);
}

export function adminPathAllowed(pathname: string, role: ViewerRole): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname.startsWith("/admin/journal")) return canSeeJournalAdmin(role);
    if (pathname.startsWith("/admin/shop")) return canSeeShopAdmin(role);
    if (pathname.startsWith("/admin/house")) return canSeeHouseAdmin(role);
    return canSeeAdminHub(role);
  }
  return true;
}
