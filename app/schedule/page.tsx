import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Book a conversation. Form only. No fake payments.",
};

export default function SchedulePage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Schedule</p>
        <h1>A conversation, not a cart</h1>
        <p className="lede">Tell us the work. We will answer with time. No payments on this page.</p>
      </header>
      <form className="form">
        <label>
          Name
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Surface
          <select name="surface" defaultValue="web-design">
            <option value="web-design">Web design</option>
            <option value="agentic-bots">Agentic bots</option>
            <option value="b2b">B2B</option>
            <option value="gallery">Gallery</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          When
          <input type="datetime-local" name="when" />
        </label>
        <label>
          Notes
          <textarea name="notes" />
        </label>
        <button className="btn btn-house" type="submit">
          Request time
        </button>
      </form>
    </div>
  );
}
