import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Leaf, Scissors } from "lucide-react";
import { PageHero } from "@/components/store/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/SmartImage";
import { MotionIcon } from "@/components/motion/AnimatedIcon";
import { brand } from "@/lib/brand";
import { IMAGES } from "@/lib/seed-data";

export const metadata: Metadata = { title: "Our story" };

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Our story" title={`The hands behind ${brand.brandName}`} text="A small label with a big respect for Indian craft, honest fabric and clothes that last." />
      <section className="container grid items-center gap-10 py-16 md:grid-cols-2 sm:py-24">
        <Reveal className="aspect-[4/5] overflow-hidden rounded-[2rem]">
          <SmartImage src={IMAGES.lifestyle[0]} alt="Our studio" fallbackKey="dress" className="h-full w-full object-cover" />
        </Reveal>
        <Reveal delay={0.1} className="prose-store">
          <h2 className="!mt-0 font-serif !text-4xl">Begun at a single loom</h2>
          <p>
            {brand.brandName} started with a simple belief: that the clothes we wear every day can carry the stories of the people who made them. Today we work with weavers in Varanasi and
            Chanderi, block printers in Bagru and Kutch, and chikankari artisans in Lucknow.
          </p>
          <p>
            We design in small batches, pay fair wages, and never chase trends that end up in landfill. Every piece is checked by hand before it is folded into its cotton bag and sent to you.
          </p>
          <Link href="/shop" className="btn-dark mt-4">Shop the collection</Link>
        </Reveal>
      </section>
      <section className="bg-white">
        <div className="container grid gap-6 py-16 sm:grid-cols-3">
          {[
            { icon: HandHeart, title: "Artisan first", text: "Fair, on-time payments and long-term partnerships with 120+ craft families." },
            { icon: Leaf, title: "Natural fibres", text: "Cotton, linen, silk and natural dyes wherever we can — gentle on skin and soil." },
            { icon: Scissors, title: "Small batches", text: "Limited runs mean less waste and pieces that feel personal." },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08} className="card p-7">
              <span className="inline-flex rounded-full bg-brand/10 p-3 text-brand">
                <MotionIcon><v.icon size={22} strokeWidth={1.6} /></MotionIcon>
              </span>
              <h3 className="mt-5 text-2xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
