"use client";

import { useActionState, useMemo, useState } from "react";
import {
  saveJournalPost,
  type JournalActionState,
} from "@/app/admin/journal/actions";
import { journalTaxonomy, taxonomyCopy } from "@/config/site";
import type { JournalLane, PublishState } from "@/lib/journal-model";

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type JournalEditorValues = {
  title: string;
  slug: string;
  body: string;
  date: string;
  publishState: PublishState;
  teaser?: string;
  tags?: string;
  category?: string;
  dek?: string;
  excerpt?: string;
  author?: string;
  kind?: "sample" | "house";
};

export function JournalEditor({
  lane,
  mode,
  initial,
  storeLabel,
  storeReady,
}: {
  lane: JournalLane;
  mode: "create" | "edit";
  initial: JournalEditorValues;
  storeLabel: string;
  storeReady: boolean;
}) {
  const [state, action, pending] = useActionState<JournalActionState, FormData>(
    saveJournalPost,
    {},
  );
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const previewSlug = useMemo(() => {
    if (slugTouched) return slug;
    return slugifyTitle(title);
  }, [slug, slugTouched, title]);

  return (
    <form action={action} className="form form--journal">
      <input type="hidden" name="lane" value={lane} />
      <input type="hidden" name="mode" value={mode} />
      {mode === "edit" ? <input type="hidden" name="slug" value={initial.slug} /> : null}

      <p className="muted journal-store-note">Ledger: {storeLabel}.</p>
      {state.error ? <p className="journal-error">{state.error}</p> : null}
      {!storeReady ? (
        <p className="journal-error">
          Publishing on this host needs BLOB_READ_WRITE_TOKEN.
        </p>
      ) : null}

      <label>
        Title
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>

      <label>
        Slug
        <input
          name={mode === "create" ? "slug" : undefined}
          value={previewSlug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          readOnly={mode === "edit"}
          required
        />
      </label>

      <label>
        Date
        <input type="date" name="date" defaultValue={initial.date} required />
      </label>

      {lane === "overmind" ? (
        <>
          <label>
            Teaser
            <input
              name="teaser"
              defaultValue={initial.teaser}
              maxLength={160}
              placeholder="One breath for the index"
            />
          </label>
          <label>
            Tags
            <input
              name="tags"
              defaultValue={initial.tags}
              placeholder="origin, ai-journal"
            />
          </label>
        </>
      ) : (
        <>
          {mode === "edit" ? (
            <input type="hidden" name="category" value={initial.category} />
          ) : null}
          <label>
            Shelf
            <select
              name={mode === "create" ? "category" : undefined}
              defaultValue={initial.category ?? "fine-art"}
              disabled={mode === "edit"}
              required
            >
              {journalTaxonomy.map((category) => (
                <option key={category} value={category}>
                  {taxonomyCopy[category].title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Dek
            <input name="dek" defaultValue={initial.dek} />
          </label>
          <label>
            Excerpt
            <textarea name="excerpt" defaultValue={initial.excerpt} />
          </label>
          <label>
            Author
            <input name="author" defaultValue={initial.author ?? "House"} />
          </label>
          <label>
            Kind
            <select name="kind" defaultValue={initial.kind ?? "house"}>
              <option value="house">House</option>
              <option value="sample">Sample</option>
            </select>
          </label>
        </>
      )}

      <label>
        Body
        <textarea
          name="body"
          className="journal-body"
          defaultValue={initial.body}
          required
          spellCheck
        />
      </label>

      <div className="cta-row">
        <button
          className="btn"
          type="submit"
          name="intent"
          value="draft"
          disabled={pending || !storeReady}
        >
          {pending ? "Holding…" : "Save draft"}
        </button>
        <button
          className="btn btn-house"
          type="submit"
          name="intent"
          value="publish"
          disabled={pending || !storeReady}
        >
          {pending ? "Holding…" : "Publish"}
        </button>
      </div>
    </form>
  );
}
