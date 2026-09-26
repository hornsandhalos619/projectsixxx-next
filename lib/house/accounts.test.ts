import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { roleForEmail } from "../../config/roles";
import {
  createHouseAccountWithStore,
  createMemoryAccountStore,
  validateEmail,
  validatePassword,
  validateUsername,
  verifyHouseCredentialsWithStore,
} from "./accounts";
import { hashPassword, verifyPassword } from "./passwords";
import { advertisedProviderIds, publicProviders } from "../providers";
import { signInErrorCopy } from "../auth-env";

async function main() {
  process.env.FOUNDER_EMAILS = "HornsAndHalos619@gmail.com, founder@projectsixxx.com";

  const hash = await hashPassword("house-pass-1");
  assert.notEqual(hash, "house-pass-1");
  assert.equal(await verifyPassword("house-pass-1", hash), true);
  assert.equal(await verifyPassword("wrong-pass", hash), false);

  assert.equal(validateUsername("6"), null);
  assert.equal(validateUsername("ash.lane"), null);
  assert.ok(validateUsername("not an email@x"));
  assert.ok(validateUsername("bad space"));
  assert.equal(validateEmail("ash@example.com"), null);
  assert.ok(validateEmail("not-an-email"));
  assert.ok(validatePassword("short"));
  assert.equal(validatePassword("long-enough"), null);

  const store = createMemoryAccountStore();

  const founder = await createHouseAccountWithStore(
    {
      username: "6",
      email: "HornsAndHalos619@gmail.com",
      password: "founder-key-1",
    },
    store,
  );
  assert.equal(founder.ok, true);
  if (!founder.ok) throw new Error("founder create failed");
  assert.equal(founder.account.email, "hornsandhalos619@gmail.com");
  assert.equal(founder.account.name, "6");
  assert.equal(roleForEmail(founder.account.email), "founder");

  const member = await createHouseAccountWithStore(
    {
      username: "Ash",
      email: "ash@example.com",
      password: "member-key-1",
    },
    store,
  );
  assert.equal(member.ok, true);
  if (!member.ok) throw new Error("member create failed");
  assert.equal(member.account.email, "ash@example.com");
  assert.equal(roleForEmail(member.account.email), "member");

  const byUsername = await verifyHouseCredentialsWithStore("6", "founder-key-1", store);
  const byEmail = await verifyHouseCredentialsWithStore(
    "HornsAndHalos619@gmail.com",
    "founder-key-1",
    store,
  );
  const memberByName = await verifyHouseCredentialsWithStore("ash", "member-key-1", store);

  assert.equal(byUsername?.email, "hornsandhalos619@gmail.com");
  assert.equal(byUsername?.name, "6");
  assert.equal(byEmail?.email, "hornsandhalos619@gmail.com");
  assert.equal(memberByName?.email, "ash@example.com");
  assert.equal(await verifyHouseCredentialsWithStore("6", "wrong-key", store), null);
  assert.equal(await verifyHouseCredentialsWithStore("missing", "member-key-1", store), null);

  const dupEmail = await createHouseAccountWithStore(
    { username: "other", email: "ash@example.com", password: "member-key-2" },
    store,
  );
  const dupUser = await createHouseAccountWithStore(
    { username: "ASH", email: "second@example.com", password: "member-key-2" },
    store,
  );
  assert.equal(dupEmail.ok, false);
  assert.equal(dupUser.ok, false);

  process.env.AUTH_GOOGLE_ID = "leftover-id";
  process.env.AUTH_GOOGLE_SECRET = "leftover-secret";
  process.env.GOOGLE_CLIENT_ID = "legacy-id";
  process.env.GOOGLE_CLIENT_SECRET = "legacy-secret";
  process.env.AUTH_TWITTER_ID = "twitter-id";
  process.env.AUTH_TWITTER_SECRET = "twitter-secret";

  assert.deepEqual(advertisedProviderIds(), ["credentials"]);
  assert.equal(publicProviders().some((provider) => provider.id === "google"), false);
  assert.equal(
    publicProviders().some((provider) => provider.label.toLowerCase().includes("google")),
    false,
  );

  assert.equal(signInErrorCopy("CredentialsSignin"), "House key was not accepted.");
  assert.equal(signInErrorCopy(""), undefined);

  const root = dirname(fileURLToPath(import.meta.url));
  const authSource = readFileSync(join(root, "../../auth.ts"), "utf8");
  const signInSource = readFileSync(join(root, "../../components/SignInForm.tsx"), "utf8");
  assert.equal(authSource.includes("providers/google"), false);
  assert.equal(authSource.includes("providers/twitter"), false);
  assert.ok(authSource.includes("providers/credentials"));
  assert.equal(signInSource.toLowerCase().includes("google"), false);
  assert.equal(signInSource.toLowerCase().includes("twitter"), false);
  assert.ok(signInSource.includes("signInHouseAccount"));

  console.log("house accounts + credentials providers ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
