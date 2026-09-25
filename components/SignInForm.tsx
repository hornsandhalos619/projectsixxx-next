"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { registerHouseAccount } from "@/lib/auth-actions";

export function SignInForm({
  callbackUrl,
  errorMessage,
}: {
  callbackUrl: string;
  errorMessage?: string;
}) {
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [pending, setPending] = useState<"in" | "up" | null>(null);

  async function onSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("in");
    const data = new FormData(event.currentTarget);
    await signIn("credentials", {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      callbackUrl,
    });
    setPending(null);
  }

  async function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError(null);
    setPending("up");
    const data = new FormData(event.currentTarget);
    data.set("callbackUrl", callbackUrl);
    const result = await registerHouseAccount(data);
    if (result && !result.ok) {
      setRegisterError(result.error);
      setPending(null);
    }
  }

  return (
    <div className="auth-stack">
      {errorMessage ? (
        <p className="muted" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <form onSubmit={onSignIn} className="form">
        <p className="kicker">Enter</p>
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
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        <button className="btn btn-house" type="submit" disabled={pending !== null}>
          Continue with house key
        </button>
      </form>

      <hr className="rule" />

      <form onSubmit={onRegister} className="form">
        <p className="kicker">Take a key</p>
        <label>
          Username
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            inputMode="text"
            spellCheck={false}
          />
        </label>
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            name="confirm"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {registerError ? (
          <p className="muted" role="alert">
            {registerError}
          </p>
        ) : null}
        <button className="btn btn-house" type="submit" disabled={pending !== null}>
          Create house key
        </button>
      </form>
    </div>
  );
}
