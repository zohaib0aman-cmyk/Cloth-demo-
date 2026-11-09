"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { Heart, Plus, Check } from "lucide-react";
import type { ProductDTO } from "@/lib/types";
import { SmartImage } from "../SmartImage";
import { Stars } from "./Stars";
import { formatINR, cn } from "@/lib/format";
import { useCart, useHydrated, useWishlist } from "@/lib/store/cart";
import { useFlyToCart } from "./FlyToCart";

export function ProductCard({ product, priority, layout = "grid" }: { product: ProductDTO; priority?: boolean; layout?: "grid" | "list" }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [picker, setPicker] = useState(false);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const fly = useFlyToCart();
  const hydrated = useHydrated();
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const out = product.stock <= 0;
  const tone = product.colors[0]?.hex;

  function quickAdd(size: string) {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      category: product.category.slug,
      size,
      color: product.colors[0]?.name ?? "Default",
      price: product.salePrice,
      mrp: product.price,
      stock: product.stock,
    });
    fly(product.images[0] ?? "", imgRef.current);
    setAdded(true);
    setPicker(false);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <motion.article
      className={cn("group relative", layout === "list" && "grid grid-cols-[120px_1fr] gap-4 sm:grid-cols-[200px_1fr] sm:gap-6")}
      onMouseLeave={() => setPicker(false)}
    >
      <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-deep">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          <SmartImage src={product.images[0]} alt={product.name} fallbackKey={product.category.slug} tone={tone} eager={priority} className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.06]" />
          {product.images[1] && (
            <SmartImage src={product.images[1]} alt="" fallbackKey={product.category.slug} tone={tone} className="absolute inset-0 h-full w-full object-cover !opacity-0 transition duration-700 group-hover:scale-[1.06] group-hover:!opacity-100" />
          )}
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.discount > 0 && <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">−{product.discount}%</span>}
          {product.isNew && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink backdrop-blur">New</span>}
          {out ? (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Sold out</span>
          ) : product.stock <= 5 ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">Only {product.stock} left</span>
          ) : null}
        </div>

        <motion.button
          onClick={() => toggleWish(product.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2.5 top-2.5 rounded-full bg-white/90 p-2 text-ink shadow-sm backdrop-blur"
          whileTap={{ scale: 0.75 }}
        >
          <motion.span key={String(wished)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className={cn("inline-flex", hydrated && wished && "text-brand")}>
            <Heart size={17} strokeWidth={1.8} fill={hydrated && wished ? "currentColor" : "none"} />
          </motion.span>
        </motion.button>

        {!out && (
          <>
            <button
              onClick={() => (product.sizes.length === 1 ? quickAdd(product.sizes[0]) : setPicker((v) => !v))}
              aria-label="Quick add to bag"
              className={cn(
                "absolute bottom-2.5 right-2.5 rounded-full bg-white p-2.5 text-ink shadow-soft transition duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100",
                added && "bg-emerald-600 text-white sm:translate-y-0 sm:opacity-100",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={added ? "ok" : "add"} initial={{ rotate: -90, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0.5 }} className="inline-flex">
                  {added ? <Check size={17} /> : <Plus size={17} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <AnimatePresence>
              {picker && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="absolute inset-x-0 bottom-0 bg-white/95 p-3 backdrop-blur"
                >
                  <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">Select size</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {product.sizes.map((s) => (
                      <button key={s} onClick={() => quickAdd(s)} className="min-w-9 rounded-full border border-line px-2.5 py-1 text-xs font-semibold transition hover:border-ink hover:bg-ink hover:text-white">
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className={cn(layout === "grid" ? "mt-3" : "flex flex-col justify-center")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">{product.category.name}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-1 font-medium text-ink transition hover:text-brand sm:text-[15px]">
          {product.name}
        </Link>
        {layout === "list" && <p className="mt-2 line-clamp-2 text-sm text-ink-mute">{product.description}</p>}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold">{formatINR(product.salePrice)}</span>
          {product.discount > 0 && <span className="text-sm text-ink-mute line-through">{formatINR(product.price)}</span>}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {product.reviewCount > 0 && (
            <>
              <Stars value={product.rating} size={12} />
              <span className="text-[11px] text-ink-mute">({product.reviewCount})</span>
            </>
          )}
          <span className="ml-auto flex gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c.name} title={c.name} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
            ))}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="skeleton mt-3 h-3 w-1/3" />
      <div className="skeleton mt-2 h-4 w-3/4" />
      <div className="skeleton mt-2 h-4 w-1/4" />
    </div>
  );
}
