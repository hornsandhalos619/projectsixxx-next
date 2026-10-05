import React from "react";
import Link from "next/link";
import { shopCategories } from "@/config/affiliates";

export function ShopCategoryTiles({
  className = "grid-shelves",
  cardClassName = "card",
}: {
  className?: string;
  cardClassName?: string;
}) {
  return (
    <div className={className} style={{ marginTop: "1.25rem" }}>
      {shopCategories.map((cat) => (
        <Link className={cardClassName} key={cat.slug} href={`/shop/${cat.slug}`}>
          <h3>{cat.title}</h3>
          <p className="muted">{cat.dek}</p>
        </Link>
      ))}
    </div>
  );
}
