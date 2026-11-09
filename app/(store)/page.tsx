import { Hero } from "@/components/home/Hero";
import { BestsellerGrid, CategoryRail, Editorial, FeaturedCollections, InstaGallery, OfferStrip, ProductRail, ReviewWall, TrustBadges } from "@/components/home/HomeSections";
import { getCategories, getCollections, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { IMAGES } from "@/lib/seed-data";

export default async function HomePage() {
  const [settings, categories, collections, products, reviews, coupon] = await Promise.all([
    getSettings(),
    getCategories(),
    getCollections(true),
    getProducts(),
    prisma.review.findMany({ where: { rating: { gte: 5 } }, orderBy: { createdAt: "desc" }, take: 6, include: { product: { select: { name: true, slug: true } } } }),
    prisma.coupon.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const newArrivals = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  const best = products.filter((p) => p.isBestseller).slice(0, 8);
  const gallery = products.flatMap((p) => p.images.slice(1, 2).map((src) => ({ src, key: p.category.slug }))).slice(0, 6);

  return (
    <>
      <Hero banners={settings.banners} />
      <TrustBadges />
      <CategoryRail categories={categories.map((c) => ({ name: c.name, slug: c.slug, image: c.image, count: c._count.products }))} />
      <FeaturedCollections collections={collections.map((c) => ({ name: c.name, slug: c.slug, image: c.image, tagline: c.tagline }))} />
      <div className="bg-white">
        <ProductRail eyebrow="Just landed" title="New arrivals" href="/shop?sort=new" products={newArrivals} />
      </div>
      {coupon && <OfferStrip code={coupon.code} text={coupon.description || `Use code ${coupon.code} at checkout`} />}
      <BestsellerGrid products={best.length ? best : products.slice(0, 8)} />
      <Editorial image={IMAGES.ethnicWomen[4]} />
      <ReviewWall
        reviews={reviews.map((r) => ({ id: r.id, name: r.name, city: r.city, rating: r.rating, title: r.title, body: r.body, product: r.product.name, slug: r.product.slug }))}
      />
      <InstaGallery images={gallery} />
    </>
  );
}
