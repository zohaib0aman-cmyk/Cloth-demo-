import brandConfig from "@/config/brand.json";

/**
 * Default brand identity for this demo copy. Edit /config/brand.json to rebrand — never hardcode the brand
 * name or logo anywhere else. When a visitor opens the demo with a valid lead tracking ID (?id=ZYN-XX-XX-000000)
 * the lead's own details from the Zyntra Lead System replace these values (see lib/lead.ts).
 */
export type BrandConfig = { brandName: string; logoUrl: string; leadId: string };

export const defaultBrand: BrandConfig = {
  brandName: (brandConfig.brandName || "").trim(),
  logoUrl: (brandConfig.logoUrl || "").trim(),
  leadId: (brandConfig.leadId || "").trim(),
};

/** The brand as shown to one visitor. Only these fields ever reach the browser. */
export type ResolvedBrand = {
  brandName: string;
  /** null → show the initials in a circle instead of a logo image. */
  logoUrl: string | null;
  initials: string;
  /** "City, State" for a lead; null in the default demo (the store address from settings is used). */
  location: string | null;
  /** The lead's niche (e.g. "Ethnic wear"); null in the default demo. */
  niche: string | null;
  /** True when the details came from the Lead System. */
  isLead: boolean;
};

export function slugOf(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24) || "store"
  );
}

export function initialsOf(name: string): string {
  return (
    name
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "•"
  );
}

export function defaultResolvedBrand(): ResolvedBrand {
  return {
    brandName: defaultBrand.brandName,
    logoUrl: defaultBrand.logoUrl || null,
    initials: initialsOf(defaultBrand.brandName),
    location: null,
    niche: null,
    isLead: false,
  };
}

/** Tracking ID format from the Zyntra Lead System: ZYN-XX-XX-000000 (letters/digits, then six digits). */
export const LEAD_ID_PATTERN = /^ZYN-[A-Z0-9]{2}-[A-Z0-9]{2}-[0-9]{6}$/;

export function normalizeLeadId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const id = raw.trim().toUpperCase();
  return LEAD_ID_PATTERN.test(id) ? id : null;
}

export const LEAD_COOKIE = "zyn_lead";
export const LEAD_HEADER = "x-zyn-lead";

export const ZYNTRA_DEMO_NOTICE = "This is a demo website made by Zyntra. No real payment was taken.";
