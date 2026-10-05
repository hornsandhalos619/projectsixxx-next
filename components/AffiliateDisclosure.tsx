import React from "react";

/** Amazon Associates + house affiliate line. Keep this small and identical on every shop surface. */
export const AMAZON_ASSOCIATE_LINE =
  "As an Amazon Associate I earn from qualifying purchases.";

export function AffiliateDisclosure() {
  return (
    <p className="ftc">
      {AMAZON_ASSOCIATE_LINE} Affiliate doors may earn the house a commission.
    </p>
  );
}
