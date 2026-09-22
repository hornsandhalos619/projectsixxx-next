import { localAllowed } from "@/lib/cms/local";
import { supabaseConfigured } from "@/lib/supabase";

export type LiveKind = "supabase" | "local" | "readonly";

export type LiveStoreInfo = {
  kind: LiveKind;
  writable: boolean;
  label: string;
  hint: string;
};

export function detectLiveStore(): LiveStoreInfo {
  if (supabaseConfigured()) {
    return {
      kind: "supabase",
      writable: true,
      label: "Supabase",
      hint: "Live edits persist in Postgres via NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }
  if (localAllowed()) {
    return {
      kind: "local",
      writable: true,
      label: "Local data file",
      hint: "Dev-only overlay under data/. Seat Supabase on Vercel for production writes.",
    };
  }
  return {
    kind: "readonly",
    writable: false,
    label: "Seed config",
    hint: "Public pages read MDX and config seeds. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to write from the desk.",
  };
}

export function liveStoreKind(): LiveKind {
  return detectLiveStore().kind;
}

export function mergeBySlug<T extends { slug: string }>(seed: T[], overlay: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of seed) map.set(item.slug, item);
  for (const item of overlay) map.set(item.slug, item);
  return [...map.values()];
}
