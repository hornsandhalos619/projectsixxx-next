import assert from "node:assert/strict";
import {
  ensureAuthUrl,
  isProviderSigninPath,
  resolveAuthUrl,
  safeCallbackUrl,
  signInErrorCopy,
} from "./auth-env";
import { publicProviders } from "./providers";

const snapshot = { ...process.env };

function resetEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
  delete process.env.AUTH_GOOGLE_ID;
  delete process.env.AUTH_GOOGLE_SECRET;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL_URL;
}

resetEnv();
assert.deepEqual(
  publicProviders().map((provider) => provider.id),
  ["credentials"],
);

process.env.AUTH_GOOGLE_ID = "auth-id";
process.env.AUTH_GOOGLE_SECRET = "auth-secret";
process.env.GOOGLE_CLIENT_ID = "legacy-id";
process.env.GOOGLE_CLIENT_SECRET = "legacy-secret";
assert.equal(publicProviders().some((provider) => provider.id === "google"), false);

resetEnv();
process.env.NEXTAUTH_URL = "https://projectsixxx.com/";
assert.equal(resolveAuthUrl(), "https://projectsixxx.com");

resetEnv();
process.env.VERCEL_ENV = "production";
assert.equal(resolveAuthUrl(), "https://projectsixxx.com");
assert.equal(ensureAuthUrl(), "https://projectsixxx.com");
assert.equal(process.env.AUTH_URL, "https://projectsixxx.com");

resetEnv();
process.env.AUTH_URL = "https://projectsixxx.com";
process.env.VERCEL_ENV = "preview";
process.env.VERCEL_URL = "projectsixxx-next-git-preview.vercel.app";
assert.equal(resolveAuthUrl(), "https://projectsixxx-next-git-preview.vercel.app");
assert.equal(ensureAuthUrl(), "https://projectsixxx-next-git-preview.vercel.app");
assert.equal(process.env.AUTH_URL, "https://projectsixxx-next-git-preview.vercel.app");

assert.equal(isProviderSigninPath("/api/auth/signin/google"), true);
assert.equal(isProviderSigninPath("/api/auth/signin/credentials"), true);
assert.equal(isProviderSigninPath("/api/auth/signin"), false);
assert.equal(isProviderSigninPath("/api/auth/callback/credentials"), false);
assert.equal(isProviderSigninPath("/api/auth/csrf"), false);

assert.equal(safeCallbackUrl("/account"), "/account");
assert.equal(safeCallbackUrl("/admin/house"), "/admin/house");
assert.equal(safeCallbackUrl("https://evil.example/phish"), "/account");
assert.equal(safeCallbackUrl("//evil.example"), "/account");
assert.equal(safeCallbackUrl(""), "/account");
assert.equal(signInErrorCopy("Configuration"), "House key store is waiting on environment keys.");

resetEnv();
console.log("auth env + public providers ok");
