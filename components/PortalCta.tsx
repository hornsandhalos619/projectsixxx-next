import Link from "next/link";
import { portalHref, portalIsExternal } from "@/config/site";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Opens live Horns & Halos URL when set; otherwise internal portal. */
export function PortalCta({ children, className }: Props) {
  const href = portalHref();
  if (portalIsExternal()) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
