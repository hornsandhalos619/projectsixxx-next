import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="shell">
      <header className="page-head">
        <p className="kicker">Legal</p>
        <h1>Privacy</h1>
      </header>
      <div className="prose">
        <p>
          Project SiXXX collects what you type into contact, schedule, and list
          forms. If LEADS_* is empty, those addresses are not persisted. Auth
          providers only run when their keys are present. We do not sell lists.
        </p>
      </div>
    </div>
  );
}
