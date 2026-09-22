"use client";

import { useActionState } from "react";
import { saveHomepageSlotEntry, type HomeState } from "@/lib/homepage/actions";
import type { HomepageSlot } from "@/lib/homepage/store";

const initial: HomeState = null;

function SlotForm({ slot, writable }: { slot: HomepageSlot; writable: boolean }) {
  const [state, action, pending] = useActionState(saveHomepageSlotEntry, initial);
  return (
    <form action={action} className="form form--wide admin-note" style={{ marginBottom: "1.5rem" }}>
      <input type="hidden" name="slot" value={slot.slot} />
      <p className="kicker">{slot.slot}</p>
      {state && "ok" in state && state.ok === false ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state && state.ok ? (
        <p className="admin-banner admin-banner--ok">Slot saved.</p>
      ) : null}
      <label>
        Title
        <input name="title" defaultValue={slot.title} />
      </label>
      <label>
        Body
        <textarea name="body" defaultValue={slot.body} />
      </label>
      <label>
        Attribution
        <input name="attribution" defaultValue={slot.attribution} />
      </label>
      <label>
        Href
        <input name="href" defaultValue={slot.href} placeholder="/library/est-in-darkness" />
      </label>
      <label>
        <input type="checkbox" name="enabled" value="1" defaultChecked={slot.enabled} />
        {" "}
        Show on homepage
      </label>
      <button className="btn btn-house" type="submit" disabled={pending || !writable}>
        {pending ? "Saving…" : "Save slot"}
      </button>
    </form>
  );
}

export function HomepageSlotsForm({
  slots,
  writable,
}: {
  slots: HomepageSlot[];
  writable: boolean;
}) {
  return (
    <div>
      {!writable ? (
        <p className="admin-banner">
          Seat NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to persist
          homepage slots.
        </p>
      ) : null}
      {slots.map((slot) => (
        <SlotForm key={slot.slot} slot={slot} writable={writable} />
      ))}
    </div>
  );
}
