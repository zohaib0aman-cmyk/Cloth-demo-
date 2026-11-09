import type { Metadata } from "next";
import { CartPage } from "@/components/store/CartPage";
import { prisma } from "@/lib/db";
import type { CouponDTO } from "@/lib/types";

export const metadata: Metadata = { title: "Your bag" };

export default async function Cart() {
  const coupons = await prisma.coupon.findMany({ where: { active: true }, orderBy: { minOrder: "asc" }, take: 4 });
  const offers: CouponDTO[] = coupons.map((c) => ({ code: c.code, type: c.type as CouponDTO["type"], value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount, description: c.description }));
  return <CartPage offers={offers} />;
}
