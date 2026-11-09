"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, FileDown } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { ORDER_STEPS, PAYMENT_LABEL, STATUS_LABEL } from "@/lib/types";
import { cn, formatDate, formatINR } from "@/lib/format";

type Row = { id: string; orderNumber: string; customerName: string; email: string; city: string; total: number; status: string; paymentMethod: string; createdAt: string; items: number };

export function OrdersTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const counts = useMemo(() => Object.fromEntries([...ORDER_STEPS, "CANCELLED"].map((s) => [s, rows.filter((r) => r.status === s).length])), [rows]);
  const list = rows.filter((r) => (!status || r.status === status) && `${r.orderNumber} ${r.customerName} ${r.email} ${r.city}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {["", ...ORDER_STEPS, "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={cn("chip shrink-0 py-1.5 text-xs", status === s && "chip-active")}>
            {s ? STATUS_LABEL[s] : "All"} <span className="opacity-60">{s ? counts[s] : rows.length}</span>
          </button>
        ))}
      </div>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, customer, city" className="input py-2.5 pl-10" aria-label="Search orders" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-ivory-deep/60 text-left text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Bill</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.025 }} className="border-t border-line hover:bg-ivory/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${r.id}`} className="font-mono font-semibold hover:text-brand">{r.orderNumber}</Link>
                    <p className="text-xs text-ink-mute">{r.items} items</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{r.customerName}</p>
                    <p className="text-xs text-ink-mute">{r.city}</p>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{formatDate(r.createdAt, true)}</td>
                  <td className="px-3 py-3 text-ink-soft">{PAYMENT_LABEL[r.paymentMethod]}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 text-right font-semibold">{formatINR(r.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/api/invoice/${r.orderNumber}`} className="inline-flex rounded-lg p-2 text-ink-mute hover:bg-ink/5 hover:text-ink" aria-label="Download bill" download>
                      <AnimatedIcon icon={FileDown} size={16} />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-10 text-center text-sm text-ink-mute">No orders found.</p>}
        </div>
      </div>
    </>
  );
}
