/**
 * Shop policies that are already published on the Horns & Halos Shopify store.
 * Labels and links only. Do not restate or invent the policy text.
 */
export const DAMAGE_DEFECT_CLAIM_WINDOW = "7 days from delivery";

export const publishedShopPolicies = [
  {
    label: "Refund policy",
    href: "https://hornshalosshop.myshopify.com/policies/refund-policy",
  },
  {
    label: "Shipping policy",
    href: "https://hornshalosshop.myshopify.com/policies/shipping-policy",
  },
  {
    label: "Shop privacy policy",
    href: "https://hornshalosshop.myshopify.com/policies/privacy-policy",
  },
  {
    label: "Shop terms of service",
    href: "https://hornshalosshop.myshopify.com/policies/terms-of-service",
  },
  {
    label: "Contact information",
    href: "https://hornshalosshop.myshopify.com/policies/contact-information",
  },
] as const;
