import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { safeJSON } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
  return (
    <>
      <AdminHeader title="Orders" subtitle="Open an order to update its status — the customer's tracking page updates live." />
      <OrdersTable
        rows={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          email: o.email,
          city: safeJSON<{ city?: string }>(o.address, {}).city ?? "",
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt.toISOString(),
          items: o.items.reduce((n, i) => n + i.qty, 0),
        }))}
      />
    </>
  );
}
