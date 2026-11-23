import type { ViewerRole } from "@/config/roles";

/** The floor is public. Speaking requires a signed-in house key. */
export function canSpeak(role: ViewerRole): boolean {
  return role !== "anon";
}

/** Pin, lock, and hide stay with the Founder. */
export function canModerate(role: ViewerRole): boolean {
  return role === "founder";
}
