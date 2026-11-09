"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { BrandLogo } from "../BrandLogo";
import { useStore } from "./StoreContext";
import { brand } from "@/lib/brand";

export function Footer() {
  const { settings, categories } = useStore();
  const year = new Date().getFullYear();
  const socials = [
    { href: settings.instagram, icon: Instagram, label: "Instagram" },
    { href: settings.facebook, icon: Facebook, label: "Facebook" },
    { href: settings.youtube, icon: Youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-24 bg-ink text-ivory/80">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="inline-flex rounded-2xl bg-ivory px-3 py-2">
            <BrandLogo size="md" withName nameClassName="text-ink text-xl" />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
            Thoughtfully made Indian clothing — handwoven, hand-printed and hand-finished by artisans we know by name.
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="rounded-full border border-ivory/15 p-2.5 transition hover:border-accent hover:text-accent">
                <AnimatedIcon icon={s.icon} size={17} />
              </a>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ivory">Shop</p>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="transition hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ivory">Help</p>
          <ul className="space-y-2.5 text-sm">
            {[
              ["/track", "Track your order"],
              ["/returns", "Returns & exchanges"],
              ["/faq", "FAQs"],
              ["/contact", "Contact us"],
              ["/about", "Our story"],
              ["/account", "My account"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-accent">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ivory">Get in touch</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <AnimatedIcon icon={MapPin} size={17} className="mt-0.5 text-accent" />
              <span>{settings.address}</span>
            </li>
            <li className="flex gap-3">
              <AnimatedIcon icon={Phone} size={17} className="text-accent" />
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                {settings.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <AnimatedIcon icon={Mail} size={17} className="text-accent" />
              <a href={`mailto:${settings.email}`} className="hover:text-accent">
                {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-ivory/50 sm:flex-row">
          <p>
            © {year} {brand.brandName}. All rights reserved.
          </p>
          <motion.span whileHover={{ y: -2 }} className="inline-flex items-center gap-1.5 rounded-full border border-ivory/15 px-3 py-1 text-[11px] tracking-wide text-ivory/60">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Demo by Zyntra
          </motion.span>
        </div>
      </div>
    </footer>
  );
}
