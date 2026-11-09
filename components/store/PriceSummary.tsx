"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { Totals } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { useStore } from "./StoreContext";

function Row({ label, value, tone }: { label: string; value: string; tone?: "green" | "muted" }) {
  return (
    <motion.div layout className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <motion.span key={value} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={tone === "green" ? "font-medium text-emerald-700" : "font-medium"}>
        {value}
      </motion.span>
    </motion.div>
  );
}

export function PriceSummary({ totals, couponCode }: { totals: Totals; couponCode?: string | null }) {
  const { settings } = useStore();
  return (
    <div>
      <Row label={`Subtotal (${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"})`} value={formatINR(totals.subtotal)} />
      <AnimatePresence>{totals.discount > 0 && <Row label={`Coupon ${couponCode ?? ""}`} value={`− ${formatINR(totals.discount)}`} tone="green" />}</AnimatePresence>
      <Row label={`GST (${settings.gstPercent}%)`} value={formatINR(totals.gst)} />
      <Row label="Delivery" value={totals.delivery === 0 ? "Free" : formatINR(totals.delivery)} tone={totals.delivery === 0 ? "green" : undefined} />
      <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-line pt-4">
        <span className="font-semibold">Total</span>
        <motion.span key={totals.total} initial={{ scale: 0.92, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="font-serif text-2xl font-semibold">
          {formatINR(totals.total)}
        </motion.span>
      </div>
      <p className="mt-1 text-right text-[11px] text-ink-mute">Inclusive of all taxes</p>
    </div>
  );
}
