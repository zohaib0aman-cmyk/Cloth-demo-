import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CustomersList } from "@/components/admin/CustomersList";
import { safeJSON } from "@/lib/format";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const [orders, users] = await Promise.all([prisma.order.findMany({ orderBy: { createdAt: "desc" } }), prisma.user.findMany({ orderBy: { createdAt: "desc" } })]);
  const map = new Map<string, { email: string; name: string; phone: string; city: string; registered: boolean; spent: number; orders: { id: string; orderNumber: string; total: number; status: string; createdAt: string }[] }>();
  users.forEach((u) => map.set(u.email, { email: u.email, name: u.name, phone: u.phone, city: "", registered: true, spent: 0, orders: [] }));
  orders.forEach((o) => {
    const c = map.get(o.email) ?? { email: o.email, name: o.customerName, phone: o.phone, city: "", registered: false, spent: 0, orders: [] };
    if (!c.city) c.city = safeJSON<{ city?: string }>(o.address, {}).city ?? "";
    if (!c.phone) c.phone = o.phone;
    c.orders.push({ id: o.id, orderNumber: o.orderNumber, total: o.total, status: o.status, createdAt: o.createdAt.toISOString() });
    if (o.status !== "CANCELLED") c.spent += o.total;
    map.set(o.email, c);
  });
  const customers = [...map.values()].sort((a, b) => b.spent - a.spent);
  return (
    <>
      <AdminHeader title="Customers" subtitle={`${customers.length} customers · ${users.length} with accounts`} />
      <CustomersList customers={customers} />
    </>
  );
}
