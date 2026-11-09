"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteProduct, setStock } from "@/app/admin/actions";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { SmartImage } from "../SmartImage";
import { cn, formatINR } from "@/lib/format";

type Row = { id: string; slug: string; name: string; image: string; category: string; categorySlug: string; price: number; salePrice: number; discount: number; stock: number; active: boolean };

export function ProductsTable({ rows, categories }: { rows: Row[]; categories: { name: string; slug: string }[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [confirm, setConfirm] = useState<Row | null>(null);
  const [pending, start] = useTransition();
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});

  const list = useMemo(() => rows.filter((r) => (!cat || r.categorySlug === cat) && r.name.toLowerCase().includes(q.toLowerCase())), [rows, q, cat]);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="input py-2.5 pl-10" aria-label="Search products" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input w-auto py-2.5" aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <Link href="/admin/products/new" className="btn-primary ml-auto px-5 py-2.5">
          <AnimatedIcon icon={Plus} size={16} /> Add product
        </Link>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ivory-deep/60 text-left text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {list.map((r) => {
                  const edit = stockEdits[r.id];
                  return (
                    <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-line hover:bg-ivory/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                            <SmartImage src={r.image} alt={r.name} fallbackKey={r.categorySlug} className="h-full w-full object-cover" />
                          </div>
                          <Link href={`/admin/products/${r.id}`} className="font-medium hover:text-brand">{r.name}</Link>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{r.category}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">{formatINR(r.salePrice)}</p>
                        {r.discount > 0 && <p className="text-xs text-ink-mute"><s>{formatINR(r.price)}</s> · −{r.discount}%</p>}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          value={edit ?? String(r.stock)}
                          onChange={(e) => setStockEdits({ ...stockEdits, [r.id]: e.target.value })}
                          onBlur={() => {
                            if (edit !== undefined && Number(edit) !== r.stock) start(async () => { await setStock(r.id, Number(edit)); router.refresh(); });
                          }}
                          className={cn("w-20 rounded-lg border px-2 py-1.5 text-sm", r.stock <= 5 ? "border-amber-300 bg-amber-50" : "border-line")}
                          aria-label={`Stock for ${r.name}`}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", !r.active ? "bg-ivory-deep text-ink-mute" : r.stock === 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700")}>
                          {!r.active ? "Hidden" : r.stock === 0 ? "Out of stock" : "Live"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/product/${r.slug}`} target="_blank" className="rounded-lg p-2 text-ink-mute hover:bg-ink/5 hover:text-ink" aria-label="View in store"><AnimatedIcon icon={Eye} size={16} /></Link>
                          <Link href={`/admin/products/${r.id}`} className="rounded-lg p-2 text-ink-mute hover:bg-ink/5 hover:text-ink" aria-label="Edit"><AnimatedIcon icon={Pencil} size={16} /></Link>
                          <button onClick={() => setConfirm(r)} className="rounded-lg p-2 text-ink-mute hover:bg-red-50 hover:text-red-700" aria-label="Delete"><AnimatedIcon icon={Trash2} size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {list.length === 0 && <p className="p-10 text-center text-sm text-ink-mute">No products match your search.</p>}
        </div>
      </div>

      <AnimatePresence>
        {confirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} className="w-full max-w-sm rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-semibold">Delete product?</h3>
              <p className="mt-2 text-sm text-ink-mute">“{confirm.name}” will be removed from the store. Past orders keep their details.</p>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setConfirm(null)} className="btn-outline flex-1">Cancel</button>
                <button
                  disabled={pending}
                  onClick={() => start(async () => { await deleteProduct(confirm.id); setConfirm(null); router.refresh(); })}
                  className="btn flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  {pending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
