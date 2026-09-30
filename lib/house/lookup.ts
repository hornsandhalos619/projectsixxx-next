import {
  applyGrantedRole,
  isGrantableRole,
  roleForIdentity,
  type GrantableRole,
  type Role,
} from "@/config/roles";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Edge-safe. Founder from FOUNDER_EMAILS / FOUNDER_USERNAMES, then Supabase house_roles. */
export async function resolveRole(
  email: string | null | undefined,
  username?: string | null,
): Promise<Role> {
  if (!email && !username) return "member";
  if (roleForIdentity(email, username) === "founder") return "founder";
  try {
    const granted = email ? await grantedRoleFromSupabase(email) : null;
    return applyGrantedRole(email, granted, username);
  } catch (error) {
    console.error("house role lookup failed", error);
    return roleForIdentity(email, username);
  }
}

export async function grantedRoleFromSupabase(
  email: string,
): Promise<GrantableRole | null> {
  if (!supabaseConfigured()) return null;
  const { data, error } = await getSupabase()
    .from("house_roles")
    .select("role")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw new Error(error.message);
  const role = String(data?.role ?? "");
  return isGrantableRole(role) ? role : null;
}
