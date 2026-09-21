"use client";

import { useActionState, useMemo, useState } from "react";
import { deleteJournalEntry, saveJournalEntry, type SaveState } from "@/lib/cms/actions";
import { slugify, todayStamp } from "@/lib/cms/slug";
import type { CmsRecord, JournalStream, PublishStatus } from "@/lib/cms/types";
import { journalTaxonomy } from "@/config/site";

const initialState: SaveState = null;

export function JournalEditor({
  record,
  writable,
  saved,
}: {
  record?: CmsRecord;
  writable: boolean;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveJournalEntry, initialState);
  const [stream, setStream] = useState<JournalStream>(record?.stream ?? "overmind");
  const [title, setTitle] = useState(record?.title ?? "");
  const [slug, setSlug] = useState(record?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(record?.slug));

  const defaultDate = record?.date || todayStamp();
  const suggestedSlug = useMemo(() => slugify(title), [title]);

  return (
    <form action={action} className="form form--wide">
      {record ? (
        <>
          <input type="hidden" name="previousStream" value={record.stream} />
          <input type="hidden" name="previousSlug" value={record.slug} />
          <input type="hidden" name="previousCategory" value={record.category ?? ""} />
        </>
      ) : null}

      {saved ? <p className="admin-banner admin-banner--ok">Saved to the journal store.</p> : null}
      {state?.ok === false ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      {!writable ? (
        <p className="admin-banner">
          This deployment can list seed MDX. Set DATABASE_URL, BLOB_READ_WRITE_TOKEN,
          or GITHUB_TOKEN to create and edit from the desk.
        </p>
      ) : null}

      <label>
        Stream
        <select
          name="stream"
          value={stream}
          onChange={(event) => setStream(event.target.value as JournalStream)}
        >
          <option value="overmind">Overmind Journal · /overmind/journal</option>
          <option value="house">House Journal · /journal</option>
        </select>
      </label>

      {stream === "house" ? (
        <label>
          Shelf
          <select name="category" defaultValue={record?.category ?? "fine-art"}>
            {journalTaxonomy.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label>
          Tags
          <input
            name="tags"
            defaultValue={(record?.tags ?? []).join(", ")}
            placeholder="field-notes, project-sixxx"
          />
        </label>
      )}

      <label>
        Title
        <input
          name="title"
          value={title}
          onChange={(event) => {
            const next = event.target.value;
            setTitle(next);
            if (!slugTouched) setSlug(slugify(next));
          }}
          required
        />
      </label>

      <label>
        Slug
        <input
          name="slug"
          value={slug || suggestedSlug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
        />
      </label>

      <label>
        Date
        <input name="date" type="date" defaultValue={defaultDate} required />
      </label>

      <label>
        Excerpt
        <textarea
          name="excerpt"
          defaultValue={record?.excerpt ?? record?.teaser ?? record?.dek ?? ""}
          maxLength={240}
          placeholder="One or two sentences for the public list."
        />
      </label>

      <label>
        Body (Markdown / MDX)
        <textarea
          name="body"
          className="journal-body"
          defaultValue={record?.body ?? ""}
          placeholder="Write the entry."
        />
      </label>

      <label>
        Status
        <select name="status" defaultValue={(record?.status ?? "draft") as PublishStatus}>
          <option value="draft">Draft — desk only</option>
          <option value="published">Published — live on the public shelf</option>
        </select>
      </label>

      <div className="cta-row">
        <button className="btn btn-house" type="submit" disabled={pending || !writable}>
          {pending ? "Saving…" : record ? "Save entry" : "Create entry"}
        </button>
      </div>
    </form>
  );
}

export function JournalDeleteButton({
  record,
  writable,
}: {
  record: CmsRecord;
  writable: boolean;
}) {
  if (!writable) return null;
  return (
    <form action={deleteJournalEntry} className="form form--wide">
      <input type="hidden" name="stream" value={record.stream} />
      <input type="hidden" name="slug" value={record.slug} />
      <input type="hidden" name="category" value={record.category ?? ""} />
      <button
        className="btn"
        type="submit"
        onClick={(event) => {
          if (!confirm("Remove this desk copy? Seed MDX under content/ stays in the tree.")) {
            event.preventDefault();
          }
        }}
      >
        Remove desk copy
      </button>
    </form>
  );
}
