"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  accountsStoreBlockedMessage,
  accountsStoreReady,
  createHouseAccount,
} from "@/lib/house/accounts";
import { safeCallbackUrl } from "@/lib/auth-env";

export type AuthActionResult = { ok: false; error: string };

export async function signInHouseAccount(
  formData: FormData,
): Promise<AuthActionResult | void> {
  if (!accountsStoreReady()) {
    return {
      ok: false,
      error: accountsStoreBlockedMessage() ?? "House key store is not configured.",
    };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "House key was not accepted." };
    }
    // Successful sign-in throws a NEXT_REDIRECT — rethrow so the client navigates.
    throw error;
  }
}

export async function registerHouseAccount(
  formData: FormData,
): Promise<AuthActionResult | void> {
  const username = String(formData.get("username") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));

  if (password !== confirm) {
    return { ok: false, error: "Password and confirmation must match." };
  }

  if (!accountsStoreReady()) {
    return {
      ok: false,
      error: accountsStoreBlockedMessage() ?? "House key store is not configured.",
    };
  }

  const created = await createHouseAccount({ username, email, password });
  if (!created.ok) return created;

  try {
    await signIn("credentials", {
      email: created.account.email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error: "Key was created but sign-in failed. Try Continue with house key.",
      };
    }
    throw error;
  }
}
