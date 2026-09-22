import Link from "next/link";
import { headers } from "next/headers";
import { primaryNav, site } from "@/config/site";
import {
  canSeeAccount,
  canSeeAdminHub,
  canSeeGalleryAdmin,
  canSeeHomepageAdmin,
  canSeeHouseAdmin,
  canSeeJournalAdmin,
  canSeeLibraryAdmin,
  canSeeShopAdmin,
} from "@/config/roles";
import { getViewer } from "@/lib/session";
import { PrimaryNav, type NavItem } from "@/components/PrimaryNav";

export async function Header() {
  const viewer = await getViewer();
  const headerList = await headers();
  const path = headerList.get("x-pathname") ?? headerList.get("next-url") ?? "";

  const items: NavItem[] = [
    ...primaryNav.map((item) => ({
      href: item.href,
      label: item.label,
      portal: item.href === site.portalPath,
    })),
  ];

  if (canSeeAdminHub(viewer.role)) {
    items.push({ href: "/admin", label: "Desk" });
  }
  if (canSeeJournalAdmin(viewer.role)) {
    items.push({ href: "/admin/journal", label: "Journal console" });
  }
  if (canSeeHomepageAdmin(viewer.role)) {
    items.push({ href: "/admin/homepage", label: "Homepage" });
  }
  if (canSeeShopAdmin(viewer.role)) {
    items.push({ href: "/admin/shop", label: "Shop console" });
  }
  if (canSeeGalleryAdmin(viewer.role)) {
    items.push({ href: "/admin/gallery", label: "Gallery console" });
  }
  if (canSeeLibraryAdmin(viewer.role)) {
    items.push({ href: "/admin/library", label: "Library console" });
  }
  if (canSeeHouseAdmin(viewer.role)) {
    items.push({ href: "/admin/house", label: "House" });
  }

  if (canSeeAccount(viewer.role)) {
    items.push({ href: "/account", label: "Account" });
    items.push({ href: "/signout", label: "Sign out" });
  } else {
    items.push({ href: "/signin", label: "Sign in" });
  }

  return (
    <header className="header">
      <div className="shell header-inner">
        <Link className="wordmark wordmark--mark" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="wordmark-mark"
            src="/brand/project-sixxx-mark-horns-web.png"
            alt=""
            width={48}
            height={48}
          />
          <span className="wordmark-text">
            Project <span>SiXXX</span>
          </span>
        </Link>
        <PrimaryNav items={items} path={path} />
      </div>
    </header>
  );
}
