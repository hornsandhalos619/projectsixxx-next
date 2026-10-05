/** Homepage featured roster. Defaults off until named collaborators approve. */
export function isFeaturedRosterEnabled(): boolean {
  const value = process.env.NEXT_PUBLIC_SHOW_FEATURED_ROSTER;
  return value === "true" || value === "1";
}
