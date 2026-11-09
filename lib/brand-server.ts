import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { LEAD_HEADER, defaultResolvedBrand, initialsOf, normalizeLeadId, type ResolvedBrand } from "./brand";
import { getLeadBrand } from "./lead";

/** The lead tracking ID for this request, as validated by middleware.ts (null → default demo). */
export const getLeadId = cache(async (): Promise<string | null> => normalizeLeadId((await headers()).get(LEAD_HEADER)));

/** The brand to show for this request: the lead's details when a valid, known tracking ID is present, otherwise brand.json. */
export const getBrand = cache(async (): Promise<ResolvedBrand> => {
  const id = await getLeadId();
  if (!id) return defaultResolvedBrand();
  const lead = await getLeadBrand(id);
  if (!lead) return defaultResolvedBrand();
  const location = [lead.city, lead.state].filter(Boolean).join(", ") || null;
  return {
    brandName: lead.brandName,
    // Remote logos are served through our own route so the lead system's host never appears in the page.
    logoUrl: lead.logoUrl ? `/api/brand/logo/${id}` : null,
    initials: initialsOf(lead.brandName),
    location,
    niche: lead.niche,
    isLead: true,
  };
});

/** The raw remote logo URL for server-side use (PDF invoice, logo proxy). Never send this to the browser. */
export async function getLeadLogoSource(): Promise<string | null> {
  const id = await getLeadId();
  if (!id) return null;
  return (await getLeadBrand(id))?.logoUrl ?? null;
}
