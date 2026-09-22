"use client";

import { useActionState, useMemo, useState } from "react";
import type { Artist, Work } from "@/lib/artists";
import { slugify } from "@/lib/cms/slug";
import { deleteArtistEntry, saveArtistEntry, type GalleryState } from "@/lib/gallery/actions";

const initial: GalleryState = null;

function emptyWork(): Work {
  return { title: "", year: "", medium: "", caption: "", mediaUrl: "" };
}

export function ArtistEditor({
  artist,
  writable,
  saved,
}: {
  artist?: Artist;
  writable: boolean;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveArtistEntry, initial);
  const [name, setName] = useState(artist?.name ?? "");
  const [slug, setSlug] = useState(artist?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(artist?.slug));
  const [works, setWorks] = useState<Work[]>(artist?.works.length ? artist.works : [emptyWork()]);
  const suggested = useMemo(() => slugify(name), [name]);

  return (
    <form action={action} className="form form--wide">
      {artist ? <input type="hidden" name="previousSlug" value={artist.slug} /> : null}
      {saved ? <p className="admin-banner admin-banner--ok">Saved to the gallery store.</p> : null}
      {state?.ok === false ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      {!writable ? (
        <p className="admin-banner">
          Seat NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to write
          artists. Seed roster in lib/artists.ts stays in the tree.
        </p>
      ) : null}

      <label>
        Name
        <input
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
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
        Role
        <input name="role" defaultValue={artist?.role ?? "Collaborator"} />
      </label>
      <label>
        Bio
        <textarea name="bio" defaultValue={artist?.bio ?? ""} />
      </label>
      <label>
        Public email
        <input name="email" type="email" defaultValue={artist?.email ?? ""} />
      </label>
      <label>
        Status
        <select name="status" defaultValue={artist?.status ?? "sample"}>
          <option value="sample">SAMPLE</option>
          <option value="house">House</option>
        </select>
      </label>
      <label>
        <input type="checkbox" name="featured" value="1" defaultChecked={Boolean(artist?.featured ?? (artist && artist.role === "Collaborator" && !artist.slug.startsWith("slot-open")))} />
        {" "}
        Feature on homepage
      </label>
      <label>
        Feature rank
        <input name="featuredRank" type="number" defaultValue={artist?.featuredRank ?? ""} />
      </label>
      <label>
        <input type="checkbox" name="mediaPending" value="1" defaultChecked={artist?.mediaPending !== false} />
        {" "}
        Media pending
      </label>

      <p className="kicker">Works / media</p>
      {works.map((work, index) => (
        <fieldset key={index} className="admin-note" style={{ marginBottom: "1rem" }}>
          <legend>Work {index + 1}</legend>
          <label>
            Title
            <input
              name="workTitle"
              value={work.title}
              onChange={(event) => {
                const next = [...works];
                next[index] = { ...work, title: event.target.value };
                setWorks(next);
              }}
            />
          </label>
          <label>
            Year
            <input name="workYear" defaultValue={work.year} />
          </label>
          <label>
            Medium
            <input name="workMedium" defaultValue={work.medium} />
          </label>
          <label>
            Caption
            <textarea name="workCaption" defaultValue={work.caption} />
          </label>
          <label>
            Media URL
            <input name="workMedia" defaultValue={work.mediaUrl ?? ""} placeholder="https://… or blob URL" />
          </label>
        </fieldset>
      ))}
      <button
        className="btn"
        type="button"
        onClick={() => setWorks((current) => [...current, emptyWork()])}
      >
        Add work
      </button>

      <label>
        Social label / href
        <input name="socialLabel" defaultValue={artist?.social[0]?.label ?? ""} placeholder="Site" />
        <input name="socialHref" defaultValue={artist?.social[0]?.href ?? ""} placeholder="/" />
      </label>
      <label>
        Store label / href
        <input name="storeLabel" defaultValue={artist?.store[0]?.label ?? ""} placeholder="Shop hub" />
        <input name="storeHref" defaultValue={artist?.store[0]?.href ?? ""} placeholder="/shop" />
      </label>

      <div className="cta-row">
        <button className="btn btn-house" type="submit" disabled={pending || !writable}>
          {pending ? "Saving…" : artist ? "Save artist" : "Create artist"}
        </button>
      </div>
    </form>
  );
}

export function ArtistDeleteButton({
  artist,
  writable,
}: {
  artist: Artist;
  writable: boolean;
}) {
  if (!writable) return null;
  return (
    <form action={deleteArtistEntry} className="form form--wide">
      <input type="hidden" name="slug" value={artist.slug} />
      <button
        className="btn"
        type="submit"
        onClick={(event) => {
          if (!confirm("Remove this desk copy? Seed roster in lib/artists.ts stays.")) {
            event.preventDefault();
          }
        }}
      >
        Remove desk copy
      </button>
    </form>
  );
}
