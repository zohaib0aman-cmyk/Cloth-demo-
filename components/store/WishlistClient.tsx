"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { ProductDTO } from "@/lib/types";
import { useHydrated, useWishlist } from "@/lib/store/cart";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

export function WishlistClient({ products }: { products: ProductDTO[] }) {
  const ids = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as ProductDTO[];
  return (
    <div className="container py-10 sm:py-14">
      <p className="eyebrow">Saved for later</p>
      <h1 className="section-title mt-2">Your wishlist</h1>
      {!hydrated ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)}</div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center py-16 text-center">
          <motion.span initial={{ scale: 0.5 }} animate={{ scale: [0.5, 1.15, 1] }} className="rounded-full bg-brand/10 p-6 text-brand">
            <Heart size={36} strokeWidth={1.4} />
          </motion.span>
          <p className="mt-5 font-serif text-2xl">Nothing saved yet</p>
          <p className="mt-2 max-w-sm text-sm text-ink-mute">Tap the heart on any piece you love and it will wait for you here.</p>
          <Link href="/shop" className="btn-primary mt-6">Explore the shop</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
