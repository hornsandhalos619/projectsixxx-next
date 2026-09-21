import type { Metadata } from "next";
import { SignInForm } from "@/components/SignInForm";
import { publicProviders } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Sign in",
  description: "House sign-in. Founder is seeded only via FOUNDER_EMAILS.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Threshold</p>
        <h1>Sign in</h1>
        <p className="lede">
          First signup is a Member. Founder is an allowlist. There is no role
          switcher.
        </p>
      </header>
      <SignInForm
        providers={publicProviders()}
        callbackUrl={callbackUrl || "/account"}
      />
    </div>
  );
}
