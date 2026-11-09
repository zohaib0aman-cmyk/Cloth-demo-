import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { computeTotals, salePriceOf } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/auth";
import { safeJSON } from "@/lib/format";
import type { CouponDTO, ShippingAddress } from "@/lib/types";

type Body = {
  items: { productId: string; size: string; color: string; qty: number }[];
  address: ShippingAddress;
  deliveryOption: "standard" | "express";
  paymentMethod: "UPI" | "CARD" | "NETBANKING" | "COD";
  couponCode?: string | null;
  saveAddress?: boolean;
  paymentDetail?: string;
};

const METHODS = ["UPI", "CARD", "NETBANKING", "COD"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) return NextResponse.json({ error: "Your bag is empty" }, { status: 400 });
  if (!METHODS.includes(body.paymentMethod)) return NextResponse.json({ error: "Choose a payment method" }, { status: 400 });
  const a = body.address;
  if (!a?.name || !a.phone || !a.email || !a.line1 || !a.city || !a.state || !/^\d{6}$/.test(a.pincode ?? "")) {
    return NextResponse.json({ error: "Please complete your shipping address" }, { status: 400 });
  }

  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const products = await prisma.product.findMany({ where: { id: { in: body.items.map((i) => i.productId) }, active: true } });

  const lines: { productId: string; name: string; image: string; size: string; color: string; price: number; qty: number }[] = [];
  for (const item of body.items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return NextResponse.json({ error: "An item in your bag is no longer available" }, { status: 409 });
    const qty = Math.max(1, Math.floor(item.qty));
    if (p.stock < qty) return NextResponse.json({ error: `Only ${p.stock} left of ${p.name}. Please update your bag.` }, { status: 409 });
    lines.push({
      productId: p.id,
      name: p.name,
      image: safeJSON<string[]>(p.images, [])[0] ?? "",
      size: String(item.size).slice(0, 20),
      color: String(item.color).slice(0, 40),
      price: salePriceOf(p.price, p.discount),
      qty,
    });
  }

  let coupon: CouponDTO | null = null;
  if (body.couponCode) {
    const c = await prisma.coupon.findUnique({ where: { code: body.couponCode.toUpperCase() } });
    if (c?.active) coupon = { code: c.code, type: c.type as CouponDTO["type"], value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount, description: c.description };
  }

  const totals = computeTotals({ lines, coupon, ...settings, deliveryOption: body.deliveryOption, paymentMethod: body.paymentMethod });

  let orderNumber = "";
  for (let i = 0; i < 6; i++) {
    orderNumber = `ORD-${crypto.randomInt(30000, 99999)}`;
    if (!(await prisma.order.findUnique({ where: { orderNumber } }))) break;
  }
  const paymentRef = body.paymentMethod === "COD" ? "COD-PENDING" : `DEMO${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
  const address = { name: a.name.trim(), phone: a.phone.trim(), email: a.email.trim(), line1: a.line1.trim(), line2: (a.line2 ?? "").trim(), city: a.city.trim(), state: a.state, pincode: a.pincode };

  const order = await prisma.$transaction(async (tx) => {
    for (const l of lines) await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.qty } } });
    return tx.order.create({
      data: {
        orderNumber,
        userId: user?.id ?? null,
        customerName: address.name,
        email: address.email.toLowerCase(),
        phone: address.phone,
        address: JSON.stringify(address),
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: totals.discount > 0 ? coupon?.code : null,
        gst: totals.gst,
        gstPercent: settings.gstPercent,
        delivery: totals.delivery,
        total: totals.total,
        deliveryOption: body.deliveryOption === "express" ? "express" : "standard",
        paymentMethod: body.paymentMethod,
        paymentRef,
        items: { create: lines },
        events: { create: [{ status: "PLACED", note: body.paymentDetail ? `Paid via ${String(body.paymentDetail).slice(0, 60)}` : "" }] },
      },
    });
  });

  if (user && body.saveAddress) {
    const exists = await prisma.address.findFirst({ where: { userId: user.id, line1: address.line1, pincode: address.pincode } });
    if (!exists) {
      const count = await prisma.address.count({ where: { userId: user.id } });
      await prisma.address.create({ data: { userId: user.id, label: count ? "Other" : "Home", name: address.name, phone: address.phone, line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode, isDefault: count === 0 } });
    }
  }

  return NextResponse.json({ orderNumber: order.orderNumber });
}
