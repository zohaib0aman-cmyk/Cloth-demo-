"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart, useHydrated } from "@/lib/store/cart";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { SmartImage } from "../SmartImage";
import { formatINR } from "@/lib/format";
import { useTotals } from "./useTotals";

export function QtyStepper({ value, onChange, max }: { value: number; onChange: (n: number) => void; max: number }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button onClick={() => onChange(value - 1)} disabled={value <= 1} className="p-2 disabled:opacity-30" aria-label="Decrease quantity">
        <AnimatedIcon icon={Minus} size={14} />
      </button>
      <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center text-sm font-semibold">
        {value}
      </motion.span>
      <button onClick={() => onChange(value + 1)} disabled={value >= max} className="p-2 disabled:opacity-30" aria-label="Increase quantity">
        <AnimatedIcon icon={Plus} size={14} />
      </button>
    </div>
  );
}

export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const openDrawer = useCart((s) => s.openDrawer);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const totals = useTotals();
  const hydrated = useHydrated();
  const pathname = usePathname();

  useEffect(() => openDrawer(false), [pathname, openDrawer]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const progress = totals.freeDeliveryGap <= 0 ? 100 : Math.max(6, 100 - (totals.freeDeliveryGap / (totals.taxable + totals.freeDeliveryGap)) * 100);

  return (
    <AnimatePresence>
      {open && hydrated && (
        <motion.div className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => openDrawer(false)}>
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-2xl font-semibold">Your bag</h2>
              <button onClick={() => openDrawer(false)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close cart">
                <AnimatedIcon icon={X} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} className="rounded-full bg-brand/10 p-6 text-brand">
                  <ShoppingBag size={36} strokeWidth={1.4} />
                </motion.div>
                <p className="font-serif text-2xl">Your bag is empty</p>
                <p className="text-sm text-ink-mute">Discover handcrafted pieces made to be loved for years.</p>
                <Link href="/shop" className="btn-primary mt-2">
                  Start shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-5 py-3">
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <AnimatedIcon icon={Truck} size={15} className="text-brand" />
                    {totals.freeDeliveryGap > 0 ? (
                      <span>
                        Add <b>{formatINR(totals.freeDeliveryGap)}</b> more for free delivery
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-700">You have unlocked free delivery</span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                    <motion.div className="h-full rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li key={item.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0 }} className="flex gap-4 py-4">
                        <Link href={`/product/${item.slug}`} className="h-28 w-[84px] shrink-0 overflow-hidden rounded-xl bg-ivory-deep">
                          <SmartImage src={item.image} alt={item.name} fallbackKey={item.category} className="h-full w-full object-cover" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-medium leading-snug">
                              {item.name}
                            </Link>
                            <button onClick={() => remove(item.key)} className="h-fit rounded-full p-1 text-ink-mute hover:text-brand" aria-label="Remove item">
                              <AnimatedIcon icon={Trash2} size={16} />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-ink-mute">
                            {item.size} · {item.color}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QtyStepper value={item.qty} max={item.stock} onChange={(n) => setQty(item.key, n)} />
                            <span className="font-semibold">{formatINR(item.price * item.qty)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="space-y-3 border-t border-line bg-white px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink-soft">Subtotal</span>
                    <span className="font-serif text-2xl font-semibold">{formatINR(totals.subtotal)}</span>
                  </div>
                  <p className="text-xs text-ink-mute">GST, coupons and delivery are calculated in the bag.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/cart" className="btn-outline">
                      View bag
                    </Link>
                    <Link href="/checkout" className="btn-primary">
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
