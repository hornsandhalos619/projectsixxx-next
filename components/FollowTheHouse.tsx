import { houseSocials } from "@/config/site";

export type FollowHouseSpot = "footer" | "home" | "portal";

/**
 * Official house accounts only. Threshold-verified 2026-11-10.
 * Outbound profile links stay untagged (UTM is for inbound bios).
 */
export function FollowTheHouse({ spot }: { spot: FollowHouseSpot }) {
  const headingId = `follow-house-title-${spot}`;

  return (
    <section className={`follow-house follow-house--${spot}`} aria-labelledby={headingId}>
      <div className="follow-house-inner">
        <div className="follow-house-rule" aria-hidden="true" />
        <h2 id={headingId} className="follow-house-title">
          Follow the House
        </h2>
        <nav className="follow-house-links" aria-label="Follow the House">
          {houseSocials.map((item, index) => (
            <span className="follow-house-item" key={item.href}>
              {index > 0 ? (
                <span className="follow-house-dot" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <a href={item.href} rel="noopener noreferrer" target="_blank">
                {item.label}
              </a>
            </span>
          ))}
        </nav>
        <div className="follow-house-rule" aria-hidden="true" />
      </div>
    </section>
  );
}
