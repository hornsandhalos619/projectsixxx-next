"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type NavItem = {
  href: string;
  label: string;
  portal?: boolean;
};

export function PrimaryNav({
  items,
  path = "",
}: {
  items: NavItem[];
  path?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    function onPointer(event: MouseEvent | PointerEvent) {
      const root = rootRef.current;
      const panel = panelRef.current;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (root?.contains(target) || panel?.contains(target)) return;
      close();
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  function linkClass(item: NavItem) {
    return item.portal ? "portal-nav" : undefined;
  }

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      className={`nav-parchment${open ? " is-open" : ""}`}
      aria-hidden={!open}
    >
      <span className="nav-parchment__filigree" aria-hidden="true" />
      <ul className="nav-parchment__list">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={linkClass(item)}
              aria-current={path === item.href ? "page" : undefined}
              onClick={close}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <nav className="primary-nav" aria-label="Primary" ref={rootRef}>
      <div className="nav nav--primary nav--chrome">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item)}
            aria-current={path === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="nav-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>

      {/* Desktop keeps panel in-tree (hidden by CSS). Mobile portals to body so width cannot inherit the Menu button. */}
      {mounted ? createPortal(panel, document.body) : panel}
    </nav>
  );
}
