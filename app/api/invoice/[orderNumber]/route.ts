import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { renderInvoice } from "@/lib/invoice";
import { brandSlug } from "@/lib/brand";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const order = await getOrderByNumber((await params).orderNumber);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const pdf = await renderInvoice(order, await getSettings());
  const inline = new URL(req.url).searchParams.get("view") === "1";
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${brandSlug}-invoice-${order.orderNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
