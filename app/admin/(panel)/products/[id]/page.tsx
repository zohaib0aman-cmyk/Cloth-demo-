import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { safeJSON } from "@/lib/format";
import type { ProductColor } from "@/lib/types";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [p, categories, collections] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { collections: { select: { id: true } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!p) notFound();
  return (
    <>
      <AdminHeader
        title={p.name}
        subtitle={sp.created ? "Product created and live in the shop." : "Edit details, photos, pricing and stock."}
        action={<Link href={`/product/${p.slug}`} target="_blank" className="btn-outline px-5 py-2.5">View in store</Link>}
      />
      <ProductForm
        key={p.id + p.slug}
        categories={categories}
        collections={collections}
        initial={{
          id: p.id,
          name: p.name,
          description: p.description,
          fabric: p.fabric,
          care: p.care,
          price: p.price,
          discount: p.discount,
          stock: p.stock,
          categoryId: p.categoryId,
          collectionIds: p.collections.map((c) => c.id),
          images: safeJSON<string[]>(p.images, []),
          sizes: safeJSON<string[]>(p.sizes, []),
          colors: safeJSON<ProductColor[]>(p.colors, []),
          isNew: p.isNew,
          isBestseller: p.isBestseller,
          isFeatured: p.isFeatured,
          active: p.active,
        }}
      />
    </>
  );
}
