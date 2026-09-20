import type { Metadata } from "next";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata: Metadata = { title: "Sign out" };

export default function SignOutPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Threshold</p>
        <h1>Leave the house</h1>
        <p className="lede">Session ends. The night does not.</p>
      </header>
      <SignOutButton />
    </div>
  );
}
