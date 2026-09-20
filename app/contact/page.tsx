import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write the house. No fake payments.",
};

export default function ContactPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Contact</p>
        <h1>Write the house</h1>
        <p className="lede">A form. Not a checkout. We will not invent a charge.</p>
      </header>
      <form className="form" action="/contact" method="post">
        <label>
          Name
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Message
          <textarea name="message" required />
        </label>
        <button className="btn btn-house" type="submit">
          Send
        </button>
      </form>
      <p className="muted">This shell does not persist until an ESP is wired. Empty LEADS_* still succeeds on list capture.</p>
    </div>
  );
}
