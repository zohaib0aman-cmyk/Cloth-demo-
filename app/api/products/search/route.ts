import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) return NextResponse.json({ results: [] });
  const all = await getProducts();
  const results = all
    .filter((p) => `${p.name} ${p.category.name} ${p.fabric}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map((p) => ({ slug: p.slug, name: p.name, image: p.images[0] ?? "", salePrice: p.salePrice, category: p.category.slug }));
  return NextResponse.json({ results });
}
