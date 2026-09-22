"use client";

import { useActionState } from "react";
import type { AffiliateProduct } from "@/config/affiliates";
import { shopCategories } from "@/config/affiliates";
import { deleteAffiliateEntry, saveAffiliateEntry, type ShopState } from "@/lib/affiliates/actions";
import { slugify } from "@/lib/cms/slug";
import { useMemo, useState } from "react";

const initial: ShopState = null;

export function AffiliateEditor({
  product,
  writable,
  saved,
}: {
  product?: AffiliateProduct;
  writable: boolean;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveAffiliateEntry, initial);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const suggested = useMemo(() => slugify(name), [name]);

  return (
    <form action={action} className="form form--wide">
      {product ? <input type="hidden" name="previousSlug" value={product.slug} /> : null}
      {saved ? <p className="admin-banner admin-banner--ok">Saved to the shop store.</p> : null}
      {state?.ok === false ? (
        <p className="admin-banner admin-banner--err" role="alert">
          {state.error}
        </p>
      ) : null}
      {!writable ? (
        <p className="admin-banner">
          Seat NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to write
          products. Seed catalog in config/affiliates.ts stays in the tree.
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
        Shelf
        <select name="category" defaultValue={product?.category ?? "guitars"}>
          {shopCategories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Dek
        <textarea name="dek" defaultValue={product?.dek ?? ""} />
      </label>
      <label>
        Belief
        <textarea name="belief" defaultValue={product?.belief ?? ""} />
      </label>
      <label>
        Body
        <textarea name="body" defaultValue={product?.body ?? ""} />
      </label>
      <label>
        Merchant
        <input name="merchant" defaultValue={product?.merchant ?? ""} required />
      </label>
      <label>
        Merchant URL
        <input name="merchantUrl" type="url" defaultValue={product?.merchantUrl ?? ""} required />
      </label>
      <label>
        Network
        <select name="network" defaultValue={product?.network ?? "merchant"}>
          <option value="zzounds">zZounds</option>
          <option value="sweetwater">Sweetwater</option>
          <option value="amazon">Amazon</option>
          <option value="thomann">Thomann</option>
          <option value="bandh">B&amp;H</option>
          <option value="merchant">Merchant</option>
        </select>
      </label>
      <label>
        Price hint
        <input name="priceHint" defaultValue={product?.priceHint ?? ""} />
      </label>
      <label>
        Status
        <select name="status" defaultValue={product?.status ?? "sample"}>
          <option value="sample">SAMPLE</option>
          <option value="live">Live</option>
        </select>
      </label>
      <div className="cta-row">
        <button className="btn btn-house" type="submit" disabled={pending || !writable}>
          {pending ? "Saving…" : product ? "Save product" : "Create product"}
        </button>
      </div>
    </form>
  );
}

export function AffiliateDeleteButton({
  product,
  writable,
}: {
  product: AffiliateProduct;
  writable: boolean;
}) {
  if (!writable) return null;
  return (
    <form action={deleteAffiliateEntry} className="form form--wide">
      <input type="hidden" name="slug" value={product.slug} />
      <input type="hidden" name="category" value={product.category} />
      <button
        className="btn"
        type="submit"
        onClick={(event) => {
          if (!confirm("Remove this desk copy? Seed catalog in config/affiliates.ts stays.")) {
            event.preventDefault();
          }
        }}
      >
        Remove desk copy
      </button>
    </form>
  );
}
