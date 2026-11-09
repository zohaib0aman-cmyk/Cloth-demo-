import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New product" };

export default async function NewProduct() {
  const [categories, collections] = await Promise.all([prisma.category.findMany({ orderBy: { sortOrder: "asc" } }), prisma.collection.findMany({ orderBy: { sortOrder: "asc" } })]);
  return (
    <>
      <AdminHeader title="Add product" subtitle="It appears in the shop the moment you save." />
      <ProductForm
        categories={categories}
        collections={collections}
        initial={{ name: "", description: "", fabric: "", care: "Gentle hand wash in cold water. Dry in shade.", price: 0, discount: 0, stock: 10, categoryId: categories[0]?.id ?? "", collectionIds: [], images: [], sizes: ["S", "M", "L", "XL"], colors: [{ name: "Ivory", hex: "#efe6d6" }], isNew: true, isBestseller: false, isFeatured: false, active: true }}
      />
    </>
  );
}
