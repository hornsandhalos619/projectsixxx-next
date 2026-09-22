"use client";

import { useActionState } from "react";
import { grantEditorRole, revokeEditorRole, type HouseState } from "@/lib/house/actions";
import type { HouseSeat } from "@/lib/house/roles";

const initial: HouseState = null;

export function HouseRolesForm({
  seats,
  writable,
  actorEmail,
}: {
  seats: HouseSeat[];
  writable: boolean;
  actorEmail: string | null;
}) {
  const [state, action, pending] = useActionState(grantEditorRole, initial);

  return (
    <div>
      {state && "ok" in state && state.ok === false ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state && state.ok ? (
        <p className="admin-banner admin-banner--ok">Seat updated.</p>
      ) : null}
      {!writable ? (
        <p className="admin-banner">
          Role grants persist when NEXT_PUBLIC_SUPABASE_URL and
          SUPABASE_SERVICE_ROLE_KEY are seated. Local next dev writes data/house-roles.json.
        </p>
      ) : null}

      <div className="journal-desk" style={{ marginTop: "1.25rem" }}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {seats.map((seat) => (
              <tr key={seat.email}>
                <td>{seat.email}</td>
                <td>{seat.role}</td>
                <td className="muted">
                  {seat.source === "founder_emails" ? "FOUNDER_EMAILS" : "House desk"}
                </td>
                <td>
                  {seat.source === "house_desk" ? (
                    <form action={revokeEditorRole}>
                      <input type="hidden" name="email" value={seat.email} />
                      <button className="btn" type="submit" disabled={!writable}>
                        Revoke
                      </button>
                    </form>
                  ) : (
                    <span className="muted">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={action} className="form form--wide" style={{ marginTop: "1.75rem" }}>
        <p className="kicker">Grant a desk</p>
        <label>
          Email
          <input type="email" name="email" required autoComplete="off" />
        </label>
        <label>
          Role
          <select name="role" defaultValue="blog_admin">
            <option value="blog_admin">Blog Admin — journal only</option>
            <option value="shop_admin">Shop Admin — shop / affiliates only</option>
          </select>
        </label>
        <p className="muted">
          Founder is never granted here. Signed in as {actorEmail}. The granted
          editor signs in again so the session picks up the seat.
        </p>
        <button className="btn btn-house" type="submit" disabled={pending || !writable}>
          {pending ? "Granting…" : "Grant role"}
        </button>
      </form>
    </div>
  );
}
