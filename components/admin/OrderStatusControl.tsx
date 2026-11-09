"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Check, Bike, ClipboardList, House, PackageCheck, Truck, XCircle } from "lucide-react";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STEPS, STATUS_LABEL } from "@/lib/types";
import { cn } from "@/lib/format";

const ICONS: Record<string, typeof Truck> = { PLACED: ClipboardList, PACKED: PackageCheck, SHIPPED: Truck, OUT_FOR_DELIVERY: Bike, DELIVERED: House, CANCELLED: XCircle };

export function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState("");
  const idx = ORDER_STEPS.indexOf(current as (typeof ORDER_STEPS)[number]);

  function change(s: string) {
    if (s === current) return;
    if (s === "CANCELLED" && !window.confirm("Cancel this order? Stock will be returned to inventory.")) return;
    const prev = current;
    setCurrent(s);
    start(async () => {
      const res = await updateOrderStatus(orderId, s, note);
      if (res?.error) {
        setCurrent(prev);
        setFlash(res.error);
        return;
      }
      setNote("");
      setFlash(`Marked as ${STATUS_LABEL[s]} — customer tracking updated`);
      setTimeout(() => setFlash(""), 3000);
      router.refresh();
    });
  }

  return (
    <div className="card p-5">
      <h2 className="text-2xl font-semibold">Update status</h2>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[...ORDER_STEPS, "CANCELLED"].map((s, i) => {
          const Icon = ICONS[s];
          const done = s !== "CANCELLED" && idx >= 0 && i <= idx;
          return (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              disabled={pending}
              onClick={() => change(s)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition",
                current === s ? (s === "CANCELLED" ? "border-red-600 bg-red-600 text-white" : "border-ink bg-ink text-white") : done ? "border-brand/30 bg-brand/5 text-brand" : "border-line hover:border-ink/30",
              )}
            >
              {done && current !== s ? <Check size={15} /> : <Icon size={15} />}
              {STATUS_LABEL[s]}
            </motion.button>
          );
        })}
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note (e.g. courier & AWB number)" className="input mt-3 py-2.5 text-sm" aria-label="Status note" />
      {flash && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-xs font-semibold text-emerald-700">{flash}</motion.p>}
    </div>
  );
}
