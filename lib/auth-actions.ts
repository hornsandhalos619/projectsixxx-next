"use server";

import { signIn } from "@/auth";
import { googleOAuthEnv, safeCallbackUrl } from "@/lib/auth-env";

export async function startOAuthSignIn(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));

  if (provider === "google" && googleOAuthEnv()) {
    await signIn("google", { redirectTo: callbackUrl });
    return;
  }

  if (
    provider === "twitter" &&
    process.env.AUTH_TWITTER_ID &&
    process.env.AUTH_TWITTER_SECRET
  ) {
    await signIn("twitter", { redirectTo: callbackUrl });
  }
}
