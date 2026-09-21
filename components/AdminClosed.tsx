import Link from "next/link";

export function AdminClosed({
  email,
  desk = "This console",
}: {
  email: string | null;
  desk?: string;
}) {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Console</p>
        <h1>This desk stays locked</h1>
        <p className="lede">
          {email ? `Signed in as ${email}.` : "A house session is required."} {desk}{" "}
          opens for Founder and granted editors. Seed Founder with FOUNDER_EMAILS,
          then sign in again.
        </p>
      </header>
      <div className="cta-row">
        <Link className="btn btn-house" href="/account">
          Account
        </Link>
        <Link className="btn" href="/signin">
          Sign in
        </Link>
      </div>
    </div>
  );
}
