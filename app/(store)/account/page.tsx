import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountClient } from "@/components/store/AccountClient";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  const [orders, addresses, products] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] }),
    getProducts(),
  ]);
  return (
    <AccountClient
      user={{ name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt.toISOString() }}
      orders={orders.map((o) => ({ orderNumber: o.orderNumber, total: o.total, status: o.status, createdAt: o.createdAt.toISOString(), items: o.items.map((i) => ({ name: i.name, image: i.image, qty: i.qty })) }))}
      addresses={addresses}
      products={products}
    />
  );
}
