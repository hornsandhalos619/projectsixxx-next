"use server";

import { signIn } from "@/auth";
import { createHouseAccount } from "@/lib/house/accounts";
import { safeCallbackUrl } from "@/lib/auth-env";

export type RegisterResult = { ok: false; error: string };

export async function signInHouseAccount(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));
  await signIn("credentials", {
    email,
    password,
    redirectTo: callbackUrl,
  });
}

export async function registerHouseAccount(
  formData: FormData,
): Promise<RegisterResult | void> {
  const username = String(formData.get("username") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));

  if (password !== confirm) {
    return { ok: false, error: "Password and confirmation must match." };
  }

  const created = await createHouseAccount({ username, email, password });
  if (!created.ok) return created;

  await signIn("credentials", {
    email: created.account.email,
    password,
    redirectTo: callbackUrl,
  });
}
