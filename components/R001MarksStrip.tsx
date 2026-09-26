import { r001Ads, r001PublicSrc } from "@/config/r001-ads";

export function R001MarksStrip() {
  return (
    <nav className="r001-marks" aria-label="R001 reel">
      <p className="r001-marks-kicker">Marks · R001 reel</p>
      <ul className="r001-marks-list">
        {r001Ads.map((cut) => (
          <li key={cut.id}>
            <a href={r001PublicSrc(cut)} target="_blank" rel="noopener noreferrer">
              {cut.shortLabel}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
