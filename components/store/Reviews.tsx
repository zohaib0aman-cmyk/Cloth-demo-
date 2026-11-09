"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Star, BadgeCheck } from "lucide-react";
import { Stars } from "./Stars";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { cn, formatDate } from "@/lib/format";

type R = { id: string; name: string; city: string; rating: number; title: string; body: string; createdAt: string };

export function Reviews({ productId, reviews, rating }: { productId: string; reviews: R[]; rating: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", rating: 5, title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, ...form }) });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      setForm({ name: "", city: "", rating: 5, title: "", body: "" });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error ?? "Could not post your review");
    }
  }

  return (
    <section id="reviews" className="scroll-mt-24 py-16">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="section-title mt-2">What customers say</h2>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-serif text-6xl font-semibold">{rating ? rating.toFixed(1) : "—"}</span>
            <div>
              <Stars value={rating} size={18} />
              <p className="mt-1 text-sm text-ink-mute">{reviews.length} verified reviews</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {dist.map((d) => (
              <div key={d.s} className="flex items-center gap-3 text-sm">
                <span className="w-3">{d.s}</span>
                <Star size={12} className="text-accent" fill="currentColor" strokeWidth={0} />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${reviews.length ? (d.n / reviews.length) * 100 : 0}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                </div>
                <span className="w-6 text-right text-ink-mute">{d.n}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setOpen(!open)} className="btn-outline mt-6 w-full">
            <AnimatedIcon icon={PenLine} size={16} /> Write a review
          </button>
        </div>

        <div>
          <AnimatePresence>
            {open && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submit} className="mb-8 overflow-hidden">
                <div className="card grid gap-4 p-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="label">Your rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.button type="button" key={s} whileTap={{ scale: 0.8 }} whileHover={{ scale: 1.15 }} onClick={() => setForm({ ...form, rating: s })} aria-label={`${s} stars`}>
                          <Star size={28} className={cn(s <= form.rating ? "text-accent" : "text-line")} fill="currentColor" strokeWidth={0} />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="rv-name">Name</label>
                    <input id="rv-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="rv-city">City</label>
                    <input id="rv-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="rv-title">Headline</label>
                    <input id="rv-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="rv-body">Review</label>
                    <textarea id="rv-body" required rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="input" />
                  </div>
                  {msg && <p className="text-sm text-brand sm:col-span-2">{msg}</p>}
                  <button disabled={busy} className="btn-primary sm:col-span-2">
                    {busy ? "Posting…" : "Post review"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          <ul className="divide-y divide-line">
            {reviews.length === 0 && <li className="py-6 text-sm text-ink-mute">Be the first to review this piece.</li>}
            {reviews.map((r, i) => (
              <motion.li key={r.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 4) * 0.05 }} className="py-6">
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="text-xs text-ink-mute">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-2 font-semibold">{r.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-mute">
                  <AnimatedIcon icon={BadgeCheck} size={14} className="text-emerald-600" />
                  {r.name}
                  {r.city && ` · ${r.city}`} · Verified buyer
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
