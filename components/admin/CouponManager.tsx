"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Pencil, Plus, Ticket, Trash2, X } from "lucide-react";
import { deleteCoupon, saveCoupon, toggleCoupon } from "@/app/admin/actions";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { cn, formatINR } from "@/lib/format";

type Coupon = { id?: string; code: string; type: string; value: number; minOrder: number; maxDiscount: number; description: string; active: boolean; uses?: number };
const EMPTY: Coupon = { code: "", type: "PERCENT", value: 10, minOrder: 0, maxDiscount: 0, description: "", active: true };

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Coupon | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setError("");
    start(async () => {
      const res = await saveCoupon(edit);
      if (res.error) return setError(res.error);
      setEdit(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEdit(EMPTY)} className="btn-primary px-5 py-2.5">
          <AnimatedIcon icon={Plus} size={16} /> Create coupon
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {coupons.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={cn("card relative overflow-hidden p-5", !c.active && "opacity-60")}>
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f7f4ef]" />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f7f4ef]" />
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 font-mono text-lg font-bold">
                  <AnimatedIcon icon={Ticket} size={17} className="text-brand" /> {c.code}
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold text-brand">{c.type === "PERCENT" ? `${c.value}% off` : `${formatINR(c.value)} off`}</p>
              </div>
              <button onClick={() => start(async () => { await toggleCoupon(c.id!, !c.active); router.refresh(); })} className={cn("relative h-6 w-11 rounded-full transition", c.active ? "bg-emerald-600" : "bg-line")} aria-label={c.active ? "Deactivate" : "Activate"}>
                <motion.span layout className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow", c.active ? "right-1" : "left-1")} />
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{c.description}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-dashed border-line pt-3 text-xs text-ink-mute">
              <span>Min. order {formatINR(c.minOrder)}</span>
              {c.maxDiscount > 0 && <span>Max {formatINR(c.maxDiscount)}</span>}
              <span>Used {c.uses ?? 0}×</span>
            </div>
            <div className="mt-3 flex gap-1">
              <button onClick={() => setEdit(c)} className="btn-ghost px-3 py-1.5 text-xs"><Pencil size={13} /> Edit</button>
              <button onClick={() => { if (window.confirm(`Delete ${c.code}?`)) start(async () => { await deleteCoupon(c.id!); router.refresh(); }); }} className="btn-ghost px-3 py-1.5 text-xs hover:text-red-700"><Trash2 size={13} /> Delete</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {edit && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEdit(null)}>
            <motion.form onSubmit={submit} initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{edit.id ? "Edit coupon" : "New coupon"}</h3>
                <button type="button" onClick={() => setEdit(null)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close"><X size={18} /></button>
              </div>
              <div>
                <label className="label" htmlFor="cp-code">Code</label>
                <input id="cp-code" required value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} className="input font-mono uppercase" placeholder="DIWALI25" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="cp-type">Type</label>
                  <select id="cp-type" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })} className="input">
                    <option value="PERCENT">Percentage</option>
                    <option value="FLAT">Flat amount</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="cp-val">{edit.type === "PERCENT" ? "Percent off" : "Amount off (₹)"}</label>
                  <input id="cp-val" type="number" min={1} value={edit.value} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="cp-min">Min. order (₹)</label>
                  <input id="cp-min" type="number" min={0} value={edit.minOrder} onChange={(e) => setEdit({ ...edit, minOrder: Number(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="cp-max">Max discount (₹)</label>
                  <input id="cp-max" type="number" min={0} value={edit.maxDiscount} onChange={(e) => setEdit({ ...edit, maxDiscount: Number(e.target.value) })} className="input" placeholder="0 = no cap" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="cp-desc">Description shown to shoppers</label>
                <input id="cp-desc" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="input" />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button disabled={pending} className="btn-primary w-full">{pending ? "Saving…" : "Save coupon"}</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
