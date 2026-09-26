import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { localAllowed } from "@/lib/cms/local-allowed";
import { localJsonRead, localJsonWrite } from "@/lib/cms/local-json";
import { neonConfigured } from "@/lib/cms/neon";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/house/passwords";

export type HouseAccount = {
  id: string;
  username: string;
  usernameKey: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type HouseIdentity = {
  id: string;
  email: string;
  name: string;
};

export type AccountResult =
  | { ok: true; account: HouseIdentity }
  | { ok: false; error: string };

export type AccountStore = {
  findByEmail(email: string): Promise<HouseAccount | null>;
  findByUsernameKey(usernameKey: string): Promise<HouseAccount | null>;
  insert(account: HouseAccount): Promise<void>;
};

const USERNAME_RE = /^[a-zA-Z0-9._-]{1,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const LOCAL_FILE = "house-accounts";

export function normalizeEmail(raw: string): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function normalizeUsername(raw: string): string {
  return String(raw ?? "").trim();
}

export function usernameKeyOf(raw: string): string {
  return normalizeUsername(raw).toLowerCase();
}

export function isEmailLogin(raw: string): boolean {
  return String(raw ?? "").includes("@");
}

export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!username) return "Username is required.";
  if (username.includes("@")) return "Username uses letters, numbers, dots, underscores, or hyphens.";
  if (!USERNAME_RE.test(username)) {
    return "Username uses 1–32 letters, numbers, dots, underscores, or hyphens.";
  }
  return null;
}

export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!EMAIL_RE.test(email)) return "A real email is required.";
  return null;
}

export function validatePassword(raw: string): string | null {
  if (String(raw ?? "").length < MIN_PASSWORD) {
    return "Password needs at least 8 characters.";
  }
  return null;
}

export function toIdentity(account: HouseAccount): HouseIdentity {
  return {
    id: account.id,
    email: account.email,
    name: account.username,
  };
}

export function createMemoryAccountStore(seed: HouseAccount[] = []): AccountStore {
  const rows = [...seed];
  return {
    async findByEmail(email) {
      return rows.find((row) => row.email === email) ?? null;
    },
    async findByUsernameKey(usernameKey) {
      return rows.find((row) => row.usernameKey === usernameKey) ?? null;
    },
    async insert(account) {
      if (rows.some((row) => row.email === account.email || row.usernameKey === account.usernameKey)) {
        throw new DuplicateAccountError();
      }
      rows.push(account);
    },
  };
}

export class DuplicateAccountError extends Error {
  constructor() {
    super("That username or email already holds a key.");
    this.name = "DuplicateAccountError";
  }
}

export function accountsStoreReady(): boolean {
  return supabaseConfigured() || neonConfigured() || localAllowed();
}

export function liveAccountStore(): AccountStore | null {
  if (supabaseConfigured()) return supabaseAccountStore;
  if (neonConfigured()) return neonAccountStore;
  if (localAllowed()) return localAccountStore;
  return null;
}

export async function findAccountByLogin(
  login: string,
  store: AccountStore,
): Promise<HouseAccount | null> {
  const raw = String(login ?? "").trim();
  if (!raw) return null;
  if (isEmailLogin(raw)) {
    const email = normalizeEmail(raw);
    if (validateEmail(email)) return null;
    return store.findByEmail(email);
  }
  if (validateUsername(raw)) return null;
  return store.findByUsernameKey(usernameKeyOf(raw));
}

export async function createHouseAccountWithStore(
  input: { username: string; email: string; password: string },
  store: AccountStore,
): Promise<AccountResult> {
  const usernameError = validateUsername(input.username);
  if (usernameError) return { ok: false, error: usernameError };
  const emailError = validateEmail(input.email);
  if (emailError) return { ok: false, error: emailError };
  const passwordError = validatePassword(input.password);
  if (passwordError) return { ok: false, error: passwordError };

  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);
  const usernameKey = usernameKeyOf(username);

  const taken =
    (await store.findByEmail(email)) || (await store.findByUsernameKey(usernameKey));
  if (taken) return { ok: false, error: new DuplicateAccountError().message };

  const account: HouseAccount = {
    id: crypto.randomUUID(),
    username,
    usernameKey,
    email,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  try {
    await store.insert(account);
  } catch (error) {
    if (error instanceof DuplicateAccountError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  return { ok: true, account: toIdentity(account) };
}

export async function verifyHouseCredentialsWithStore(
  login: string,
  password: string,
  store: AccountStore,
): Promise<HouseIdentity | null> {
  if (!String(login ?? "").trim() || !password) return null;
  const account = await findAccountByLogin(login, store);
  if (!account) return null;
  const matched = await verifyPassword(password, account.passwordHash);
  if (!matched) return null;
  return toIdentity(account);
}

export async function createHouseAccount(input: {
  username: string;
  email: string;
  password: string;
}): Promise<AccountResult> {
  const store = liveAccountStore();
  if (!store) {
    return {
      ok: false,
      error:
        "House keys need a durable store. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or DATABASE_URL.",
    };
  }
  try {
    return await createHouseAccountWithStore(input, store);
  } catch (error) {
    console.error("house account create failed", error instanceof Error ? error.message : "unknown");
    return {
      ok: false,
      error: storeHint(error),
    };
  }
}

export async function verifyHouseCredentials(
  login: string,
  password: string,
): Promise<HouseIdentity | null> {
  const store = liveAccountStore();
  if (!store) return null;
  try {
    return await verifyHouseCredentialsWithStore(login, password, store);
  } catch (error) {
    console.error("house credentials lookup failed", error instanceof Error ? error.message : "unknown");
    return null;
  }
}

function storeHint(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/house_accounts|PGRST205|42P01/i.test(message)) {
    return "Apply supabase/migrations/0002_house_accounts.sql (or set DATABASE_URL) so house keys can persist.";
  }
  return "House key could not be created. Try again or check the account store.";
}

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "");
  return code === "23505" || /duplicate key|unique constraint/i.test(message);
}

function rowFromUnknown(row: Record<string, unknown> | null | undefined): HouseAccount | null {
  if (!row) return null;
  const id = String(row.id ?? "");
  const username = String(row.username ?? "");
  const usernameKey = String(row.username_key ?? row.usernameKey ?? "");
  const email = String(row.email ?? "");
  const passwordHash = String(row.password_hash ?? row.passwordHash ?? "");
  const createdAt = String(row.created_at ?? row.createdAt ?? "");
  if (!id || !username || !usernameKey || !email || !passwordHash) return null;
  return { id, username, usernameKey, email, passwordHash, createdAt };
}

const localAccountStore: AccountStore = {
  async findByEmail(email) {
    return localJsonRead<HouseAccount>(LOCAL_FILE).find((row) => row.email === email) ?? null;
  },
  async findByUsernameKey(usernameKey) {
    return (
      localJsonRead<HouseAccount>(LOCAL_FILE).find((row) => row.usernameKey === usernameKey) ?? null
    );
  },
  async insert(account) {
    const rows = localJsonRead<HouseAccount>(LOCAL_FILE);
    if (rows.some((row) => row.email === account.email || row.usernameKey === account.usernameKey)) {
      throw new DuplicateAccountError();
    }
    rows.push(account);
    localJsonWrite(LOCAL_FILE, rows);
  },
};

const supabaseAccountStore: AccountStore = {
  async findByEmail(email) {
    const { data, error } = await getSupabase()
      .from("house_accounts")
      .select("id, username, username_key, email, password_hash, created_at")
      .eq("email", email)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return rowFromUnknown((data ?? null) as Record<string, unknown> | null);
  },
  async findByUsernameKey(usernameKey) {
    const { data, error } = await getSupabase()
      .from("house_accounts")
      .select("id, username, username_key, email, password_hash, created_at")
      .eq("username_key", usernameKey)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return rowFromUnknown((data ?? null) as Record<string, unknown> | null);
  },
  async insert(account) {
    const { error } = await getSupabase().from("house_accounts").insert({
      id: account.id,
      username: account.username,
      username_key: account.usernameKey,
      email: account.email,
      password_hash: account.passwordHash,
      created_at: account.createdAt,
    });
    if (error && isUniqueViolation(error)) throw new DuplicateAccountError();
    if (error) throw new Error(error.message);
  },
};

let neonSql: NeonQueryFunction<false, false> | null = null;
let neonReady: Promise<void> | null = null;

function neonSqlClient(): NeonQueryFunction<false, false> {
  if (!neonSql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL or POSTGRES_URL is required for house accounts.");
    neonSql = neon(url);
  }
  return neonSql;
}

async function ensureNeonAccounts(): Promise<NeonQueryFunction<false, false>> {
  const sql = neonSqlClient();
  if (!neonReady) {
    neonReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS house_accounts (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          username_key TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  await neonReady;
  return sql;
}

const neonAccountStore: AccountStore = {
  async findByEmail(email) {
    const sql = await ensureNeonAccounts();
    const rows = await sql`
      SELECT id, username, username_key, email, password_hash, created_at
      FROM house_accounts
      WHERE email = ${email}
      LIMIT 1
    `;
    return rowFromUnknown((rows[0] ?? null) as Record<string, unknown> | null);
  },
  async findByUsernameKey(usernameKey) {
    const sql = await ensureNeonAccounts();
    const rows = await sql`
      SELECT id, username, username_key, email, password_hash, created_at
      FROM house_accounts
      WHERE username_key = ${usernameKey}
      LIMIT 1
    `;
    return rowFromUnknown((rows[0] ?? null) as Record<string, unknown> | null);
  },
  async insert(account) {
    const sql = await ensureNeonAccounts();
    try {
      await sql`
        INSERT INTO house_accounts (id, username, username_key, email, password_hash, created_at)
        VALUES (
          ${account.id},
          ${account.username},
          ${account.usernameKey},
          ${account.email},
          ${account.passwordHash},
          ${account.createdAt}
        )
      `;
    } catch (error) {
      if (isUniqueViolation(error as { code?: string; message?: string })) {
        throw new DuplicateAccountError();
      }
      throw error;
    }
  },
};
