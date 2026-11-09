import Link from "next/link";
import { ArrowRight, IndianRupee, Package, ShoppingCart, TriangleAlert, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MotionIcon } from "@/components/motion/AnimatedIcon";
import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/SmartImage";
import { formatDate, formatINR, safeJSON } from "@/lib/format";
import { brand } from "@/lib/brand";

export default async function Dashboard() {
  const [orders, products, customers] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ orderBy: { stock: "asc" }, include: { category: true } }),
    prisma.user.count(),
  ]);
  const valid = orders.filter((o) => o.status !== "CANCELLED");
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = valid.filter((o) => o.createdAt >= startOfToday);
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const guestEmails = new Set(orders.map((o) => o.email));

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - (13 - i));
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const dayOrders = valid.filter((o) => o.createdAt >= d && o.createdAt < next);
    return {
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      date: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  const sold = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
  valid.forEach((o) =>
    o.items.forEach((it) => {
      const key = it.productId ?? it.name;
      const cur = sold.get(key) ?? { name: it.name, image: it.image, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.price * it.qty;
      sold.set(key, cur);
    }),
  );
  const top = [...sold.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const low = products.filter((p) => p.stock <= 5).slice(0, 6);

  const stats = [
    { label: "Today's sales", value: formatINR(today.reduce((s, o) => s + o.total, 0)), sub: `${today.length} orders today`, icon: IndianRupee },
    { label: "Total orders", value: orders.length.toString(), sub: `${orders.filter((o) => o.status === "PLACED").length} awaiting packing`, icon: ShoppingCart },
    { label: "Revenue", value: formatINR(revenue), sub: `Avg. ${formatINR(valid.length ? revenue / valid.length : 0)} per order`, icon: Package },
    { label: "Customers", value: Math.max(customers, guestEmails.size).toString(), sub: `${customers} with accounts`, icon: Users },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" subtitle={`Welcome back. Here's how ${brand.brandName} is doing.`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05} className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">{s.label}</p>
              <span className="rounded-full bg-brand/10 p-2 text-brand">
                <MotionIcon delay={0.1 + i * 0.05}><s.icon size={16} strokeWidth={1.6} /></MotionIcon>
              </span>
            </div>
            <p className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-ink-mute">{s.sub}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Reveal className="card p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Revenue · last 14 days</h2>
            <span className="text-sm font-semibold">{formatINR(days.reduce((s, d) => s + d.revenue, 0))}</span>
          </div>
          <RevenueChart data={days} />
        </Reveal>
        <Reveal className="card p-5" delay={0.05}>
          <h2 className="mb-4 text-2xl font-semibold">Top products</h2>
          <ul className="space-y-3">
            {top.map((t, i) => (
              <li key={t.name} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-ink-mute">{i + 1}</span>
                <div className="h-11 w-9 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                  <SmartImage src={t.image} alt={t.name} fallbackKey={t.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-ink-mute">{t.qty} sold</p>
                </div>
                <span className="text-sm font-semibold">{formatINR(t.revenue)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Reveal className="card overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-2xl font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-brand">
              All orders <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-line transition hover:bg-ivory/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold hover:text-brand">{o.orderNumber}</Link>
                    </td>
                    <td className="px-3 py-3">{o.customerName}</td>
                    <td className="px-3 py-3 text-ink-mute">{formatDate(o.createdAt)}</td>
                    <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal className="card p-5" delay={0.05}>
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
            <MotionIcon className="text-amber-600"><TriangleAlert size={20} strokeWidth={1.6} /></MotionIcon> Low stock
          </h2>
          {low.length === 0 ? (
            <p className="text-sm text-ink-mute">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {low.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-ivory">
                    <div className="h-11 w-9 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                      <SmartImage src={safeJSON<string[]>(p.images, [])[0]} alt={p.name} fallbackKey={p.category.slug} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-ink-mute">{p.category.name}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{p.stock === 0 ? "Out" : `${p.stock} left`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </>
  );
}
