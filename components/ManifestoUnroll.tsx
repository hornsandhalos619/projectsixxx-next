"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "hh-manifesto-unrolled";

type Props = {
  children: React.ReactNode;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function measureReveal(root: HTMLElement) {
  const reveal = root.querySelector<HTMLElement>(".manifesto-reveal");
  const sheet = reveal?.querySelector<HTMLElement>(".manifesto-scroll");
  if (!reveal || !sheet) return;
  reveal.style.setProperty("--manifesto-reveal", `${sheet.scrollHeight}px`);
}

/** First-view unroll. Replay once per session; reduced-motion opens instantly. */
export function ManifestoUnroll({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion() || sessionStorage.getItem(SESSION_KEY) === "1") {
      measureReveal(root);
      setInstant(true);
      setOpen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        measureReveal(root);
        requestAnimationFrame(() => {
          setOpen(true);
          sessionStorage.setItem(SESSION_KEY, "1");
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !open) return;

    const sheet = root.querySelector(".manifesto-scroll");
    if (!sheet) return;

    const apply = () => measureReveal(root);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(sheet);
    window.addEventListener("resize", apply);
    void document.fonts?.ready.then(apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="manifesto-rig"
      data-unrolled={open ? "true" : "false"}
      data-instant={instant ? "true" : undefined}
    >
      {children}
    </div>
  );
}
