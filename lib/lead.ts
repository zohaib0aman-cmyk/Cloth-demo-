import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Server-only client for the Zyntra Lead System. LEAD_API_URL and LEAD_API_KEY are read here and nowhere else,
 * and nothing from this module except the picked fields below is ever passed to a page.
 */
export type LeadBrand = { brandName: string; logoUrl: string | null; city: string | null; state: string | null; niche: string | null };

const CACHE_SECONDS = 600; // 10 minutes

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Picks only the fields the demo is allowed to show; every other lead field is dropped here. */
function pickBrand(json: unknown): LeadBrand | null {
  const root = (json ?? {}) as Record<string, unknown>;
  const d = ((root.data ?? root.lead ?? root) as Record<string, unknown>) ?? {};
  const brandName = str(d.brand_name) ?? str(d.brandName) ?? str(d.business_name);
  if (!brandName) return null;
  const logo = str(d.logo_url) ?? str(d.logoUrl);
  return {
    brandName: brandName.slice(0, 80),
    logoUrl: logo && /^https?:\/\//i.test(logo) ? logo : null,
    city: str(d.city)?.slice(0, 60) ?? null,
    state: str(d.state)?.slice(0, 60) ?? null,
    niche: str(d.niche)?.slice(0, 60) ?? null,
  };
}

class LeadLookupError extends Error {}

async function requestLead(id: string): Promise<LeadBrand | null> {
  const base = process.env.LEAD_API_URL?.replace(/\/+$/, "");
  const key = process.env.LEAD_API_KEY;
  if (!base || !key) throw new LeadLookupError("LEAD_API_URL or LEAD_API_KEY is not set");

  let res: Response;
  try {
    res = await fetch(`${base}/api/v1/demo/leads/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store", // caching is handled by unstable_cache below, keyed by the lead ID
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    throw new LeadLookupError(`request failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  // A 404 is a definite answer ("no such lead"), so it is cached like a hit.
  if (res.status === 404) return null;
  if (!res.ok) throw new LeadLookupError(`HTTP ${res.status}`);
  const brand = pickBrand(await res.json().catch(() => null));
  if (!brand) throw new LeadLookupError("response had no brand name");
  return brand;
}

// Errors are thrown (not returned) so a temporary outage is never cached for 10 minutes.
const cachedLead = unstable_cache(requestLead, ["zyntra-lead-brand-v1"], { revalidate: CACHE_SECONDS, tags: ["lead-brand"] });

/** Returns the lead's brand details, or null (unknown lead / API problem) so the caller shows the default demo. */
export async function getLeadBrand(id: string): Promise<LeadBrand | null> {
  try {
    const brand = await cachedLead(id);
    if (!brand) console.warn(`[lead] ${id}: not found (404) — showing default demo`);
    return brand;
  } catch (e) {
    console.error(`[lead] ${id}: lookup failed — showing default demo. ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}
