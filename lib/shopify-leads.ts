import { shopifyUrl } from "@/config/shops";

const API_VERSION = "2026-10";

type UserError = { field?: string[] | null; message: string };

type CustomerNode = { id: string; tags?: string[] | null };

export type ShopifyLeadStatus = "saved" | "unconfigured" | "failed";

function adminHost(): string | undefined {
  const explicit = (process.env.SHOPIFY_SHOP ?? "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (explicit) return explicit;
  try {
    const host = new URL(shopifyUrl).host;
    if (host.endsWith(".myshopify.com")) return host;
  } catch {
    return undefined;
  }
  return undefined;
}

export function shopifyLeadConfigured(): boolean {
  return Boolean((process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "").trim() && adminHost());
}

function consent(state: "SUBSCRIBED" | "PENDING") {
  return {
    marketingState: state,
    marketingOptInLevel: "SINGLE_OPT_IN" as const,
    consentUpdatedAt: new Date().toISOString(),
  };
}

function isDuplicate(errors: UserError[]): boolean {
  return errors.some((error) => /already been taken/i.test(error.message));
}

function isConsent(errors: UserError[]): boolean {
  return errors.some((error) => /consent|marketing/i.test(error.message));
}

async function admin<T>(
  fetchImpl: typeof fetch,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const token = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "").trim();
  const host = adminHost();
  if (!token || !host) throw new Error("shopify_unconfigured");
  const response = await fetchImpl(`https://${host}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": token,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`shopify_http_${response.status}`);
  const body = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length || !body.data) throw new Error("shopify_graphql");
  return body.data;
}

async function findCustomer(fetchImpl: typeof fetch, email: string): Promise<CustomerNode | null> {
  const data = await admin<{ customers: { nodes: CustomerNode[] } }>(
    fetchImpl,
    `query FindCustomer($query: String!) {
      customers(first: 1, query: $query) {
        nodes { id tags }
      }
    }`,
    { query: `email:"${email.replace(/"/g, "")}"` },
  );
  return data.customers.nodes[0] ?? null;
}

async function writeConsent(
  fetchImpl: typeof fetch,
  customerId: string,
): Promise<void> {
  for (const state of ["SUBSCRIBED", "PENDING"] as const) {
    const data = await admin<{
      customerEmailMarketingConsentUpdate: { customer: { id: string } | null; userErrors: UserError[] };
    }>(
      fetchImpl,
      `mutation CustomerEmailMarketingConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
        customerEmailMarketingConsentUpdate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }`,
      { input: { customerId, emailMarketingConsent: consent(state) } },
    );
    const payload = data.customerEmailMarketingConsentUpdate;
    if (payload.customer?.id && payload.userErrors.length === 0) return;
    if (!isConsent(payload.userErrors)) return;
  }
}

async function refreshExisting(
  fetchImpl: typeof fetch,
  email: string,
  tags: string[],
  source: string,
): Promise<void> {
  const existing = await findCustomer(fetchImpl, email);
  if (!existing) return;
  const merged = [...new Set([...(existing.tags ?? []), ...tags])];
  await admin(
    fetchImpl,
    `mutation CustomerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer { id }
        userErrors { field message }
      }
    }`,
    {
      input: {
        id: existing.id,
        tags: merged,
        note: `Project SiXXX list. Source: ${source}.`,
      },
    },
  );
  await writeConsent(fetchImpl, existing.id);
}

/**
 * Creates or updates a Shopify customer with newsletter consent.
 * The public /contact customer form is rejected off-domain (missing CAPTCHA),
 * so this uses the Admin API when SHOPIFY_ADMIN_ACCESS_TOKEN is set.
 */
export async function saveShopifyLead(
  input: { email: string; source: string; tags: string[] },
  fetchImpl: typeof fetch = fetch,
): Promise<ShopifyLeadStatus> {
  if (!shopifyLeadConfigured()) return "unconfigured";

  const base = {
    email: input.email,
    tags: input.tags,
    note: `Project SiXXX list. Source: ${input.source}.`,
  };

  try {
    for (const state of ["SUBSCRIBED", "PENDING", null] as const) {
      const data = await admin<{
        customerCreate: { customer: { id: string } | null; userErrors: UserError[] };
      }>(
        fetchImpl,
        `mutation CustomerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer { id }
            userErrors { field message }
          }
        }`,
        {
          input: state ? { ...base, emailMarketingConsent: consent(state) } : base,
        },
      );
      const payload = data.customerCreate;
      if (payload.customer?.id && payload.userErrors.length === 0) return "saved";
      if (isDuplicate(payload.userErrors)) {
        try {
          await refreshExisting(fetchImpl, input.email, input.tags, input.source);
        } catch {
          console.error("shopify lead refresh failed");
        }
        return "saved";
      }
      if (state && isConsent(payload.userErrors)) continue;
      return "failed";
    }
    return "failed";
  } catch {
    console.error("shopify lead save failed");
    return "failed";
  }
}
