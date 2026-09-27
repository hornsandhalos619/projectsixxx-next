import Link from "next/link";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <p className="footer-tagline">
          <span className="visually-hidden">
            HORNS UP trademark. HALOS ON trademark. Choose wisely.
          </span>
          <span className="footer-tagline-visual" aria-hidden="true">
            <span className="footer-tagline-pair">
              <span className="footer-horns">
                HORNS UP
                <span className="footer-tm">™</span>
              </span>
              <span className="footer-tagline-dot">·</span>
              <span className="footer-halos">
                HALOS ON
                <span className="footer-tm">™</span>
              </span>
            </span>
            <span className="footer-tagline-close">— Choose wisely.</span>
          </span>
        </p>
        <div className="footer-credits">
          <small>
            {site.name} · {site.mood}
            <span className="footer-house-host"> · {site.domain}</span>
          </small>
          <p className="footer-copyright">
            © 2026{" "}
            <span className="footer-brand-lock">Horns &amp; Halos™</span>
          </p>
        </div>
        <nav className="nav nav--footer" aria-label="Legal">
          <Link href="/overmind/journal">Overmind</Link>
          <Link href="/links">Links</Link>
          <Link href="/library">Library</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/schedule">Schedule</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
