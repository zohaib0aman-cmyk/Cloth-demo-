import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";

export async function GET(_req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const order = await getOrderByNumber((await params).orderNumber);
  if (!order) return NextResponse.json({ error: "We couldn't find an order with that ID" }, { status: 404 });
  return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
