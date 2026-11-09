import { NextResponse } from "next/server";
import { normalizeLeadId } from "@/lib/brand";
import { getLeadBrand } from "@/lib/lead";

const ALLOWED = /^image\/(png|jpe?g|webp|gif|svg\+xml|avif|x-icon|vnd\.microsoft\.icon)$/i;

/** Serves a lead's logo from our own origin so the Lead System's host is never visible in the page source. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = normalizeLeadId((await params).id);
  const src = id ? (await getLeadBrand(id))?.logoUrl : null;
  if (!src) return new NextResponse(null, { status: 404 });
  try {
    const res = await fetch(src, { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) });
    const type = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!res.ok || !ALLOWED.test(type)) throw new Error(`HTTP ${res.status} ${type}`);
    const body = await res.arrayBuffer();
    if (body.byteLength > 5 * 1024 * 1024) throw new Error("logo larger than 5 MB");
    return new NextResponse(body, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=600, stale-while-revalidate=600",
        // SVG logos are served as images only: no scripts, no external loads.
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error(`[lead] ${id}: logo fetch failed — ${e instanceof Error ? e.message : String(e)}`);
    return new NextResponse(null, { status: 404 });
  }
}
