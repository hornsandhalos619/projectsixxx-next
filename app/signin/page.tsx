import type { Metadata } from "next";
import { SignInForm } from "@/components/SignInForm";
import { signInErrorCopy } from "@/lib/auth-env";

export const metadata: Metadata = {
  title: "Sign in",
  description: "House sign-in. Founder is seeded only via FOUNDER_EMAILS.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Threshold</p>
        <h1>Sign in</h1>
        <p className="lede">
          First signup is a Member. Founder is seeded only through FOUNDER_EMAILS.
          The house key accepts a username or email.
        </p>
      </header>
      <SignInForm
        callbackUrl={callbackUrl || "/account"}
        errorMessage={signInErrorCopy(error)}
      />
    </div>
  );
}
