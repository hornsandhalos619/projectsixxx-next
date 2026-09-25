"use client";

import { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { startOAuthSignIn } from "@/lib/auth-actions";
import type { PublicProvider } from "@/lib/providers";

export function SignInForm({
  providers,
  callbackUrl,
}: {
  providers: PublicProvider[];
  callbackUrl: string;
}) {
  const demo = providers.find((p) => p.id === "demo");
  const oauth = providers.filter((p) => p.id === "google" || p.id === "twitter");
  const email = providers.find((p) => p.id === "nodemailer");

  async function onDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await signIn("demo", {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      callbackUrl,
    });
  }

  async function onEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await signIn("nodemailer", {
      email: String(data.get("email") ?? ""),
      callbackUrl,
    });
  }

  return (
    <div className="form">
      {oauth.map((p) => (
        <form key={p.id} action={startOAuthSignIn}>
          <input type="hidden" name="provider" value={p.id} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button type="submit" className="btn btn-silver">
            {p.label}
          </button>
        </form>
      ))}

      {email ? (
        <form onSubmit={onEmail} className="form">
          <label>
            Email
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <button className="btn btn-house" type="submit">
            Continue with email
          </button>
        </form>
      ) : null}

      {demo ? (
        <form onSubmit={onDemo} className="form">
          <label>
            Username or email
            <input
              type="text"
              name="email"
              required
              autoComplete="username"
              inputMode="text"
              spellCheck={false}
            />
          </label>
          <label>
            Password
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          <button className="btn btn-house" type="submit">
            Continue with house key
          </button>
        </form>
      ) : null}

      {providers.length === 0 ? (
        <p className="muted">
          Sign-in providers are waiting on environment keys. The house does not
          invent a first Founder. Add AUTH_* and FOUNDER_EMAILS — never a role
          switcher.
        </p>
      ) : null}
    </div>
  );
}
