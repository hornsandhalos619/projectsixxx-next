import React from "react";
import Link from "next/link";
import { DAMAGE_DEFECT_CLAIM_WINDOW, publishedShopPolicies } from "@/config/published-policies";

export function PolicyLinks() {
  return (
    <nav className="policy-links" aria-label="Policies">
      <p>
        Damage and defect claims: {DAMAGE_DEFECT_CLAIM_WINDOW}.
      </p>
      <ul>
        <li>
          <Link href="/legal/privacy">House privacy</Link>
        </li>
        <li>
          <Link href="/legal/terms">House terms</Link>
        </li>
        {publishedShopPolicies.map((policy) => (
          <li key={policy.href}>
            <a href={policy.href} rel="noopener noreferrer" target="_blank">
              {policy.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
