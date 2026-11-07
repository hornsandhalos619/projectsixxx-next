"use client";

import { FormEvent, useState } from "react";
import { leadCaptureSucceeded } from "@/lib/lead-response";

/**
 * Join the House. The Shopify /contact customer form rejects posts from this
 * domain (hCaptcha / missing CAPTCHA token), so the address is stored by
 * /api/leads: Shopify Admin when SHOPIFY_ADMIN_ACCESS_TOKEN is set, otherwise
 * the house database already used for the site.
 */
function HouseSigil() {
  return (
    <svg className="jth-sigil" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <ellipse cx="60" cy="30" rx="22" ry="5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M38 78 C30 60 32 46 42 38 C40 50 44 60 52 66" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M82 78 C90 60 88 46 78 38 C80 50 76 60 68 66" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="60" y1="46" x2="60" y2="96" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="60" cy="72" r="2.5" fill="var(--jth-red, #9b1b1f)" />
    </svg>
  );
}

export function JoinTheHouse() {
  const [status, setStatus] = useState<"idle" | "pending" | "ok" | "err">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    setStatus("pending");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          source: "join-the-house",
          tag: "newsletter,projectsixxx-site",
        }),
      });
      setStatus((await leadCaptureSucceeded(response)) ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  }

  return (
    <section className="jth" id="join-the-house" aria-labelledby="jth-title">
      <div className="jth-inner">
        <HouseSigil />
        <p className="jth-kicker">The list</p>
        <h2 id="jth-title" className="jth-title">Join the House</h2>
        <p className="jth-lede">
          First look at every drop: new art, brush packs, and bot kits, before they reach the shop.
        </p>
        {status === "ok" ? (
          <p className="jth-status" role="status">You&apos;re on the list.</p>
        ) : (
          <form className="jth-form" onSubmit={onSubmit}>
            <label className="visually-hidden" htmlFor="jth-email">Email</label>
            <input
              id="jth-email"
              className="jth-input"
              type="email"
              name="email"
              required
              placeholder="Your email"
              autoComplete="email"
              inputMode="email"
              disabled={status === "pending"}
            />
            <button className="jth-button" type="submit" disabled={status === "pending"}>
              Enter
            </button>
          </form>
        )}
        {status === "err" ? (
          <p className="jth-error" role="alert">That address didn&apos;t take. Try again.</p>
        ) : null}
        <p className="jth-fine">One letter per drop. Leave any time.</p>
      </div>
    </section>
  );
}
