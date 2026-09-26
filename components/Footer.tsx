import Link from "next/link";
import { site } from "@/config/site";
import { R001MarksStrip } from "@/components/R001MarksStrip";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <small>
          {site.name} · {site.mood} · {site.domain}
        </small>
        <R001MarksStrip />
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
