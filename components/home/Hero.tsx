"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/types";
import { SmartImage } from "../SmartImage";
import { AnimatedIcon } from "../motion/AnimatedIcon";

export function Hero({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const n = banners.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6500);
    return () => clearInterval(t);
  }, [n, i]);
  if (!n) return null;
  const b = banners[i];

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative h-[78svh] min-h-[520px] max-h-[820px]">
        <AnimatePresence mode="sync">
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
            <SmartImage src={b.image} alt={b.title} eager fallbackKey="dress" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/15 sm:bg-gradient-to-r sm:from-ink/80 sm:via-ink/35 sm:to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="container relative flex h-full items-end pb-20 sm:items-center sm:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={i} className="max-w-xl text-ivory" initial="hidden" animate="show" exit="exit" variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } }}>
              {[
                <p key="e" className="eyebrow inline-block rounded-full bg-ink/45 px-3 py-1 !text-ivory backdrop-blur-sm">{b.eyebrow}</p>,
                <h1 key="t" className="mt-4 text-balance font-serif text-[2.75rem] font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
                  {b.title}
                </h1>,
                <p key="s" className="mt-5 max-w-md text-base leading-relaxed text-ivory/80 sm:text-lg">
                  {b.subtitle}
                </p>,
                <div key="c" className="mt-8 flex flex-wrap gap-3">
                  <Link href={b.link || "/shop"} className="btn bg-ivory text-ink hover:-translate-y-0.5 hover:bg-white">
                    {b.cta || "Shop now"} <AnimatedIcon icon={ArrowRight} size={16} />
                  </Link>
                  <Link href="/shop?sort=new" className="btn border border-ivory/40 text-ivory hover:bg-ivory/10">
                    New arrivals
                  </Link>
                </div>,
              ].map((el, k) => (
                <motion.div
                  key={k}
                  variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }, exit: { opacity: 0, y: -10, transition: { duration: 0.25 } } }}
                >
                  {el}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {n > 1 && (
          <div className="absolute inset-x-0 bottom-6 sm:bottom-10">
            <div className="container flex items-center justify-between">
              <div className="flex gap-2">
                {banners.map((_, k) => (
                  <button key={k} onClick={() => setI(k)} className="h-1 w-10 overflow-hidden rounded-full bg-ivory/25" aria-label={`Show slide ${k + 1}`}>
                    {k === i && <motion.span className="block h-full bg-ivory" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 6.5, ease: "linear" }} />}
                  </button>
                ))}
              </div>
              <div className="hidden gap-2 sm:flex">
                <button onClick={() => setI((i - 1 + n) % n)} className="rounded-full border border-ivory/30 p-3 text-ivory hover:bg-ivory/10" aria-label="Previous slide">
                  <AnimatedIcon icon={ChevronLeft} size={18} />
                </button>
                <button onClick={() => setI((i + 1) % n)} className="rounded-full border border-ivory/30 p-3 text-ivory hover:bg-ivory/10" aria-label="Next slide">
                  <AnimatedIcon icon={ChevronRight} size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
