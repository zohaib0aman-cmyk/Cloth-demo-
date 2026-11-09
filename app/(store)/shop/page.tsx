import type { Metadata } from "next";
import { ShopClient, type ShopParams } from "@/components/store/ShopClient";
import { getCategories, getCollections, getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopParams> }) {
  const params = await searchParams;
  const [products, categories, collections] = await Promise.all([getProducts(), getCategories(), getCollections()]);
  const cat = categories.find((c) => c.slug === params.category);
  const col = collections.find((c) => c.slug === params.collection);
  const title = col?.name ?? cat?.name ?? (params.sort === "new" ? "New Arrivals" : params.q ? `Results for “${params.q}”` : "Shop all");
  return (
    <ShopClient
      key={JSON.stringify(params)}
      products={products}
      categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      collections={collections.map((c) => ({ name: c.name, slug: c.slug }))}
      initial={params}
      title={title}
    />
  );
}
