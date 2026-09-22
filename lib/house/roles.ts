import {
  applyGrantedRole,
  founderEmails,
  isGrantableRole,
  roleConsoleLabels,
  roleForEmail,
  type GrantableRole,
  type Role,
} from "@/config/roles";
import { localJsonRead, localJsonWrite } from "@/lib/cms/local-json";
import { detectLiveStore, liveStoreKind } from "@/lib/live";
import { getSupabase } from "@/lib/supabase";

export type HouseSeat = {
  email: string;
  role: Role;
  source: "founder_emails" | "house_desk";
  displayName?: string;
};

type RoleRow = {
  email: string;
  role: GrantableRole;
  display_name?: string | null;
  updated_at?: string;
  updated_by?: string | null;
};

const LOCAL_FILE = "house-roles";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function resolveRole(email: string | null | undefined): Promise<Role> {
  if (!email) return "member";
  if (roleForEmail(email) === "founder") return "founder";
  try {
    const granted = await grantedRoleForEmail(email);
    return applyGrantedRole(email, granted);
  } catch (error) {
    console.error("house role lookup failed", error);
    return roleForEmail(email);
  }
}

export async function grantedRoleForEmail(email: string): Promise<GrantableRole | null> {
  const key = normalizeEmail(email);
  const rows = await listGrantedRows();
  return rows.find((row) => row.email === key)?.role ?? null;
}

async function listGrantedRows(): Promise<RoleRow[]> {
  const kind = liveStoreKind();
  if (kind === "supabase") {
    const { data, error } = await getSupabase()
      .from("house_roles")
      .select("email, role, display_name, updated_at, updated_by")
      .order("email");
    if (error) throw new Error(error.message);
    const rows: RoleRow[] = [];
    for (const row of data ?? []) {
      const email = normalizeEmail(String(row.email ?? ""));
      const role = String(row.role ?? "");
      if (!email || !isGrantableRole(role)) continue;
      rows.push({
        email,
        role,
        display_name: row.display_name ? String(row.display_name) : null,
        updated_at: row.updated_at ? String(row.updated_at) : undefined,
        updated_by: row.updated_by ? String(row.updated_by) : null,
      });
    }
    return rows;
  }
  if (kind === "local") {
    return localJsonRead<RoleRow>(LOCAL_FILE).filter(
      (row) => row.email && isGrantableRole(row.role),
    );
  }
  return [];
}

export async function listHouseSeats(): Promise<HouseSeat[]> {
  const seats = new Map<string, HouseSeat>();
  for (const email of founderEmails()) {
    seats.set(email, {
      email,
      role: "founder",
      source: "founder_emails",
    });
  }
  for (const row of await listGrantedRows()) {
    if (seats.has(row.email)) continue;
    seats.set(row.email, {
      email: row.email,
      role: row.role,
      source: "house_desk",
      displayName: row.display_name ?? undefined,
    });
  }
  return [...seats.values()].sort((a, b) => a.email.localeCompare(b.email));
}

export async function grantHouseRole(
  email: string,
  role: GrantableRole,
  actorEmail: string,
): Promise<void> {
  const key = normalizeEmail(email);
  if (!key.includes("@")) throw new Error("A real email is required.");
  if (roleForEmail(key) === "founder") {
    throw new Error("Founder stays on FOUNDER_EMAILS. The desk cannot grant or rewrite Founder.");
  }
  if (!isGrantableRole(role)) {
    throw new Error("Only Blog Admin and Shop Admin can be granted from the house desk.");
  }
  if (!detectLiveStore().writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to grant roles.");
  }

  const row: RoleRow = {
    email: key,
    role,
    display_name: null,
    updated_at: new Date().toISOString(),
    updated_by: actorEmail,
  };

  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("house_roles").upsert(
      {
        email: row.email,
        role: row.role,
        display_name: row.display_name,
        updated_at: row.updated_at,
        updated_by: row.updated_by,
      },
      { onConflict: "email" },
    );
    if (error) throw new Error(error.message);
    return;
  }

  const rows = (await listGrantedRows()).filter((item) => item.email !== key);
  rows.push(row);
  localJsonWrite(LOCAL_FILE, rows);
}

export async function revokeHouseRole(email: string): Promise<void> {
  const key = normalizeEmail(email);
  if (roleForEmail(key) === "founder") {
    throw new Error("Founder cannot be revoked here. Remove the address from FOUNDER_EMAILS.");
  }
  if (!detectLiveStore().writable) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to revoke roles.");
  }
  if (liveStoreKind() === "supabase") {
    const { error } = await getSupabase().from("house_roles").delete().eq("email", key);
    if (error) throw new Error(error.message);
    return;
  }
  localJsonWrite(
    LOCAL_FILE,
    (await listGrantedRows()).filter((item) => item.email !== key),
  );
}

export function seatLabel(seat: HouseSeat): string {
  return roleConsoleLabels[seat.role];
}
