import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductDetail } from "@/components/store/ProductDetail";
import { Reviews } from "@/components/store/Reviews";
import { ProductRail } from "@/components/home/HomeSections";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getBrand } from "@/lib/brand-server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [p, brand] = await Promise.all([getProductBySlug((await params).slug), getBrand()]);
  if (!p) return { title: "Product not found" };
  return { title: p.name, description: p.description.slice(0, 155), openGraph: { title: `${p.name} | ${brand.brandName}`, images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [reviews, sameCat] = await Promise.all([
    prisma.review.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" } }),
    getProducts({ category: { slug: product.category.slug }, NOT: { id: product.id } }, 8),
  ]);
  const related = sameCat.length >= 4 ? sameCat : [...sameCat, ...(await getProducts({ NOT: { id: product.id }, isBestseller: true }, 8 - sameCat.length))];

  return (
    <>
      <div className="container py-6 sm:py-10">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink-mute" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight size={12} />
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          <ChevronRight size={12} />
          <span className="truncate text-ink">{product.name}</span>
        </nav>
        <ProductDetail product={product} />
        <Reviews productId={product.id} rating={product.rating} reviews={reviews.map((r) => ({ id: r.id, name: r.name, city: r.city, rating: r.rating, title: r.title, body: r.body, createdAt: r.createdAt.toISOString() }))} />
      </div>
      <div className="bg-white">
        <ProductRail eyebrow="You may also like" title="Complete the look" href={`/shop?category=${product.category.slug}`} products={related} />
      </div>
    </>
  );
}
