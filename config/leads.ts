/**
 * Soft-launch leads funnel. Placeholders only — never invent ESP IDs
 * or Shopify form IDs.
 *
 * Halos Lift 2026-09-14: Proof PUBLIC HEALTHY. SEND_OPEN_DOOR=true.
 * Welcome: {{shop_url}} only — never {{password}}, never reprint old door letters.
 * Consented warm only when a list exists. No blast. Persist ≠ send.
 * Tag soft-launch-password = legacy continuity.
 */
export const SOFT_LAUNCH_SOURCE = "soft-launch";
export const SOFT_LAUNCH_TAG = "soft-launch-password";

/** Proof PUBLIC HEALTHY — open-door welcome authorized (URL only, consented warm). */
export const SEND_OPEN_DOOR = true;

export const SOFT_LAUNCH_COPY = {
  label: "Get shop updates",
  button: "Enter the circle",
  success: "Received. The shop is open when you are.",
  successCta: "Open the shop",
  welcomeSubject: "Horns & Halos is open",
  welcomePreheader: "R001 is live. No countdown.",
  welcomeBody: `Soft lock is off.

R001 black tees @ $35 — Horns Infinite Conflict. / Halos Eternal Balance.

Open when ready: {{shop_url}}
No countdown, no fake proof.

Positive in. Positive out.

— Horns & Halos`,
} as const;
