import brandConfig from "@/config/brand.json";

/**
 * The ONLY source of brand identity for the whole site.
 * Edit /config/brand.json to rebrand — never hardcode the brand name or logo anywhere else.
 */
export type BrandConfig = { brandName: string; logoUrl: string; leadId: string };

export const brand: BrandConfig = {
  brandName: (brandConfig.brandName || "").trim(),
  logoUrl: (brandConfig.logoUrl || "").trim(),
  leadId: (brandConfig.leadId || "").trim(),
};

/** URL-safe version of the brand name, used for generated handles and emails. */
export const brandSlug =
  brand.brandName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "store";

export const brandInitials = brand.brandName
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0]?.toUpperCase())
  .join("");

export const ZYNTRA_DEMO_NOTICE = "This is a demo website made by Zyntra. No real payment was taken.";
