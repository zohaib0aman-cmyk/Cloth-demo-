import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, FileDown, MapPin, Package, Wallet } from "lucide-react";
import { getOrderByNumber, estimatedDelivery } from "@/lib/orders";
import { OrderSuccessHero } from "@/components/store/OrderSuccessHero";
import { DemoNotice } from "@/components/store/DemoNotice";
import { Steps } from "@/components/store/CheckoutClient";
import { SmartImage } from "@/components/SmartImage";
import { MotionIcon } from "@/components/motion/AnimatedIcon";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate, formatINR } from "@/lib/format";
import { PAYMENT_LABEL, STATUS_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ placed?: string }> }) {
  const [{ orderNumber }, sp] = await Promise.all([params, searchParams]);
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();
  const justPlaced = sp.placed === "1";
  const eta = estimatedDelivery(order.createdAt, order.deliveryOption);

  return (
    <div className="container max-w-4xl py-10 sm:py-14">
      <div className="mb-8 flex justify-center">
        <Steps current={4} />
      </div>
      <div className="text-center">
        <OrderSuccessHero celebrate={justPlaced} />
        <Reveal>
          <p className="eyebrow mt-6">{justPlaced ? "Thank you for your order" : `Order ${STATUS_LABEL[order.status]?.toLowerCase()}`}</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{justPlaced ? `Thank you, ${order.customerName.split(" ")[0]}!` : `Order ${order.orderNumber}`}</h1>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            Your order <b className="font-mono text-ink">{order.orderNumber}</b> has been placed. A confirmation has been sent to {order.email}.
          </p>
        </Reveal>
      </div>

      <div className="mt-8">
        <DemoNotice />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: CalendarDays, label: "Estimated delivery", value: eta.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) },
          { icon: Wallet, label: "Payment", value: PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod },
          { icon: Package, label: "Status", value: STATUS_LABEL[order.status] ?? order.status },
        ].map((c, i) => (
          <Reveal key={c.label} delay={i * 0.06} className="card flex items-center gap-3 p-4">
            <span className="rounded-full bg-brand/10 p-2.5 text-brand">
              <MotionIcon delay={0.2 + i * 0.08}><c.icon size={18} strokeWidth={1.6} /></MotionIcon>
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">{c.label}</p>
              <p className="text-sm font-semibold">{c.value}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <Reveal className="card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Order summary</h2>
            <span className="text-xs text-ink-mute">{formatDate(order.createdAt, true)}</span>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                  <SmartImage src={i.image} alt={i.name} fallbackKey={i.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-ink-mute">
                    Size {i.size} · {i.color} · Qty {i.qty}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-dashed border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Coupon {order.couponCode}</dt><dd>− {formatINR(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-soft">GST ({order.gstPercent}%)</dt><dd>{formatINR(order.gst)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Delivery ({order.deliveryOption})</dt><dd>{order.delivery ? formatINR(order.delivery) : "Free"}</dd></div>
            <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-semibold">Total paid</dt><dd className="font-serif text-2xl font-semibold">{formatINR(order.total)}</dd></div>
          </dl>
        </Reveal>
        <div className="space-y-4">
          <Reveal className="card p-5">
            <p className="label flex items-center gap-1.5"><MapPin size={13} /> Shipping to</p>
            <p className="text-sm font-semibold">{order.address.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {order.address.line1}
              {order.address.line2 && `, ${order.address.line2}`}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.address.phone}
            </p>
          </Reveal>
          <Reveal className="space-y-2" delay={0.1}>
            <a href={`/api/invoice/${order.orderNumber}`} className="btn-primary w-full" download>
              <MotionIcon><FileDown size={17} strokeWidth={1.6} /></MotionIcon> Download bill (PDF)
            </a>
            <Link href={`/track/${order.orderNumber}`} className="btn-dark w-full">
              <MotionIcon><Package size={17} strokeWidth={1.6} /></MotionIcon> Track order
            </Link>
            <Link href="/shop" className="btn-outline w-full">
              Continue shopping
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
