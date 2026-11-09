import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CouponManager } from "@/components/admin/CouponManager";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const [coupons, usage] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.order.groupBy({ by: ["couponCode"], _count: { _all: true }, where: { couponCode: { not: null } } }),
  ]);
  return (
    <>
      <AdminHeader title="Coupons" subtitle="Discount codes shoppers can apply in the bag." />
      <CouponManager coupons={coupons.map((c) => ({ ...c, uses: usage.find((u) => u.couponCode === c.code)?._count._all ?? 0 }))} />
    </>
  );
}
