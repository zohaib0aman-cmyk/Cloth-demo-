import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { safeJSON } from "@/lib/format";
import { salePriceOf } from "@/lib/pricing";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <>
      <AdminHeader title="Products" subtitle={`${products.length} products · edit stock inline, changes go live instantly`} />
      <ProductsTable
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        rows={products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          image: safeJSON<string[]>(p.images, [])[0] ?? "",
          category: p.category.name,
          categorySlug: p.category.slug,
          price: p.price,
          salePrice: salePriceOf(p.price, p.discount),
          discount: p.discount,
          stock: p.stock,
          active: p.active,
        }))}
      />
    </>
  );
}
