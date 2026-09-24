import { googleOAuthEnv, houseKeyEnabled } from "@/lib/auth-env";

export type PublicProvider = {
  id: "google" | "twitter" | "nodemailer" | "credentials";
  label: string;
};

export function publicProviders(): PublicProvider[] {
  const list: PublicProvider[] = [];
  if (googleOAuthEnv()) {
    list.push({ id: "google", label: "Continue with Google" });
  }
  if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
    list.push({ id: "twitter", label: "Continue with X" });
  }
  if (process.env.AUTH_EMAIL_SERVER && process.env.AUTH_EMAIL_FROM) {
    list.push({ id: "nodemailer", label: "Continue with email" });
  }
  if (houseKeyEnabled()) {
    list.push({ id: "credentials", label: "Continue with house key" });
  }
  return list;
}
