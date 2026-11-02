"use client";

import { FormEvent, useState } from "react";

export function EmailCapture({
  source,
  label = "Keep the night list",
  buttonLabel = "Join",
  success = "Received. You're on the list.",
  successCta = "Open the shop",
  tag,
  nextHref,
}: {
  source: string;
  label?: string;
  buttonLabel?: string;
  success?: string;
  successCta?: string;
  /** Shopify / ESP customer tag. Legacy soft-launch-password tag ok server-side — never print to visitors. */
  tag?: string;
  /** After capture, offer this shop URL (public). */
  nextHref?: string;
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "invalid">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, tag }),
      });
      if (res.status === 400) setStatus("invalid");
      else if (res.ok) setStatus("ok");
      else setStatus("err");
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <div>
        <p className="muted">{success}</p>
        {nextHref ? (
          <p className="cta-row" style={{ marginTop: "0.75rem" }}>
            <a
              className="btn btn-ember"
              href={nextHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              {successCta}
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        {label}
        <input
          type="email"
          name="email"
          required
          placeholder="you@night.example"
          autoComplete="email"
        />
      </label>
      <button className="btn btn-house" type="submit">
        {buttonLabel}
      </button>
      {status === "invalid" ? <p className="muted">Need a real email.</p> : null}
      {status === "err" ? <p className="muted">The list didn&apos;t keep that. Try again.</p> : null}
    </form>
  );
}
