import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { get, list, put } from "@vercel/blob";
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
const BLOB_PREFIX = "house-keys/v1/";

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

export function blobAccountsConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function accountsStoreReady(): boolean {
  return supabaseConfigured() || neonConfigured() || blobAccountsConfigured() || localAllowed();
}

export function accountsStoreBlockedMessage(): string | null {
  if (accountsStoreReady()) return null;
  return (
    "House keys need a durable store on this host. In Vercel → Project → Settings → Environment Variables, set either " +
    "NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (then run supabase/migrations/0002_house_accounts.sql), " +
    "or DATABASE_URL (Neon / Vercel Postgres), or BLOB_READ_WRITE_TOKEN. Also set AUTH_SECRET and FOUNDER_EMAILS."
  );
}

export function liveAccountStore(): AccountStore | null {
  if (supabaseConfigured()) return supabaseAccountStore;
  if (neonConfigured()) return neonAccountStore;
  if (blobAccountsConfigured()) return blobAccountStore;
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
      error: accountsStoreBlockedMessage() ?? "House key store is not configured.",
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
    return "Apply supabase/migrations/0002_house_accounts.sql (or set DATABASE_URL / BLOB_READ_WRITE_TOKEN) so house keys can persist.";
  }
  if (/blob|token|forbidden|unauthorized|403|401|access/i.test(message)) {
    const detail = message.replace(/^Vercel Blob:\s*/i, "").trim();
    return detail
      ? `House key store could not write to Blob: ${detail}`
      : "House key store could not write to Blob. Check BLOB_READ_WRITE_TOKEN on Vercel, and that the store access mode matches (private vs public).";
  }
  if (message) return `House key could not be created: ${message}`;
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

function blobPathFor(usernameKey: string): string {
  return `${BLOB_PREFIX}${usernameKey}.json`;
}

async function streamToJson(stream: ReadableStream<Uint8Array> | null | undefined): Promise<HouseAccount | null> {
  if (!stream) return null;
  try {
    const text = await new Response(stream).text();
    if (!text) return null;
    return rowFromUnknown(JSON.parse(text) as Record<string, unknown>);
  } catch {
    return null;
  }
}

/** Read a house-key JSON blob. Tries private first (password hashes), then public fallback. */
async function blobReadByPath(pathname: string): Promise<HouseAccount | null> {
  for (const access of ["private", "public"] as const) {
    try {
      const result = await get(pathname, { access });
      if (result && result.statusCode === 200) {
        const row = await streamToJson(result.stream);
        if (row) return row;
      }
    } catch {
      // try next access mode
    }
  }

  // Fallback: list + authenticated fetch (covers older public URLs)
  try {
    const { blobs } = await list({ prefix: pathname, limit: 5 });
    const match = blobs.find((entry) => entry.pathname === pathname);
    if (!match) return null;
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(match.url, { cache: "no-store", headers });
    if (!response.ok) return null;
    return rowFromUnknown((await response.json()) as Record<string, unknown>);
  } catch (error) {
    console.error("blobReadByPath", error instanceof Error ? error.message : "unknown");
    return null;
  }
}

async function blobReadByUsernameKey(usernameKey: string): Promise<HouseAccount | null> {
  return blobReadByPath(blobPathFor(usernameKey));
}

async function blobListAccounts(): Promise<HouseAccount[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 500 });
    const accounts = await Promise.all(
      blobs.map(async (entry) => {
        const byGet = await blobReadByPath(entry.pathname);
        if (byGet) return byGet;
        const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        try {
          const response = await fetch(entry.url, { cache: "no-store", headers });
          if (!response.ok) return null;
          return rowFromUnknown((await response.json()) as Record<string, unknown>);
        } catch {
          return null;
        }
      }),
    );
    return accounts.filter((row): row is HouseAccount => Boolean(row));
  } catch (error) {
    console.error("blobListAccounts", error instanceof Error ? error.message : "unknown");
    return [];
  }
}

/**
 * Put must match the store's access mode (private store rejects access:"public").
 * House keys prefer private so password hashes are not world-readable.
 */
async function blobPutAccount(pathname: string, body: string): Promise<void> {
  const optionsBase = {
    addRandomSuffix: false as const,
    allowOverwrite: true as const,
    contentType: "application/json",
  };

  let privateError: unknown;
  try {
    await put(pathname, body, { ...optionsBase, access: "private" });
    return;
  } catch (error) {
    privateError = error;
  }

  try {
    await put(pathname, body, { ...optionsBase, access: "public" });
    return;
  } catch (publicError) {
    const privateMsg = privateError instanceof Error ? privateError.message : String(privateError ?? "");
    const publicMsg = publicError instanceof Error ? publicError.message : String(publicError ?? "");
    throw new Error(
      `Blob put failed (private: ${privateMsg || "unknown"}; public: ${publicMsg || "unknown"})`,
    );
  }
}

const blobAccountStore: AccountStore = {
  async findByEmail(email) {
    const rows = await blobListAccounts();
    return rows.find((row) => row.email === email) ?? null;
  },
  async findByUsernameKey(usernameKey) {
    return blobReadByUsernameKey(usernameKey);
  },
  async insert(account) {
    const existingKey = await blobReadByUsernameKey(account.usernameKey);
    if (existingKey) throw new DuplicateAccountError();
    const byEmail = await blobListAccounts();
    if (byEmail.some((row) => row.email === account.email)) {
      throw new DuplicateAccountError();
    }
    await blobPutAccount(blobPathFor(account.usernameKey), JSON.stringify(account));
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
