"use client";

import Link from "next/link";
import { useActionState } from "react";
import { journalTaxonomy, taxonomyCopy } from "@/config/site";
import {
  saveJournalPost,
  type JournalActionState,
} from "@/app/admin/journal/actions";
import type { EditorialStatus } from "@/lib/journal-io";

export type HouseEditorDefaults = {
  lane: "house";
  title?: string;
  dek?: string;
  excerpt?: string;
  author?: string;
  date?: string;
  category?: string;
  slug?: string;
  status?: EditorialStatus;
  content?: string;
  sample?: boolean;
  previousCategory?: string;
  previousSlug?: string;
};

export type OvermindEditorDefaults = {
  lane: "overmind";
  title?: string;
  teaser?: string;
  date?: string;
  slug?: string;
  tags?: string;
  status?: EditorialStatus;
  content?: string;
  previousSlug?: string;
};

export function JournalEditorForm({
  defaults,
}: {
  defaults: HouseEditorDefaults | OvermindEditorDefaults;
}) {
  const [state, action, pending] = useActionState<JournalActionState, FormData>(
    saveJournalPost,
    null,
  );
  const status = defaults.status ?? "draft";

  return (
    <form action={action} className="form form--journal">
      <input type="hidden" name="lane" value={defaults.lane} />
      {defaults.lane === "house" && defaults.sample ? (
        <input type="hidden" name="sample" value="1" />
      ) : null}
      {defaults.lane === "house" && defaults.previousCategory ? (
        <input
          type="hidden"
          name="previousCategory"
          value={defaults.previousCategory}
        />
      ) : null}
      {defaults.previousSlug ? (
        <input type="hidden" name="previousSlug" value={defaults.previousSlug} />
      ) : null}

      <label>
        Title
        <input
          name="title"
          required
          defaultValue={defaults.title ?? ""}
          autoComplete="off"
        />
      </label>

      {defaults.lane === "house" ? (
        <>
          <label>
            Dek
            <input name="dek" defaultValue={defaults.dek ?? ""} />
          </label>
          <label>
            Excerpt
            <textarea name="excerpt" defaultValue={defaults.excerpt ?? ""} />
          </label>
          <label>
            Author
            <input name="author" defaultValue={defaults.author ?? "House"} />
          </label>
          <label>
            Shelf
            <select name="category" defaultValue={defaults.category ?? "fine-art"}>
              {journalTaxonomy.map((slug) => (
                <option key={slug} value={slug}>
                  {taxonomyCopy[slug].title}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <>
          <label>
            Teaser
            <textarea
              name="teaser"
              maxLength={160}
              defaultValue={defaults.teaser ?? ""}
            />
          </label>
          <label>
            Tags
            <input
              name="tags"
              defaultValue={defaults.tags ?? ""}
              placeholder="field-notes, will, verify"
            />
          </label>
          <p className="muted">Author is locked to Overmind. Stream is overmind.</p>
        </>
      )}

      <div className="journal-form-row">
        <label>
          Date
          <input type="date" name="date" defaultValue={defaults.date ?? ""} />
        </label>
        <label>
          Slug
          <input
            name="slug"
            defaultValue={defaults.slug ?? ""}
            placeholder="from-title-if-empty"
            autoComplete="off"
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <label>
        Body
        <textarea
          name="content"
          className="journal-body"
          defaultValue={defaults.content ?? ""}
          spellCheck
        />
      </label>

      {state?.error ? (
        <p className="journal-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="cta-row">
        <button className="btn btn-house" type="submit" disabled={pending}>
          {pending ? "Saving" : "Save"}
        </button>
        <Link className="btn" href="/admin/journal">
          Back to console
        </Link>
      </div>
    </form>
  );
}
