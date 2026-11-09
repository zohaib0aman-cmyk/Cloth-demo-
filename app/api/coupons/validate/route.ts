import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { couponDiscount } from "@/lib/pricing";
import type { CouponDTO } from "@/lib/types";

export async function POST(req: Request) {
  const { code, subtotal } = (await req.json().catch(() => ({}))) as { code?: string; subtotal?: number };
  if (!code) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
  const c = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!c || !c.active) return NextResponse.json({ error: "This coupon code isn't valid" }, { status: 404 });
  const coupon: CouponDTO = { code: c.code, type: c.type as CouponDTO["type"], value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount, description: c.description };
  const { error } = couponDiscount(coupon, Number(subtotal) || 0);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ coupon });
}
