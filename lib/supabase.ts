import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return value || undefined;
}

export function supabaseAnonKey(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return value || undefined;
}

export function supabaseServiceRoleKey(): string | undefined {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return value || undefined;
}

export function supabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && (supabaseServiceRoleKey() || supabaseAnonKey()));
}

let serverClient: SupabaseClient | null = null;

/** Server-only client. Prefers the service role so desk writes bypass RLS. */
export function getSupabase(): SupabaseClient {
  if (serverClient) return serverClient;
  const url = supabaseUrl();
  const key = supabaseServiceRoleKey() || supabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are required.",
    );
  }
  serverClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}
