import assert from "node:assert/strict";
import {
  ensureAuthUrl,
  googleOAuthEnv,
  houseKeyEnabled,
  houseKeyPassword,
  resolveAuthUrl,
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
  delete process.env.FOUNDER_PASSWORD;
  delete process.env.AUTH_DEMO_PASSWORD;
  delete process.env.AUTH_DEMO;
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL_URL;
}

resetEnv();

assert.equal(houseKeyPassword(), undefined);
assert.equal(houseKeyEnabled(), false);
assert.equal(googleOAuthEnv(), null);
assert.deepEqual(publicProviders(), []);

process.env.AUTH_DEMO = "1";
assert.equal(houseKeyEnabled(), false, "AUTH_DEMO alone does not register the house key");

process.env.AUTH_DEMO_PASSWORD = "  house-alias  ";
assert.equal(houseKeyPassword(), "house-alias");
assert.equal(houseKeyEnabled(), true);
assert.deepEqual(publicProviders().map((p) => p.id), ["credentials"]);

process.env.FOUNDER_PASSWORD = "founder-key";
assert.equal(houseKeyPassword(), "founder-key");

process.env.GOOGLE_CLIENT_ID = "legacy-id";
process.env.GOOGLE_CLIENT_SECRET = "legacy-secret";
assert.deepEqual(googleOAuthEnv(), {
  clientId: "legacy-id",
  clientSecret: "legacy-secret",
});

process.env.AUTH_GOOGLE_ID = "auth-id";
process.env.AUTH_GOOGLE_SECRET = "auth-secret";
assert.deepEqual(googleOAuthEnv(), {
  clientId: "auth-id",
  clientSecret: "auth-secret",
});
assert.deepEqual(
  publicProviders().map((p) => p.id),
  ["google", "credentials"],
);

resetEnv();
process.env.NEXTAUTH_URL = "https://projectsixxx.com/";
assert.equal(resolveAuthUrl(), "https://projectsixxx.com");

resetEnv();
process.env.VERCEL_ENV = "production";
assert.equal(resolveAuthUrl(), "https://projectsixxx.com");
assert.equal(ensureAuthUrl(), "https://projectsixxx.com");
assert.equal(process.env.AUTH_URL, "https://projectsixxx.com");

resetEnv();
process.env.VERCEL_ENV = "preview";
process.env.VERCEL_URL = "projectsixxx-next-git-preview.vercel.app";
assert.equal(
  resolveAuthUrl(),
  "https://projectsixxx-next-git-preview.vercel.app",
);

resetEnv();
console.log("auth env + public providers ok");
