"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Bike, CircleCheck, ClipboardList, House, PackageCheck, Search, Truck, XCircle, FileDown, RefreshCcw } from "lucide-react";
import { ORDER_STEPS, STATUS_LABEL } from "@/lib/types";
import type { OrderDTO } from "@/lib/orders";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { SmartImage } from "../SmartImage";
import { cn, formatDate, formatINR } from "@/lib/format";

const ICONS = { PLACED: ClipboardList, PACKED: PackageCheck, SHIPPED: Truck, OUT_FOR_DELIVERY: Bike, DELIVERED: House };
const COPY: Record<string, string> = {
  PLACED: "We have received your order and it is being prepared.",
  PACKED: "Your items have been quality-checked and packed with care.",
  SHIPPED: "Your parcel is on its way with our delivery partner.",
  OUT_FOR_DELIVERY: "Your parcel is out for delivery and will reach you today.",
  DELIVERED: "Delivered. We hope you love it!",
};

export function TrackForm({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [id, setId] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (id.trim()) router.push(`/track/${id.trim().toUpperCase()}`);
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. ORD-24101" className="input rounded-full py-3.5 pl-11 font-mono uppercase" aria-label="Order ID" />
      </div>
      <button className="btn-primary px-8 py-3.5">Track order</button>
    </form>
  );
}

export function TrackingTimeline({ initial }: { initial: OrderDTO }) {
  const [order, setOrder] = useState(initial);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Live updates: poll so admin status changes appear within seconds.
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${initial.orderNumber}`, { cache: "no-store" });
        if (!r.ok) return;
        const d = (await r.json()) as { order: OrderDTO };
        setOrder((prev) => {
          if (prev.status !== d.order.status || prev.events.length !== d.order.events.length) {
            setPulse(true);
            setTimeout(() => setPulse(false), 2200);
          }
          return d.order;
        });
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [initial.orderNumber]);

  const cancelled = order.status === "CANCELLED";
  const current = ORDER_STEPS.indexOf(order.status as (typeof ORDER_STEPS)[number]);
  const eventFor = (s: string) => [...order.events].reverse().find((e) => e.status === s);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">Order</p>
            <p className="font-mono text-xl font-bold">{order.orderNumber}</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={order.status}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn("rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider", cancelled ? "bg-red-50 text-red-700" : order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-brand/10 text-brand")}
            >
              {STATUS_LABEL[order.status]}
            </motion.span>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {pulse && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <RefreshCcw size={13} /> Status just updated
            </motion.p>
          )}
        </AnimatePresence>

        {cancelled ? (
          <div className="mt-8 flex items-center gap-4 rounded-2xl bg-red-50 p-5 text-red-800">
            <XCircle size={28} />
            <p className="text-sm">This order was cancelled. Any amount paid is refunded to the original payment method within 5–7 working days.</p>
          </div>
        ) : (
          <ol className="relative mt-8">
            {ORDER_STEPS.map((s, i) => {
              const done = i <= current;
              const active = i === current;
              const ev = eventFor(s);
              const Icon = ICONS[s];
              return (
                <li key={s} className="relative flex gap-4 pb-9 last:pb-0">
                  {i < ORDER_STEPS.length - 1 && (
                    <span className="absolute left-[21px] top-11 h-[calc(100%-2.75rem)] w-0.5 overflow-hidden rounded bg-line">
                      <motion.span className="block w-full bg-brand" initial={{ height: 0 }} animate={{ height: i < current ? "100%" : "0%" }} transition={{ duration: 0.6, delay: 0.2 + i * 0.25 }} />
                    </span>
                  )}
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.12 }}
                    className={cn("relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500", done ? "border-brand bg-brand text-white" : "border-line bg-white text-ink-mute")}
                  >
                    {active && order.status !== "DELIVERED" && <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />}
                    {done && !active ? <CircleCheck size={19} /> : <Icon size={19} />}
                  </motion.span>
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className="pt-1.5">
                    <p className={cn("font-semibold", !done && "text-ink-mute")}>{STATUS_LABEL[s]}</p>
                    <p className="mt-0.5 text-sm text-ink-mute">{done ? COPY[s] : "Pending"}</p>
                    {ev && <p className="mt-1 text-xs font-medium text-ink-soft">{formatDate(ev.createdAt, true)}</p>}
                  </motion.div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-8 flex items-center gap-2 text-[11px] text-ink-mute">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live — this page refreshes automatically
        </p>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <p className="label">Items</p>
          <ul className="space-y-3">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-3">
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                  <SmartImage src={i.image} alt={i.name} fallbackKey={i.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{i.name}</p>
                  <p className="text-xs text-ink-mute">
                    {i.size} · Qty {i.qty}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
            <span className="text-ink-soft">Total</span>
            <span className="font-semibold">{formatINR(order.total)}</span>
          </div>
        </div>
        <div className="card p-5 text-sm">
          <p className="label">Delivering to</p>
          <p className="font-semibold">{order.address.name}</p>
          <p className="text-ink-soft">
            {order.address.city}, {order.address.state} {order.address.pincode}
          </p>
        </div>
        <a href={`/api/invoice/${order.orderNumber}`} className="btn-outline w-full" download>
          <AnimatedIcon icon={FileDown} size={16} /> Download bill
        </a>
        <Link href="/contact" className="btn-ghost w-full">
          Need help with this order?
        </Link>
      </div>
    </div>
  );
}
