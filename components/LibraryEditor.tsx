"use client";

import { useActionState, useMemo, useState } from "react";
import { slugify } from "@/lib/cms/slug";
import type { LibraryWork } from "@/lib/library";
import { deleteLibraryEntry, saveLibraryEntry, type LibraryState } from "@/lib/titles/actions";

const initial: LibraryState = null;

export function LibraryEditor({
  work,
  writable,
  saved,
}: {
  work?: LibraryWork;
  writable: boolean;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveLibraryEntry, initial);
  const [title, setTitle] = useState(work?.title ?? "");
  const [slug, setSlug] = useState(work?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(work?.slug));
  const suggested = useMemo(() => slugify(title), [title]);

  return (
    <form action={action} className="form form--wide">
      {work ? <input type="hidden" name="previousSlug" value={work.slug} /> : null}
      {saved ? <p className="admin-banner admin-banner--ok">Saved to the library store.</p> : null}
      {state?.ok === false ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      {!writable ? (
        <p className="admin-banner">
          Seat NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to write
          titles. Seed works in lib/library.ts stay in the tree.
        </p>
      ) : null}

      <label>
        Title
        <input
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          required
        />
      </label>
      <label>
        Slug
        <input
          name="slug"
          value={slug || suggested}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
        />
      </label>
      <label>
        Dek
        <textarea name="dek" defaultValue={work?.dek ?? ""} />
      </label>
      <label>
        Author
        <input name="author" defaultValue={work?.author ?? "House"} />
      </label>
      <label>
        Year
        <input name="year" defaultValue={work?.year ?? ""} />
      </label>
      <label>
        Format
        <input name="format" defaultValue={work?.format ?? ""} />
      </label>
      <label>
        Blurb
        <textarea name="blurb" defaultValue={work?.blurb ?? ""} />
      </label>
      <label>
        Sample (blank line between paragraphs)
        <textarea
          name="sample"
          className="journal-body"
          defaultValue={(work?.sample ?? []).join("\n\n")}
        />
      </label>
      <label>
        Status
        <select name="status" defaultValue={work?.status ?? "sample"}>
          <option value="sample">SAMPLE</option>
          <option value="house">House</option>
        </select>
      </label>
      <label>
        <input type="checkbox" name="featured" value="1" defaultChecked={Boolean(work?.featured)} />
        {" "}
        Feature on homepage
      </label>
      <label>
        Feature rank
        <input name="featuredRank" type="number" defaultValue={work?.featuredRank ?? ""} />
      </label>
      <div className="cta-row">
        <button className="btn btn-house" type="submit" disabled={pending || !writable}>
          {pending ? "Saving…" : work ? "Save title" : "Create title"}
        </button>
      </div>
    </form>
  );
}

export function LibraryDeleteButton({
  work,
  writable,
}: {
  work: LibraryWork;
  writable: boolean;
}) {
  if (!writable) return null;
  return (
    <form action={deleteLibraryEntry} className="form form--wide">
      <input type="hidden" name="slug" value={work.slug} />
      <button
        className="btn"
        type="submit"
        onClick={(event) => {
          if (!confirm("Remove this desk copy? Seed titles in lib/library.ts stay.")) {
            event.preventDefault();
          }
        }}
      >
        Remove desk copy
      </button>
    </form>
  );
}
