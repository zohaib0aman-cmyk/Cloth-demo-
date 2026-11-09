import { NextResponse, type NextRequest } from "next/server";
import { LEAD_COOKIE, LEAD_HEADER, normalizeLeadId } from "@/lib/brand";

/**
 * Reads ?id=ZYN-XX-XX-000000 and remembers it for this browser session so the lead stays branded while they browse.
 * - valid id      → use it and remember it
 * - invalid id    → default demo, and forget any remembered id
 * - no id         → keep the id remembered from this session (if any)
 * The effective id is forwarded to the server in a request header; anything the browser sent in that header is discarded.
 */
export function middleware(req: NextRequest) {
  // Only page URLs carry the tracking ID; API routes use ?id for their own purposes.
  const param = req.nextUrl.pathname.startsWith("/api/") ? null : req.nextUrl.searchParams.get("id");
  const fromCookie = normalizeLeadId(req.cookies.get(LEAD_COOKIE)?.value);
  const leadId = param !== null ? normalizeLeadId(param) : fromCookie;

  const headers = new Headers(req.headers);
  headers.delete(LEAD_HEADER);
  if (leadId) headers.set(LEAD_HEADER, leadId);
  const res = NextResponse.next({ request: { headers } });

  if (param !== null) {
    if (leadId) res.cookies.set(LEAD_COOKIE, leadId, { httpOnly: true, sameSite: "lax", path: "/", secure: req.nextUrl.protocol === "https:" });
    else if (req.cookies.has(LEAD_COOKIE)) res.cookies.delete(LEAD_COOKIE);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|favicon.ico).*)"],
};
