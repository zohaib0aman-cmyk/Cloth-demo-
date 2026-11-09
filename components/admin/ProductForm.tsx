"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, Plus, Save, X } from "lucide-react";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import { ImageListUploader } from "./ImageUploader";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { cn, formatINR } from "@/lib/format";
import { salePriceOf } from "@/lib/pricing";

const SIZE_SETS = { Apparel: ["XS", "S", "M", "L", "XL", "XXL"], Denim: ["28", "30", "32", "34", "36"], "Free size": ["Free Size"] };

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 py-2 text-sm">
      <span className="font-medium">{label}</span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-brand" : "bg-line")}>
        <motion.span layout className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow", on ? "right-1" : "left-1")} />
      </span>
    </button>
  );
}

export function ProductForm({ initial, categories, collections }: { initial: ProductInput; categories: { id: string; name: string }[]; collections: { id: string; name: string }[] }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const [customSize, setCustomSize] = useState("");
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setP((x) => ({ ...x, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveProduct(p);
      if (res.error) return setError(res.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (!p.id && res.id) router.replace(`/admin/products/${res.id}?created=1`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="pn">Product name</label>
            <input id="pn" value={p.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="e.g. Handloom Cotton Kurti" required />
          </div>
          <div>
            <label className="label" htmlFor="pd">Description</label>
            <textarea id="pd" rows={5} value={p.description} onChange={(e) => set("description", e.target.value)} className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="pf">Fabric</label>
              <input id="pf" value={p.fabric} onChange={(e) => set("fabric", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="pc">Care</label>
              <input id="pc" value={p.care} onChange={(e) => set("care", e.target.value)} className="input" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <p className="label">Photos</p>
          <ImageListUploader value={p.images} onChange={(v) => set("images", v)} />
        </section>

        <section className="card grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="pp">MRP (₹)</label>
            <input id="pp" type="number" min={1} value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="pdisc">Discount (%)</label>
            <input id="pdisc" type="number" min={0} max={90} value={p.discount} onChange={(e) => set("discount", Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="ps">Stock</label>
            <input id="ps" type="number" min={0} value={p.stock} onChange={(e) => set("stock", Number(e.target.value))} className="input" />
          </div>
          <p className="text-sm text-ink-soft sm:col-span-3">
            Selling price: <b className="text-ink">{formatINR(salePriceOf(p.price || 0, p.discount || 0))}</b>
          </p>
        </section>

        <section className="card space-y-5 p-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="label">Sizes</p>
              <div className="flex gap-1.5">
                {Object.entries(SIZE_SETS).map(([k, v]) => (
                  <button type="button" key={k} onClick={() => set("sizes", v)} className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold hover:border-ink/30">
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...new Set([...SIZE_SETS.Apparel, ...SIZE_SETS.Denim, "Free Size", ...p.sizes])].map((s) => (
                <button type="button" key={s} onClick={() => set("sizes", p.sizes.includes(s) ? p.sizes.filter((x) => x !== s) : [...p.sizes, s])} className={cn("chip min-w-11 justify-center py-1 text-xs", p.sizes.includes(s) && "chip-active")}>
                  {s}
                </button>
              ))}
              <span className="flex gap-1">
                <input value={customSize} onChange={(e) => setCustomSize(e.target.value)} placeholder="Custom" className="w-20 rounded-full border border-line px-3 py-1 text-xs" aria-label="Custom size" />
                <button type="button" onClick={() => { if (customSize.trim()) { set("sizes", [...p.sizes, customSize.trim()]); setCustomSize(""); } }} className="rounded-full border border-line p-1.5" aria-label="Add size"><Plus size={12} /></button>
              </span>
            </div>
          </div>
          <div>
            <p className="label">Colours</p>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {p.colors.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                    <input type="color" value={c.hex} onChange={(e) => set("colors", p.colors.map((x, k) => (k === i ? { ...x, hex: e.target.value } : x)))} className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-white p-1" aria-label="Colour swatch" />
                    <input value={c.name} onChange={(e) => set("colors", p.colors.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} placeholder="Colour name" className="input py-2" aria-label="Colour name" />
                    <button type="button" onClick={() => set("colors", p.colors.filter((_, k) => k !== i))} className="rounded-full p-2 text-ink-mute hover:bg-red-50 hover:text-red-700" aria-label="Remove colour"><X size={15} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button type="button" onClick={() => set("colors", [...p.colors, { name: "", hex: "#7a2232" }])} className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Plus size={14} /> Add colour
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <section className="card p-5">
          <label className="label" htmlFor="pcat">Category</label>
          <select id="pcat" value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="input" required>
            <option value="">Choose category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="label mt-5">Collections</p>
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <button type="button" key={c.id} onClick={() => set("collectionIds", p.collectionIds.includes(c.id) ? p.collectionIds.filter((x) => x !== c.id) : [...p.collectionIds, c.id])} className={cn("chip py-1 text-xs", p.collectionIds.includes(c.id) && "chip-active")}>
                {c.name}
              </button>
            ))}
          </div>
        </section>
        <section className="card divide-y divide-line px-5 py-2">
          <Toggle label="Visible in store" on={p.active} onChange={(v) => set("active", v)} />
          <Toggle label="New arrival" on={p.isNew} onChange={(v) => set("isNew", v)} />
          <Toggle label="Bestseller" on={p.isBestseller} onChange={(v) => set("isBestseller", v)} />
          <Toggle label="Featured" on={p.isFeatured} onChange={(v) => set("isFeatured", v)} />
        </section>
        {error && <motion.p initial={{ x: -8 }} animate={{ x: 0 }} className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</motion.p>}
        <button disabled={pending} className={cn("btn-primary w-full py-3.5", saved && "!bg-emerald-700")}>
          {saved ? <Check size={17} /> : <AnimatedIcon icon={Save} size={17} />} {pending ? "Saving…" : saved ? "Saved — live on store" : p.id ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="btn-ghost w-full">
          <ArrowLeft size={15} /> Back to products
        </Link>
      </aside>
    </form>
  );
}
