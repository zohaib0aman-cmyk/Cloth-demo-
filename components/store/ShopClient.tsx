"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, Search, SlidersHorizontal, X, Check } from "lucide-react";
import type { ProductDTO } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { cn, formatINR } from "@/lib/format";

type Opt = { name: string; slug: string };
export type ShopParams = { q?: string; category?: string; collection?: string; sort?: string; size?: string; color?: string; min?: string; max?: string };

const SORTS = [
  ["featured", "Featured"],
  ["new", "Newest first"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
  ["rating", "Top rated"],
  ["discount", "Biggest discount"],
] as const;

const split = (v?: string) => (v ? v.split(",").filter(Boolean) : []);

export function ShopClient({ products, categories, collections, initial, title }: { products: ProductDTO[]; categories: Opt[]; collections: Opt[]; initial: ShopParams; title: string }) {
  const priceCeil = Math.max(1000, Math.ceil(Math.max(...products.map((p) => p.salePrice), 0) / 1000) * 1000);
  const [q, setQ] = useState(initial.q ?? "");
  const [cats, setCats] = useState<string[]>(split(initial.category));
  const [collection, setCollection] = useState(initial.collection ?? "");
  const [sizes, setSizes] = useState<string[]>(split(initial.size));
  const [colors, setColors] = useState<string[]>(split(initial.color));
  const [max, setMax] = useState<number>(initial.max ? Number(initial.max) : priceCeil);
  const [min, setMin] = useState<number>(initial.min ? Number(initial.min) : 0);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState(initial.sort ?? "featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sheet, setSheet] = useState(false);

  const allSizes = useMemo(() => {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "Free Size"];
    const set = new Set(products.flatMap((p) => p.sizes));
    return order.filter((s) => set.has(s)).concat([...set].filter((s) => !order.includes(s)));
  }, [products]);
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return [...map.entries()];
  }, [products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (term && !`${p.name} ${p.category.name} ${p.fabric} ${p.description}`.toLowerCase().includes(term)) return false;
      if (cats.length && !cats.includes(p.category.slug)) return false;
      if (collection && !p.collections.includes(collection)) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c.name))) return false;
      if (p.salePrice < min || p.salePrice > max) return false;
      if (inStock && p.stock <= 0) return false;
      return true;
    });
    const by = {
      featured: (a: ProductDTO, b: ProductDTO) => Number(b.isFeatured) - Number(a.isFeatured) || Number(b.isBestseller) - Number(a.isBestseller),
      new: (a: ProductDTO, b: ProductDTO) => b.createdAt.localeCompare(a.createdAt),
      "price-asc": (a: ProductDTO, b: ProductDTO) => a.salePrice - b.salePrice,
      "price-desc": (a: ProductDTO, b: ProductDTO) => b.salePrice - a.salePrice,
      rating: (a: ProductDTO, b: ProductDTO) => b.rating - a.rating,
      discount: (a: ProductDTO, b: ProductDTO) => b.discount - a.discount,
    }[sort as "featured"];
    if (by) list = [...list].sort(by);
    return list;
  }, [products, q, cats, collection, sizes, colors, min, max, inStock, sort]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cats.length) p.set("category", cats.join(","));
    if (collection) p.set("collection", collection);
    if (sizes.length) p.set("size", sizes.join(","));
    if (colors.length) p.set("color", colors.join(","));
    if (min > 0) p.set("min", String(min));
    if (max < priceCeil) p.set("max", String(max));
    if (sort !== "featured") p.set("sort", sort);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
  }, [q, cats, collection, sizes, colors, min, max, sort, priceCeil]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const clearAll = () => {
    setQ("");
    setCats([]);
    setCollection("");
    setSizes([]);
    setColors([]);
    setMin(0);
    setMax(priceCeil);
    setInStock(false);
  };

  const active = [
    ...cats.map((c) => ({ label: categories.find((x) => x.slug === c)?.name ?? c, clear: () => toggle(cats, setCats, c) })),
    ...(collection ? [{ label: collections.find((x) => x.slug === collection)?.name ?? collection, clear: () => setCollection("") }] : []),
    ...sizes.map((s) => ({ label: `Size ${s}`, clear: () => toggle(sizes, setSizes, s) })),
    ...colors.map((c) => ({ label: c, clear: () => toggle(colors, setColors, c) })),
    ...(min > 0 || max < priceCeil ? [{ label: `${formatINR(min)} – ${formatINR(max)}`, clear: () => (setMin(0), setMax(priceCeil)) }] : []),
    ...(inStock ? [{ label: "In stock", clear: () => setInStock(false) }] : []),
    ...(q ? [{ label: `“${q}”`, clear: () => setQ("") }] : []),
  ];

  const filters = (
    <div className="space-y-8">
      <div>
        <p className="label">Category</p>
        <div className="space-y-1">
          {categories.map((c) => (
            <button key={c.slug} onClick={() => toggle(cats, setCats, c.slug)} className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm text-ink-soft hover:text-ink">
              <span className={cn("flex h-4 w-4 items-center justify-center rounded border transition", cats.includes(c.slug) ? "border-ink bg-ink text-white" : "border-ink/25")}>
                {cats.includes(c.slug) && <Check size={11} strokeWidth={3} />}
              </span>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Collection</p>
        <div className="flex flex-wrap gap-2">
          {collections.map((c) => (
            <button key={c.slug} onClick={() => setCollection(collection === c.slug ? "" : c.slug)} className={cn("chip text-xs", collection === c.slug && "chip-active")}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Size</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button key={s} onClick={() => toggle(sizes, setSizes, s)} className={cn("chip min-w-11 justify-center text-xs", sizes.includes(s) && "chip-active")}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Colour</p>
        <div className="flex flex-wrap gap-2.5">
          {allColors.map(([name, hex]) => (
            <button key={name} onClick={() => toggle(colors, setColors, name)} title={name} aria-label={name} className={cn("rounded-full p-0.5 ring-2 transition", colors.includes(name) ? "ring-ink" : "ring-transparent hover:ring-line")}>
              <span className="block h-7 w-7 rounded-full ring-1 ring-black/10" style={{ background: hex }} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Price</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span>{formatINR(min)}</span>
          <span>{formatINR(max)}</span>
        </div>
        <input type="range" min={0} max={priceCeil} step={500} value={max} onChange={(e) => setMax(Math.max(min + 500, Number(e.target.value)))} className="mt-3 w-full accent-[rgb(var(--brand))]" aria-label="Maximum price" />
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            [0, 1500],
            [1500, 3000],
            [3000, 6000],
            [6000, priceCeil],
          ].map(([a, b]) => (
            <button key={a} onClick={() => (setMin(a), setMax(b))} className={cn("chip text-xs", min === a && max === b && "chip-active")}>
              {b === priceCeil ? `${formatINR(a)}+` : `${formatINR(a)}–${formatINR(b)}`}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center justify-between text-sm">
        <span className="font-medium">In stock only</span>
        <button onClick={() => setInStock(!inStock)} className={cn("relative h-6 w-11 rounded-full transition", inStock ? "bg-brand" : "bg-line")} aria-pressed={inStock} aria-label="In stock only">
          <motion.span layout className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow", inStock ? "right-1" : "left-1")} />
        </button>
      </label>
    </div>
  );

  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-2">
        <p className="eyebrow">The shop</p>
        <h1 className="section-title">{title}</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the collection" className="input rounded-full pl-11" aria-label="Search products" />
        </div>
        <button onClick={() => setSheet(true)} className="btn-outline px-4 py-2.5 lg:hidden">
          <AnimatedIcon icon={SlidersHorizontal} size={16} /> Filters {active.length > 0 && <span className="rounded-full bg-brand px-1.5 text-[10px] text-white">{active.length}</span>}
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto rounded-full py-2.5 pr-10 text-sm" aria-label="Sort products">
          {SORTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <div className="ml-auto flex rounded-full border border-line bg-white p-1">
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("relative rounded-full p-2 transition", view === v ? "text-white" : "text-ink-mute")} aria-label={`${v} view`}>
              {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-ink" />}
              <span className="relative">
                <AnimatedIcon icon={v === "grid" ? LayoutGrid : List} size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filters}</div>
        </aside>
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm text-ink-mute">
              {filtered.length} product{filtered.length === 1 ? "" : "s"}
            </span>
            <AnimatePresence>
              {active.map((a) => (
                <motion.button key={a.label} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={a.clear} className="chip py-1 text-xs">
                  {a.label} <X size={12} />
                </motion.button>
              ))}
            </AnimatePresence>
            {active.length > 1 && (
              <button onClick={clearAll} className="text-xs font-semibold text-brand underline-offset-4 hover:underline">
                Clear all
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center gap-3 px-6 py-20 text-center">
              <p className="font-serif text-2xl">Nothing matches just yet</p>
              <p className="max-w-sm text-sm text-ink-mute">Try removing a filter or searching for something broader.</p>
              <button onClick={clearAll} className="btn-dark mt-2">
                Reset filters
              </button>
            </motion.div>
          ) : (
            <motion.div layout className={cn(view === "grid" ? "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3" : "space-y-6")}>
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }} exit={{ opacity: 0, scale: 0.95 }}>
                    <ProductCard product={p} layout={view} priority={i < 4} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-[70] bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <motion.div
              className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-ivory"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <p className="font-serif text-2xl">Filters</p>
                <button onClick={() => setSheet(false)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close filters">
                  <AnimatedIcon icon={X} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">{filters}</div>
              <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
                <button onClick={clearAll} className="btn-outline">
                  Clear
                </button>
                <button onClick={() => setSheet(false)} className="btn-primary">
                  Show {filtered.length}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
