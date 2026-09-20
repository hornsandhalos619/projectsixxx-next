/** Horns & Halos brand lines — locked 2026-09-04 */
export const duality = {
  /** Full house title */
  title: "Horns & Halos",
  /**
   * Under "Horns & Halos" together — entire phrase:
   * first slogan (Duality) + second slogan (both closers).
   */
  first:
    "Duality: The Darkness within. The Light shining forth. The Life we forge. The Legacy that remains.",
  second: "Infinite Conflict. Eternal Balance.",
  /** Under Horns when Horns stands alone */
  hornsStandalone: "Infinite Conflict.",
  /** Under Halos when Halos stands alone */
  halosStandalone: "Eternal Balance.",
} as const;

/**
 * Portal gate art paths.
 *
 * HALOS MASTER (Founder-locked 2026-09-04 — second gateway):
 *   Live:  /portal/halos-bg.png
 *   Brand: /brand/halos-gate-master.png  (same bytes; archive/master copy)
 *   Archive only (do not use as live): /portal/halos-bg-first-LOCKED.png
 *
 * This Halos master is the house image for the Halos portal field, home twin
 * gate (Halos half), dual entry splash (Halos half), dual soft logo beds
 * (Halos half), merch/poster/tapestry, and future Battle Chess background.
 * Horns uses portalArt.hornsBg equally in splash, beds, and gates. Do NOT
 * replace Horns gate art.
 */
export const portalArt = {
  /** SAMPLE 2026-09-13: Outerwright obsidian glass horns + crimson fissure base */
  hornsBg: "/portal/horns-obsidian-glass.png",
  /** Archive prior horns field (pre-obsidian-glass SAMPLE) */
  hornsBgPrior: "/portal/horns-bg.png",
  /** Live Halos field / twin / splash — Founder-locked second gateway */
  halosBg: "/portal/halos-bg.png",
  /** Balance Forge Halos mood SAMPLE (parchment / silver) */
  halosMoodSample: "/brand/halos-homepage-mood-sample.png",
  /** Same master under brand/ for merch & future surfaces */
  halosMaster: "/brand/halos-gate-master.png",
  /** Outerwright brand path alias */
  hornsObsidianGlass: "/brand/horns-hero-obsidian-glass.png",
  /** Outerwright densify portal backdrop (light-right) */
  hornsPortalPlate: "/portal/horns-portal-obsidian-light-right.png",
  emblemHorns: "/portal/emblem-horns.png",
  emblemHalos: "/portal/emblem-halos.png",
} as const;

export function dualityTogetherBlock(): string {
  return `${duality.first}\n${duality.second}`;
}
