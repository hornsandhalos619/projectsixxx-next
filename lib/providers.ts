export type PublicProvider = {
  id: "google" | "twitter" | "nodemailer" | "demo";
  label: string;
};

export function publicProviders(): PublicProvider[] {
  const list: PublicProvider[] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    list.push({ id: "google", label: "Continue with Google" });
  }
  if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
    list.push({ id: "twitter", label: "Continue with X" });
  }
  if (process.env.AUTH_EMAIL_SERVER && process.env.AUTH_EMAIL_FROM) {
    list.push({ id: "nodemailer", label: "Continue with email" });
  }
  if (process.env.AUTH_DEMO === "1" && process.env.AUTH_DEMO_PASSWORD) {
    list.push({ id: "demo", label: "Continue with house key" });
  }
  return list;
}
