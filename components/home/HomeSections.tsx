"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, Quote, RotateCcw, ShieldCheck, Truck, HandCoins, Ticket } from "lucide-react";
import type { ProductDTO } from "@/lib/types";
import { SmartImage } from "../SmartImage";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { Reveal, Stagger, StaggerItem } from "../motion/Reveal";
import { ProductCard } from "../store/ProductCard";
import { Stars } from "../store/Stars";
import { useStore } from "../store/StoreContext";
import { formatINR } from "@/lib/format";
import { useBrand } from "@/components/BrandContext";

export function SectionHeading({ eyebrow, title, href, cta = "View all" }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <Reveal className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title mt-2">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group hidden shrink-0 items-center gap-2 text-sm font-semibold sm:inline-flex">
          {cta}
          <span className="transition group-hover:translate-x-1">
            <ArrowRight size={16} />
          </span>
        </Link>
      )}
    </Reveal>
  );
}

export function TrustBadges() {
  const { settings } = useStore();
  const items = [
    { icon: HandCoins, title: "Cash on delivery", text: "Pay when it reaches you" },
    { icon: RotateCcw, title: "Easy 7-day returns", text: "No-questions pickup" },
    { icon: ShieldCheck, title: "Secure payments", text: "UPI, cards & net banking" },
    { icon: Truck, title: "Free shipping", text: `On orders above ${formatINR(settings.freeDeliveryAbove)}` },
  ];
  return (
    <section className="border-b border-line bg-white">
      <Stagger className="container grid grid-cols-2 gap-y-6 py-7 lg:grid-cols-4">
        {items.map((it) => (
          <StaggerItem key={it.title} className="flex items-center gap-3 px-1 sm:justify-center">
            <span className="rounded-full bg-brand/10 p-3 text-brand">
              <AnimatedIcon icon={it.icon} size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold">{it.title}</p>
              <p className="text-xs text-ink-mute">{it.text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function CategoryRail({ categories }: { categories: { name: string; slug: string; image: string; count: number }[] }) {
  return (
    <section className="container py-16 sm:py-24">
      <SectionHeading eyebrow="Shop by category" title="Find your next favourite" href="/shop" />
      <Stagger className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
        {categories.map((c) => (
          <StaggerItem key={c.slug} className="w-[38%] shrink-0 snap-start sm:w-auto">
            <Link href={`/shop?category=${c.slug}`} className="group block text-center">
              <div className="relative mx-auto aspect-[3/4] overflow-hidden rounded-t-full bg-ivory-deep">
                <SmartImage src={c.image} alt={c.name} fallbackKey={c.slug} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10" />
              </div>
              <p className="mt-3 font-serif text-xl font-semibold">{c.name}</p>
              <p className="text-xs text-ink-mute">{c.count} styles</p>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function FeaturedCollections({ collections }: { collections: { name: string; slug: string; image: string; tagline: string }[] }) {
  const [a, ...rest] = collections;
  if (!a) return null;
  return (
    <section className="container pb-16 sm:pb-24">
      <SectionHeading eyebrow="Featured collections" title="Curated for the moment" href="/collections" cta="All collections" />
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal>
          <Link href={`/shop?collection=${a.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl md:aspect-auto md:h-full">
            <SmartImage src={a.image} alt={a.name} fallbackKey={a.slug} className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 p-6 text-ivory sm:p-8">
              <p className="eyebrow !text-accent">Collection</p>
              <h3 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">{a.name}</h3>
              <p className="mt-2 max-w-sm text-sm text-ivory/75">{a.tagline}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                Explore <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {rest.slice(0, 3).map((c, k) => (
            <Reveal key={c.slug} delay={k * 0.08} className={k === 2 ? "sm:col-span-2 md:col-span-1 lg:col-span-2" : ""}>
              <Link href={`/shop?collection=${c.slug}`} className={`group relative block overflow-hidden rounded-3xl ${k === 2 ? "aspect-[16/9] lg:aspect-[2/1]" : "aspect-square"}`}>
                <SmartImage src={c.image} alt={c.name} fallbackKey={c.slug} className="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent" />
                <div className="absolute bottom-0 p-5 text-ivory">
                  <h3 className="font-serif text-2xl font-semibold">{c.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-ivory/75">{c.tagline}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductRail({ eyebrow, title, href, products }: { eyebrow: string; title: string; href: string; products: ProductDTO[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <div className="mb-10 hidden gap-2 sm:flex">
            <button onClick={() => scroll(-1)} className="rounded-full border border-line bg-white p-3 hover:border-ink/40" aria-label="Scroll left">
              <AnimatedIcon icon={ChevronLeft} size={18} />
            </button>
            <button onClick={() => scroll(1)} className="rounded-full border border-line bg-white p-3 hover:border-ink/40" aria-label="Scroll right">
              <AnimatedIcon icon={ChevronRight} size={18} />
            </button>
          </div>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar container flex snap-x gap-4 overflow-x-auto pb-2 sm:gap-6">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 5) * 0.06} className="w-[62%] shrink-0 snap-start sm:w-[38%] md:w-[28%] lg:w-[22%]">
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
      <div className="container mt-6 sm:hidden">
        <Link href={href} className="btn-outline w-full">
          View all <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export function OfferStrip({ code, text }: { code: string; text: string }) {
  const words = ["Handwoven", "Hand-block printed", "Artisan made", "Free shipping", "Easy returns", "Cash on delivery"];
  return (
    <section className="overflow-hidden bg-brand py-10 text-white sm:py-14">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-serif text-2xl italic text-white/50 sm:text-3xl">
        {[...words, ...words, ...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w} <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
      <Reveal className="container mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:text-left">
        <span className="rounded-full bg-white/15 p-3">
          <AnimatedIcon icon={Ticket} size={22} />
        </span>
        <p className="max-w-lg text-lg">{text}</p>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => navigator.clipboard?.writeText(code).catch(() => {})}
          className="rounded-full border-2 border-dashed border-white/60 px-6 py-2.5 font-mono text-lg font-bold tracking-widest hover:bg-white/10"
          title="Tap to copy"
        >
          {code}
        </motion.button>
      </Reveal>
    </section>
  );
}

export function BestsellerGrid({ products }: { products: ProductDTO[] }) {
  return (
    <section className="container py-16 sm:py-20">
      <SectionHeading eyebrow="Bestsellers" title="Loved by thousands" href="/shop?sort=rating" />
      <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {products.map((p) => (
          <StaggerItem key={p.id}>
            <ProductCard product={p} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function Editorial({ image }: { image: string }) {
  const brand = useBrand();
  return (
    <section className="bg-ivory-deep">
      <div className="container grid items-center gap-10 py-16 sm:py-24 md:grid-cols-2">
        <Reveal className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem]">
            <SmartImage src={image} alt="Artisans at work" fallbackKey="saree" className="h-full w-full object-cover" />
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-6 right-4 rounded-2xl bg-white p-5 shadow-lift sm:-right-6"
          >
            <p className="font-serif text-4xl font-semibold text-brand">120+</p>
            <p className="text-xs text-ink-mute">artisan families we work with</p>
          </motion.div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow">{brand.niche ?? "Our craft"}</p>
          <h2 className="section-title mt-3">Made slowly, by hands that remember</h2>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Every {brand.brandName} piece begins with a weaver, a block printer or an embroiderer whose craft has been handed down for generations. We pay fairly, work in small batches and
            finish each garment by hand.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
            {[
              ["14", "craft clusters"],
              ["4.8★", "average rating"],
              ["50k+", "happy customers"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-serif text-3xl font-semibold">{n}</p>
                <p className="text-xs text-ink-mute">{l}</p>
              </div>
            ))}
          </div>
          <Link href="/about" className="btn-dark mt-8">
            Read our story <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function ReviewWall({ reviews }: { reviews: { id: string; name: string; city: string; rating: number; title: string; body: string; product: string; slug: string }[] }) {
  return (
    <section className="container py-16 sm:py-24">
      <SectionHeading eyebrow="Customer love" title="Words from our community" />
      <Stagger className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
        {reviews.map((r) => (
          <StaggerItem key={r.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
            <motion.figure whileHover={{ y: -4 }} className="card flex h-full flex-col p-6">
              <Quote className="text-accent/50" size={28} />
              <Stars value={r.rating} className="mt-4" />
              <p className="mt-3 font-serif text-xl font-semibold leading-snug">{r.title}</p>
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{r.body}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand">{r.name[0]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="truncate text-xs text-ink-mute">
                    {r.city} · bought{" "}
                    <Link href={`/product/${r.slug}`} className="underline-offset-2 hover:underline">
                      {r.product}
                    </Link>
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function InstaGallery({ images }: { images: { src: string; key: string }[] }) {
  const brand = useBrand();
  const { settings } = useStore();
  return (
    <section className="pb-6">
      <div className="container">
        <Reveal className="mb-8 text-center">
          <p className="eyebrow">#Styled{brand.brandName.replace(/\s+/g, "")}</p>
          <h2 className="section-title mt-2">As worn by you</h2>
          <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
            <AnimatedIcon icon={Instagram} size={16} /> Follow us on Instagram
          </a>
        </Reveal>
      </div>
      <Stagger className="grid grid-cols-3 gap-1 sm:grid-cols-6">
        {images.slice(0, 6).map((im, i) => (
          <StaggerItem key={i}>
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden" aria-label="Open Instagram">
              <SmartImage src={im.src} alt="" fallbackKey={im.key} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/35 group-hover:opacity-100">
                <Instagram size={26} />
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
