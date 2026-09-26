"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { shopifyUrl } from "@/config/shops";
import {
  R001_SPLASH_STORAGE_KEY,
  r001DeskPath,
  r001PublicSrc,
  r001SplashCut,
} from "@/config/r001-ads";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem(R001_SPLASH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismiss(): void {
  try {
    sessionStorage.setItem(R001_SPLASH_STORAGE_KEY, "1");
  } catch {
    /* private mode — splash may return on the next paint */
  }
}

export function R001Splash() {
  const cut = useMemo(() => r001SplashCut(), []);
  const src = r001PublicSrc(cut);
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    rememberDismiss();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (r001DeskPath(window.location.pathname)) return;
    if (prefersReducedMotion()) return;
    if (wasDismissed()) return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        dismiss();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="r001-splash"
      role="dialog"
      aria-modal="true"
      aria-labelledby="r001-splash-title"
    >
      <video
        className="r001-splash-video"
        src={src}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={dismiss}
      />
      <div className="r001-splash-veil" aria-hidden />
      <div className="r001-splash-chrome">
        <p className="kicker">R001 reel</p>
        <h2 id="r001-splash-title" className="display">
          {cut.title}
        </h2>
        <p className="lede">{cut.dek}</p>
        <div className="cta-row cta-row--centered">
          <button type="button" className="btn btn-house" onClick={dismiss}>
            Enter
          </button>
          <button type="button" className="btn" onClick={dismiss}>
            Skip
          </button>
          <a
            className="btn btn-ember"
            href={shopifyUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Enter Shopify store
          </a>
        </div>
      </div>
    </div>
  );
}
