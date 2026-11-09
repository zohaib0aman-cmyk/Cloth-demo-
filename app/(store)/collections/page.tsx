import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/store/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/SmartImage";
import { getCategories, getCollections } from "@/lib/catalog";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const [collections, categories] = await Promise.all([getCollections(), getCategories()]);
  return (
    <>
      <PageHero eyebrow="Explore" title="Collections & categories" text="Edits for every season and occasion, curated by our design team." />
      <div className="container py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {collections.map((c, i) => (
            <Reveal key={c.id} delay={(i % 2) * 0.08}>
              <Link href={`/shop?collection=${c.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-3xl">
                <SmartImage src={c.image} alt={c.name} fallbackKey={c.slug} className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 p-6 text-ivory sm:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-ivory/70">{c._count.products} pieces</p>
                  <h2 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">{c.name}</h2>
                  <p className="mt-1 max-w-md text-sm text-ivory/75">{c.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    Shop now <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <h2 className="section-title mt-20">Shop by category</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.06}>
              <Link href={`/shop?category=${c.slug}`} className="group card block overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <SmartImage src={c.image} alt={c.name} fallbackKey={c.slug} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <p className="font-serif text-2xl font-semibold">{c.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-mute">{c.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
