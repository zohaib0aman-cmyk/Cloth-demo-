"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Search, BadgeCheck } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn, formatDate, formatINR } from "@/lib/format";

type Customer = { email: string; name: string; phone: string; city: string; registered: boolean; spent: number; orders: { id: string; orderNumber: string; total: number; status: string; createdAt: string }[] };

export function CustomersList({ customers }: { customers: Customer[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const list = customers.filter((c) => `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" className="input py-2.5 pl-10" aria-label="Search customers" />
      </div>
      <div className="card divide-y divide-line overflow-hidden">
        {list.map((c) => (
          <div key={c.email}>
            <button onClick={() => setOpen(open === c.email ? null : c.email)} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-ivory/50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand">{c.name[0]}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                  {c.name} {c.registered && <BadgeCheck size={14} className="text-emerald-600" aria-label="Registered" />}
                </p>
                <p className="truncate text-xs text-ink-mute">{c.email} · {c.phone}{c.city && ` · ${c.city}`}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{formatINR(c.spent)}</p>
                <p className="text-xs text-ink-mute">{c.orders.length} orders</p>
              </div>
              <motion.span animate={{ rotate: open === c.email ? 180 : 0 }} className="text-ink-mute"><ChevronDown size={18} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === c.email && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-ivory/50">
                  <div className="px-4 pb-4 pt-1 sm:pl-[72px]">
                    {c.orders.length === 0 ? (
                      <p className="text-sm text-ink-mute">No orders yet.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {c.orders.map((o) => (
                          <li key={o.id}>
                            <Link href={`/admin/orders/${o.id}`} className={cn("flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm transition hover:shadow-soft")}>
                              <span className="font-mono font-semibold">{o.orderNumber}</span>
                              <span className="text-xs text-ink-mute">{formatDate(o.createdAt)}</span>
                              <span className="ml-auto"><StatusBadge status={o.status} /></span>
                              <span className="w-20 text-right font-semibold">{formatINR(o.total)}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {list.length === 0 && <p className="p-10 text-center text-sm text-ink-mute">No customers found.</p>}
      </div>
    </>
  );
}
