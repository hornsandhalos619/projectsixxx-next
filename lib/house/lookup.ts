import {
  applyGrantedRole,
  isGrantableRole,
  roleForEmail,
  type GrantableRole,
  type Role,
} from "@/config/roles";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Edge-safe. Founder from FOUNDER_EMAILS, then Supabase house_roles. No filesystem. */
export async function resolveRole(email: string | null | undefined): Promise<Role> {
  if (!email) return "member";
  if (roleForEmail(email) === "founder") return "founder";
  try {
    const granted = await grantedRoleFromSupabase(email);
    return applyGrantedRole(email, granted);
  } catch (error) {
    console.error("house role lookup failed", error);
    return roleForEmail(email);
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
