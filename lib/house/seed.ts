import {
  createHouseAccountWithStore,
  liveAccountStore,
  usernameKeyOf,
  validatePassword,
  validateUsername,
} from "@/lib/house/accounts";

const DEFAULT_SEED_EMAIL = "6@house.projectsixxx.com";

function seedUsername(): string {
  return (process.env.HOUSE_SEED_USERNAME ?? "").trim();
}

function seedPassword(): string {
  return process.env.HOUSE_SEED_PASSWORD ?? "";
}

function seedEmail(): string {
  return (process.env.HOUSE_SEED_EMAIL ?? DEFAULT_SEED_EMAIL).trim().toLowerCase();
}

/** Create the Founder desk account once if HOUSE_SEED_* env is set. */
export async function ensureSeededHouseAccount(): Promise<void> {
  const username = seedUsername();
  const password = seedPassword();
  if (!username || !password) return;
  if (validateUsername(username) || validatePassword(password)) return;

  const store = liveAccountStore();
  if (!store) return;

  const existing = await store.findByUsernameKey(usernameKeyOf(username));
  if (existing) return;

  const result = await createHouseAccountWithStore(
    {
      username,
      email: seedEmail(),
      password,
    },
    store,
  );
  if (!result.ok) {
    console.error("house seed account skipped", result.error);
  }
}
