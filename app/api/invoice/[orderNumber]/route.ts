import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { renderInvoice } from "@/lib/invoice";
import { slugOf } from "@/lib/brand";
import { getBrand } from "@/lib/brand-server";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const order = await getOrderByNumber((await params).orderNumber);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const [settings, brand] = await Promise.all([getSettings(), getBrand()]);
  const pdf = await renderInvoice(order, settings, brand);
  const inline = new URL(req.url).searchParams.get("view") === "1";
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${slugOf(brand.brandName)}-invoice-${order.orderNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
