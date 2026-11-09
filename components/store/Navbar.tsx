"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X, Package, ArrowRight } from "lucide-react";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { BrandLogo } from "../BrandLogo";
import { SmartImage } from "../SmartImage";
import { useCart, useHydrated, useWishlist } from "@/lib/store/cart";
import { useStore } from "./StoreContext";
import { formatINR, cn } from "@/lib/format";
import { brand } from "@/lib/brand";

type Hit = { slug: string; name: string; image: string; salePrice: number; category: string };

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setHits(d.results ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="bg-ivory shadow-lift"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form
              className="container flex items-center gap-3 py-5"
              onSubmit={(e) => {
                e.preventDefault();
                onClose();
                router.push(`/shop?q=${encodeURIComponent(q)}`);
              }}
            >
              <AnimatedIcon icon={Search} className="text-ink-mute" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search kurtis, sarees, denim…"
                className="w-full bg-transparent font-serif text-2xl outline-none placeholder:text-ink-mute/60 sm:text-3xl"
              />
              <button type="button" onClick={onClose} aria-label="Close search" className="rounded-full p-2 hover:bg-ink/5">
                <AnimatedIcon icon={X} />
              </button>
            </form>
            <div className="container pb-6">
              {loading && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-20" />)}</div>}
              {!loading && hits.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {hits.map((h, i) => (
                    <motion.div key={h.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Link href={`/product/${h.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white">
                        <SmartImage src={h.image} alt={h.name} fallbackKey={h.category} className="h-16 w-12 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{h.name}</p>
                          <p className="text-sm text-ink-mute">{formatINR(h.salePrice)}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
              {!loading && q && hits.length === 0 && <p className="text-sm text-ink-mute">No matches yet — press enter to search the full shop.</p>}
              {!q && (
                <div className="flex flex-wrap gap-2">
                  {["Kurti", "Saree", "Co-ord", "Lehenga", "Oversized tee", "Jeans"].map((t) => (
                    <button key={t} type="button" onClick={() => setQ(t)} className="chip">
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Navbar() {
  const { categories, collections, user } = useStore();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const bump = useCart((s) => s.bump);
  const openDrawer = useCart((s) => s.openDrawer);
  const wishCount = useWishlist((s) => s.ids.length);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const links = [
    { href: "/shop", label: "Shop All" },
    { href: "/shop?sort=new", label: "New Arrivals" },
    { href: "/collections", label: "Collections", mega: true },
    { href: "/track", label: "Track Order" },
  ];

  return (
    <>
      <header className={cn("sticky top-0 z-50 transition-all duration-500", scrolled ? "bg-ivory/90 shadow-[0_1px_0_#e7dfd3] backdrop-blur-md" : "bg-ivory")}>
        <div className="container flex h-16 items-center justify-between gap-4 sm:h-[72px]">
          <div className="flex items-center gap-1 lg:hidden">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="-ml-2 rounded-full p-2 hover:bg-ink/5">
              <AnimatedIcon icon={Menu} size={22} />
            </button>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="rounded-full p-2 hover:bg-ink/5 sm:hidden">
              <AnimatedIcon icon={Search} size={20} />
            </button>
          </div>

          <Link href="/" className="flex items-center lg:flex-none" aria-label={`${brand.brandName} home`}>
            <BrandLogo size="md" withName nameClassName="hidden sm:inline text-2xl" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" onMouseLeave={() => setMega(false)}>
            {links.map((l) => (
              <div key={l.label} className="relative" onMouseEnter={() => setMega(!!l.mega)}>
                <Link href={l.href} className="group relative flex items-center gap-1 py-6 text-sm font-medium tracking-wide text-ink-soft transition hover:text-ink">
                  {l.label}
                  {l.mega && <ChevronDown size={14} className={cn("transition", mega && "rotate-180")} />}
                  <span className="absolute bottom-5 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
                </Link>
              </div>
            ))}
            <AnimatePresence>
              {mega && (
                <motion.div
                  className="absolute left-0 right-0 top-full border-t border-line bg-ivory shadow-soft"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  onMouseEnter={() => setMega(true)}
                >
                  <div className="container grid grid-cols-12 gap-8 py-8">
                    <div className="col-span-3">
                      <p className="eyebrow mb-4">Shop by category</p>
                      <ul className="space-y-2.5">
                        {categories.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/shop?category=${c.slug}`} className="group flex items-center gap-2 font-serif text-xl text-ink-soft transition hover:text-brand">
                              {c.name}
                              <ArrowRight size={14} className="-translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-9 grid grid-cols-4 gap-4">
                      {collections.slice(0, 4).map((c) => (
                        <Link key={c.slug} href={`/shop?collection=${c.slug}`} className="group">
                          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-ivory-deep">
                            <SmartImage src={c.image} alt={c.name} fallbackKey={c.slug} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                          </div>
                          <p className="mt-2 font-serif text-lg">{c.name}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="hidden rounded-full p-2.5 hover:bg-ink/5 sm:inline-flex">
              <AnimatedIcon icon={Search} />
            </button>
            <Link href={user ? "/account" : "/account/login"} aria-label="Account" className="hidden rounded-full p-2.5 hover:bg-ink/5 sm:inline-flex">
              <AnimatedIcon icon={User} />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2.5 hover:bg-ink/5">
              <AnimatedIcon icon={Heart} />
              {hydrated && wishCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{wishCount}</span>
              )}
            </Link>
            <button onClick={() => openDrawer(true)} aria-label="Open cart" className="relative rounded-full p-2.5 hover:bg-ink/5" data-cart-target>
              <motion.span key={bump} className="inline-flex" animate={bump ? { scale: [1, 1.35, 0.9, 1], rotate: [0, -10, 8, 0] } : {}} transition={{ duration: 0.6, delay: 0.75 }}>
                <AnimatedIcon icon={ShoppingBag} />
              </motion.span>
              {hydrated && count > 0 && (
                <motion.span
                  key={`c${count}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[60] bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}>
            <motion.aside
              className="flex h-full w-[86%] max-w-sm flex-col bg-ivory"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <BrandLogo size="sm" withName nameClassName="text-lg" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-ink/5">
                  <AnimatedIcon icon={X} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <ul className="space-y-1">
                  {links.map((l, i) => (
                    <motion.li key={l.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                      <Link href={l.href} className="block py-2 font-serif text-2xl">
                        {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <p className="eyebrow mb-3 mt-8">Categories</p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((c, i) => (
                    <motion.div key={c.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i + 0.25 }}>
                      <Link href={`/shop?category=${c.slug}`} className="block overflow-hidden rounded-xl bg-white">
                        <SmartImage src={c.image} alt={c.name} fallbackKey={c.slug} className="aspect-[4/3] w-full object-cover" />
                        <p className="px-3 py-2 text-sm font-medium">{c.name}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
                <Link href={user ? "/account" : "/account/login"} className="btn-outline px-3">
                  <AnimatedIcon icon={User} size={16} /> {user ? "My account" : "Sign in"}
                </Link>
                <Link href="/track" className="btn-outline px-3">
                  <AnimatedIcon icon={Package} size={16} /> Track order
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
