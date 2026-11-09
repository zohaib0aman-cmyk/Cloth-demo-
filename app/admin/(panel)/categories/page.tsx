import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { CatalogManager } from "@/components/admin/CatalogManager";

export const metadata: Metadata = { title: "Categories & collections" };

export default async function CategoriesPage() {
  const [cats, cols] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);
  return (
    <>
      <AdminHeader title="Categories & collections" subtitle="Create, edit and reorder. The order here is the order shoppers see." />
      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogManager key={`c${cats.map((c) => c.id + c.name + c.image).join()}`} kind="category" items={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, text: c.description, image: c.image, count: c._count.products }))} />
        <CatalogManager key={`k${cols.map((c) => c.id + c.name + c.image + c.featured).join()}`} kind="collection" items={cols.map((c) => ({ id: c.id, name: c.name, slug: c.slug, text: c.tagline, image: c.image, count: c._count.products, featured: c.featured }))} />
      </div>
    </>
  );
}
