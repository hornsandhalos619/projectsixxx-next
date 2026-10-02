"use client";

import { FormEvent, useState } from "react";
import { registerHouseAccount, signInHouseAccount } from "@/lib/auth-actions";

export function SignInForm({
  callbackUrl,
  errorMessage,
  storeBlockedMessage,
}: {
  callbackUrl: string;
  errorMessage?: string;
  storeBlockedMessage?: string | null;
}) {
  const [signInError, setSignInError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [pending, setPending] = useState<"in" | "up" | null>(null);

  async function onSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignInError(null);
    setPending("in");
    try {
      const data = new FormData(event.currentTarget);
      data.set("callbackUrl", callbackUrl);
      const result = await signInHouseAccount(data);
      if (result && !result.ok) {
        setSignInError(result.error);
        setPending(null);
      }
      // Successful sign-in redirects; pending stays until navigation.
    } catch {
      setSignInError("Sign-in did not complete.");
      setPending(null);
    }
  }

  async function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError(null);
    setPending("up");
    try {
      const data = new FormData(event.currentTarget);
      data.set("callbackUrl", callbackUrl);
      const result = await registerHouseAccount(data);
      if (result && !result.ok) {
        setRegisterError(result.error);
        setPending(null);
      }
    } catch {
      setRegisterError("House key could not be created.");
      setPending(null);
    }
  }

  return (
    <div className="auth-stack">
      {storeBlockedMessage ? (
        <p className="muted" role="alert">
          {storeBlockedMessage}
        </p>
      ) : null}
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
        {signInError ? (
          <p className="muted" role="alert">
            {signInError}
          </p>
        ) : null}
        <button className="btn btn-house" type="submit" disabled={pending !== null}>
          {pending === "in" ? "Checking key…" : "Continue with house key"}
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
          {pending === "up" ? "Forging key…" : "Create house key"}
        </button>
      </form>
    </div>
  );
}
