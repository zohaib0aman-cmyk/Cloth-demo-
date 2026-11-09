"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Lock, ShoppingBag, Tag, Trash2, X, Heart } from "lucide-react";
import type { CouponDTO } from "@/lib/types";
import { useCart, useHydrated, useWishlist } from "@/lib/store/cart";
import { SmartImage } from "../SmartImage";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { QtyStepper } from "./CartDrawer";
import { PriceSummary } from "./PriceSummary";
import { useTotals } from "./useTotals";
import { formatINR } from "@/lib/format";

export function CouponBox({ offers }: { offers: CouponDTO[] }) {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const totals = useTotals();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function apply(c: string) {
    setBusy(true);
    setError("");
    const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c, subtotal: totals.subtotal }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Invalid coupon");
    setCoupon(data.coupon);
    setCode("");
  }

  return (
    <div>
      <p className="label flex items-center gap-1.5">
        <Tag size={13} /> Coupon
      </p>
      <AnimatePresence mode="wait">
        {coupon ? (
          <motion.div key="applied" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between rounded-xl border border-dashed border-emerald-500 bg-emerald-50 px-4 py-3">
            <div>
              <p className="font-mono text-sm font-bold text-emerald-800">{coupon.code}</p>
              <p className="text-xs text-emerald-700">{totals.couponError ?? `You save ${formatINR(totals.discount)}`}</p>
            </div>
            <button onClick={() => setCoupon(null)} className="rounded-full p-1.5 text-emerald-800 hover:bg-emerald-100" aria-label="Remove coupon">
              <AnimatedIcon icon={X} size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) apply(code.trim());
            }}
            className="flex gap-2"
          >
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" className="input py-2.5 font-mono uppercase" aria-label="Coupon code" />
            <button disabled={busy} className="btn-dark shrink-0 px-5 py-2.5">
              {busy ? "…" : "Apply"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {error && <motion.p initial={{ x: -6 }} animate={{ x: 0 }} className="mt-2 text-xs font-medium text-brand">{error}</motion.p>}
      {!coupon && offers.length > 0 && (
        <div className="mt-3 space-y-2">
          {offers.map((o) => (
            <button key={o.code} onClick={() => apply(o.code)} className="flex w-full items-center justify-between rounded-xl border border-line bg-ivory/60 px-3 py-2 text-left transition hover:border-ink/30">
              <span>
                <span className="font-mono text-xs font-bold">{o.code}</span>
                <span className="block text-[11px] text-ink-mute">{o.description}</span>
              </span>
              <span className="text-xs font-semibold text-brand">Apply</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CartPage({ offers }: { offers: CouponDTO[] }) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const coupon = useCart((s) => s.coupon);
  const toggleWish = useWishlist((s) => s.toggle);
  const totals = useTotals();
  const hydrated = useHydrated();

  if (!hydrated)
    return (
      <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-32" />)}</div>
        <div className="skeleton h-80" />
      </div>
    );

  if (items.length === 0)
    return (
      <div className="container flex flex-col items-center py-24 text-center">
        <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="rounded-full bg-brand/10 p-8 text-brand">
          <ShoppingBag size={44} strokeWidth={1.3} />
        </motion.div>
        <h1 className="mt-6 text-4xl font-semibold">Your bag is empty</h1>
        <p className="mt-3 max-w-sm text-ink-mute">Looks like you haven&apos;t added anything yet. Explore our latest arrivals.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Explore the shop <ArrowRight size={16} />
        </Link>
      </div>
    );

  return (
    <div className="container py-8 sm:py-12">
      <h1 className="section-title">Your bag</h1>
      <p className="mt-2 text-sm text-ink-mute">{totals.itemCount} item{totals.itemCount === 1 ? "" : "s"}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li key={item.key} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} className="card flex gap-4 p-3 sm:p-4">
                <Link href={`/product/${item.slug}`} className="h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-ivory-deep sm:h-36 sm:w-28">
                  <SmartImage src={item.image} alt={item.name} fallbackKey={item.category} className="h-full w-full object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${item.slug}`} className="font-medium leading-snug hover:text-brand">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-ink-mute">
                        Size {item.size} · {item.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatINR(item.price * item.qty)}</p>
                      {item.mrp > item.price && <p className="text-xs text-ink-mute line-through">{formatINR(item.mrp * item.qty)}</p>}
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <QtyStepper value={item.qty} max={item.stock} onChange={(n) => setQty(item.key, n)} />
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          toggleWish(item.productId);
                          remove(item.key);
                        }}
                        className="btn-ghost px-3 py-2 text-xs"
                      >
                        <AnimatedIcon icon={Heart} size={14} /> <span className="hidden sm:inline">Save for later</span>
                      </button>
                      <button onClick={() => remove(item.key)} className="btn-ghost px-3 py-2 text-xs">
                        <AnimatedIcon icon={Trash2} size={14} /> <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-6 p-5 sm:p-6">
            <CouponBox offers={offers} />
            <div className="border-t border-line pt-5">
              <p className="label">Price details</p>
              <PriceSummary totals={totals} couponCode={coupon?.code} />
            </div>
            <Link href="/checkout" className="btn-primary w-full py-4">
              <AnimatedIcon icon={Lock} size={16} /> Proceed to checkout
            </Link>
            <p className="text-center text-[11px] text-ink-mute">Safe & secure payments · Easy 7-day returns</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
