/**
 * Gate I tee blank, identified from the live Shopify variant SKUs
 * 2111882_4016 through 2111882_4020. Those suffixes are Printful catalog
 * variant ids for Bella + Canvas 3001 Unisex Jersey Tee, black, S–2XL.
 *
 * Measurements are the garment spec on the Bella + Canvas style 3001
 * measurement specification (chest, and body length from the high point
 * of the shoulder). Sizes this tee is sold in only.
 */
export const GATE_I_PRODUCT_URL =
  "https://hornshalosshop.myshopify.com/products/the-unbroken-ring-gate-i-tee";

export const GATE_I_SIZE_SOURCE = {
  label: "Bella + Canvas style 3001 measurement specification",
  url: "https://www.bellacanvas.com/spec/3001.pdf",
} as const;

export const GATE_I_MEASUREMENTS = [
  { size: "S", chestInches: "18", bodyLengthFromHpsInches: "28" },
  { size: "M", chestInches: "20", bodyLengthFromHpsInches: "29" },
  { size: "L", chestInches: "22", bodyLengthFromHpsInches: "30" },
  { size: "XL", chestInches: "24", bodyLengthFromHpsInches: "31" },
  { size: "2XL", chestInches: "26", bodyLengthFromHpsInches: "32" },
] as const;
