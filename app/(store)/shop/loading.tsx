import { ProductCardSkeleton } from "@/components/store/ProductCard";

export default function Loading() {
  return (
    <div className="container py-12">
      <div className="skeleton mb-3 h-3 w-24" />
      <div className="skeleton mb-10 h-10 w-64" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
