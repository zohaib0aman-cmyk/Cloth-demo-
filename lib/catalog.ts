import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { safeJSON } from "./format";
import { salePriceOf } from "./pricing";
import type { ProductColor, ProductDTO } from "./types";

const include = {
  category: { select: { name: true, slug: true } },
  collections: { select: { slug: true } },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

export function toProductDTO(p: ProductRow): ProductDTO {
  const count = p.reviews.length;
  const rating = count ? p.reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    fabric: p.fabric,
    care: p.care,
    price: p.price,
    discount: p.discount,
    salePrice: salePriceOf(p.price, p.discount),
    images: safeJSON<string[]>(p.images, []),
    sizes: safeJSON<string[]>(p.sizes, []),
    colors: safeJSON<ProductColor[]>(p.colors, []),
    stock: p.stock,
    isNew: p.isNew,
    isBestseller: p.isBestseller,
    isFeatured: p.isFeatured,
    category: p.category,
    collections: p.collections.map((c) => c.slug),
    rating: Math.round(rating * 10) / 10,
    reviewCount: count,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function getProducts(where: Prisma.ProductWhereInput = {}, take?: number): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, ...where },
    include,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toProductDTO);
}

export async function getProductBySlug(slug: string) {
  const row = await prisma.product.findUnique({ where: { slug }, include });
  if (!row || !row.active) return null;
  return toProductDTO(row);
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
}

export async function getCollections(onlyFeatured = false) {
  return prisma.collection.findMany({
    where: onlyFeatured ? { featured: true } : {},
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
