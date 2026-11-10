import { NextResponse } from "next/server";
import { getLeadId } from "@/lib/brand-server";
import { reportLeadView } from "@/lib/lead";

/**
 * Called once per browser session by <LeadViewBeacon /> after a lead has had the demo open for a few seconds.
 * The lead ID comes only from middleware's validated header, never from the request body.
 */
export async function POST() {
  const id = await getLeadId();
  if (!id) return new NextResponse(null, { status: 204 });
  await reportLeadView(id);
  return new NextResponse(null, { status: 204 });
}
