import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileDown, Printer } from "lucide-react";
import { prisma } from "@/lib/db";
import { toOrderDTO } from "@/lib/orders";
import { AdminHeader } from "@/components/admin/AdminShell";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SmartImage } from "@/components/SmartImage";
import { formatDate, formatINR } from "@/lib/format";
import { PAYMENT_LABEL, STATUS_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const row = await prisma.order.findUnique({ where: { id: (await params).id }, include: { items: true, events: { orderBy: { createdAt: "asc" } } } });
  if (!row) notFound();
  const o = toOrderDTO(row);
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-mute hover:text-ink">
        <ArrowLeft size={15} /> All orders
      </Link>
      <AdminHeader
        title={o.orderNumber}
        subtitle={`Placed ${formatDate(o.createdAt, true)} · ${PAYMENT_LABEL[o.paymentMethod]} · Ref ${o.paymentRef}`}
        action={
          <div className="flex flex-wrap gap-2">
            <a href={`/api/invoice/${o.orderNumber}?view=1`} target="_blank" rel="noopener noreferrer" className="btn-outline px-4 py-2.5"><Printer size={15} /> Print bill</a>
            <a href={`/api/invoice/${o.orderNumber}`} download className="btn-dark px-4 py-2.5"><FileDown size={15} /> Download bill</a>
            <Link href={`/track/${o.orderNumber}`} target="_blank" className="btn-outline px-4 py-2.5"><ExternalLink size={15} /> Customer view</Link>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <OrderStatusControl orderId={o.id} status={o.status} />
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Items</h2>
              <StatusBadge status={o.status} />
            </div>
            <ul className="mt-3 divide-y divide-line">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                    <SmartImage src={i.image} alt={i.name} fallbackKey={i.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-ink-mute">Size {i.size} · {i.color} · {formatINR(i.price)} × {i.qty}</p>
                  </div>
                  <span className="font-semibold">{formatINR(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-dashed border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Coupon {o.couponCode}</dt><dd>− {formatINR(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-ink-soft">GST ({o.gstPercent}%)</dt><dd>{formatINR(o.gst)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Delivery ({o.deliveryOption})</dt><dd>{o.delivery ? formatINR(o.delivery) : "Free"}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
            </dl>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-5 text-sm">
            <p className="label">Customer</p>
            <p className="font-semibold">{o.customerName}</p>
            <p className="text-ink-soft">{o.email}</p>
            <p className="text-ink-soft">{o.phone}</p>
            <p className="label mt-5">Shipping address</p>
            <p className="leading-relaxed text-ink-soft">
              {o.address.line1}
              {o.address.line2 && <>, {o.address.line2}</>}
              <br />
              {o.address.city}, {o.address.state} {o.address.pincode}
            </p>
          </div>
          <div className="card p-5">
            <p className="label">Timeline</p>
            <ol className="space-y-3">
              {o.events.map((e, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="font-medium">{STATUS_LABEL[e.status]}</p>
                    <p className="text-xs text-ink-mute">{formatDate(e.createdAt, true)}{e.note && ` · ${e.note}`}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
