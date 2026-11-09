"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ChevronDown, Heart, MapPin, Minus, Plus, Ruler, ShoppingBag, Truck, X, Zap, RotateCcw, ShieldCheck, ZoomIn } from "lucide-react";
import type { ProductDTO } from "@/lib/types";
import { SmartImage } from "../SmartImage";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { Stars } from "./Stars";
import { useCart, useHydrated, useWishlist } from "@/lib/store/cart";
import { useFlyToCart } from "./FlyToCart";
import { useStore, whatsappLink } from "./StoreContext";
import { WhatsAppIcon } from "./WhatsAppButton";
import { cn, formatINR } from "@/lib/format";
import { brand } from "@/lib/brand";

const CHARTS: Record<string, { head: string[]; rows: string[][]; note: string }> = {
  apparel: {
    head: ["Size", "Bust (in)", "Waist (in)", "Hip (in)", "Length (in)"],
    rows: [
      ["XS", "32", "26", "35", "44"],
      ["S", "34", "28", "37", "44"],
      ["M", "36", "30", "39", "45"],
      ["L", "38", "32", "41", "45"],
      ["XL", "40", "34", "43", "46"],
      ["XXL", "42", "36", "45", "46"],
    ],
    note: "Garment measurements. For a relaxed fit, choose one size up.",
  },
  denim: {
    head: ["Size", "Waist (in)", "Hip (in)", "Inseam (in)", "Rise (in)"],
    rows: [
      ["28", "28", "36", "29", "11"],
      ["30", "30", "38", "29.5", "11.25"],
      ["32", "32", "40", "30", "11.5"],
      ["34", "34", "42", "30.5", "11.75"],
      ["36", "36", "44", "31", "12"],
    ],
    note: "Rigid denim relaxes by about half an inch with wear.",
  },
  free: {
    head: ["Piece", "Length", "Width", "Blouse piece"],
    rows: [["Saree", "5.5 m", "1.1 m", "0.8 m, unstitched"]],
    note: "Free size drape. Blouse stitching is available on request via WhatsApp.",
  },
};

function SizeChart({ open, onClose, sizes }: { open: boolean; onClose: () => void; sizes: string[] }) {
  const chart = sizes.includes("Free Size") ? CHARTS.free : /^\d+$/.test(sizes[0] ?? "") ? CHARTS.denim : CHARTS.apparel;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="w-full max-w-xl rounded-t-3xl bg-ivory p-6 sm:rounded-3xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Size guide</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-ink/5" aria-label="Close size guide">
                <AnimatedIcon icon={X} />
              </button>
            </div>
            <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
              <table className="w-full text-sm">
                <thead className="bg-ivory-deep text-left">
                  <tr>
                    {chart.head.map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((r) => (
                    <tr key={r[0]} className="border-t border-line">
                      {r.map((c, i) => (
                        <td key={i} className={cn("px-4 py-2.5", i === 0 && "font-semibold")}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-mute">{chart.note}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Gallery({ product }: { product: ProductDTO }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const images = product.images.length ? product.images : [""];
  const tone = product.colors[0]?.hex;

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      <div className="no-scrollbar flex gap-2 overflow-x-auto lg:w-20 lg:flex-col">
        {images.map((src, i) => (
          <button key={i} onClick={() => setActive(i)} className={cn("relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-ivory transition lg:w-full", active === i ? "ring-ink" : "ring-transparent opacity-70 hover:opacity-100")} aria-label={`View image ${i + 1}`}>
            <SmartImage src={src} alt="" fallbackKey={product.category.slug} tone={tone} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-ivory-deep"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setLightbox(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <SmartImage
              src={images[active]}
              alt={product.name}
              eager
              fallbackKey={product.category.slug}
              tone={tone}
              className="h-full w-full object-cover !transition-transform !duration-200"
            />
          </motion.div>
        </AnimatePresence>
        {zoom && (
          <div
            className="pointer-events-none absolute inset-0 hidden bg-no-repeat lg:block"
            style={{ backgroundImage: `url("${images[active]}")`, backgroundSize: "220%", backgroundPosition: `${zoom.x}% ${zoom.y}%` }}
          />
        )}
        <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          <ZoomIn size={14} /> <span className="hidden lg:inline">Hover to zoom ·</span> Tap to expand
        </span>
        {product.discount > 0 && <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">−{product.discount}%</span>}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div className="fixed inset-0 z-[90] flex flex-col bg-ink" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between p-4 text-ivory">
              <span className="text-sm">
                {active + 1} / {images.length}
              </span>
              <button onClick={() => setLightbox(false)} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
                <AnimatedIcon icon={X} />
              </button>
            </div>
            <motion.div
              className="flex flex-1 items-center justify-center overflow-hidden"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) setActive((a) => (a + 1) % images.length);
                if (info.offset.x > 60) setActive((a) => (a - 1 + images.length) % images.length);
              }}
            >
              <motion.div key={active} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full max-h-[85vh] w-full max-w-3xl touch-pinch-zoom">
                <SmartImage src={images[active]} alt={product.name} fallbackKey={product.category.slug} tone={tone} className="h-full w-full object-contain" />
              </motion.div>
            </motion.div>
            <div className="flex justify-center gap-2 p-4">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-8 bg-ivory" : "w-3 bg-ivory/30")} aria-label={`Image ${i + 1}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold">
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-5 text-sm leading-relaxed text-ink-soft">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductDetail({ product }: { product: ProductDTO }) {
  const router = useRouter();
  const { settings } = useStore();
  const [color, setColor] = useState(product.colors[0]?.name ?? "Default");
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [chart, setChart] = useState(false);
  const [added, setAdded] = useState(false);
  const [pin, setPin] = useState("");
  const [eta, setEta] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const fly = useFlyToCart();
  const hydrated = useHydrated();
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const out = product.stock <= 0;

  function addToCart(buyNow = false) {
    if (!size) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 600);
      return false;
    }
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "",
        category: product.category.slug,
        size,
        color,
        price: product.salePrice,
        mrp: product.price,
        stock: product.stock,
      },
      qty,
    );
    if (buyNow) {
      router.push("/checkout");
    } else {
      fly(product.images[0] ?? "", galleryRef.current);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      setTimeout(() => openDrawer(true), 950);
    }
    return true;
  }

  function checkPin() {
    if (!/^\d{6}$/.test(pin)) {
      setEta("Please enter a valid 6-digit pincode");
      return;
    }
    const days = 3 + (Number(pin[0]) % 3);
    const d = new Date(Date.now() + days * 86400000);
    setEta(`Delivery by ${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · COD available`);
  }

  const waText = `Hi ${brand.brandName}! I'd like to order:\n${product.name}\nSize: ${size || "—"} · Colour: ${color} · Qty: ${qty}\nPrice: ${formatINR(product.salePrice)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <div ref={galleryRef}>
        <Gallery product={product} />
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href={`/shop?category=${product.category.slug}`} className="eyebrow">
            {product.category.name}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{product.name}</h1>
          {product.reviewCount > 0 && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-ink-mute">
              <Stars value={product.rating} /> {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </a>
          )}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-serif text-4xl font-semibold">{formatINR(product.salePrice)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-ink-mute line-through">{formatINR(product.price)}</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Save {formatINR(product.price - product.salePrice)}</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-mute">MRP inclusive of all taxes · GST invoice provided</p>
        </motion.div>

        <div className="mt-7">
          <p className="label">
            Colour: <span className="normal-case tracking-normal text-ink">{color}</span>
          </p>
          <div className="flex gap-3">
            {product.colors.map((c) => (
              <motion.button key={c.name} whileTap={{ scale: 0.88 }} onClick={() => setColor(c.name)} className={cn("rounded-full p-1 ring-2 transition", color === c.name ? "ring-ink" : "ring-transparent hover:ring-line")} aria-label={c.name} title={c.name}>
                <span className="block h-8 w-8 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="label">Size {size && <span className="normal-case tracking-normal text-ink">: {size}</span>}</p>
            <button onClick={() => setChart(true)} className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
              <AnimatedIcon icon={Ruler} size={14} /> Size guide
            </button>
          </div>
          <motion.div animate={sizeError ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.45 }} className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSize(s)}
                className={cn("min-w-12 rounded-xl border px-4 py-2.5 text-sm font-semibold transition", size === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40", sizeError && !size && "border-brand")}
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
          <AnimatePresence>{sizeError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 text-xs font-semibold text-brand">Please choose a size</motion.p>}</AnimatePresence>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm">
          {out ? (
            <span className="font-semibold text-brand">Sold out — back soon</span>
          ) : product.stock <= 5 ? (
            <span className="flex items-center gap-2 font-semibold text-amber-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Hurry, only {product.stock} left in stock
            </span>
          ) : (
            <span className="flex items-center gap-2 font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock, ready to ship
            </span>
          )}
        </div>

        {!out && (
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center rounded-full border border-line bg-white">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3.5" aria-label="Decrease quantity">
                <AnimatedIcon icon={Minus} size={15} />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3.5" aria-label="Increase quantity">
                <AnimatedIcon icon={Plus} size={15} />
              </button>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => addToCart(false)} className={cn("btn-dark flex-1 py-3.5", added && "!bg-emerald-700")}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={added ? "a" : "b"} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="inline-flex items-center gap-2">
                  {added ? <Check size={18} /> : <ShoppingBag size={18} />} {added ? "Added to bag" : "Add to bag"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleWish(product.id)} className="rounded-full border border-line bg-white p-3.5" aria-label="Toggle wishlist">
              <motion.span key={String(wished)} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }} className={cn("inline-flex", hydrated && wished && "text-brand")}>
                <Heart size={19} fill={hydrated && wished ? "currentColor" : "none"} />
              </motion.span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => addToCart(true)} className="btn-primary w-full py-3.5">
              <AnimatedIcon icon={Zap} size={17} /> Buy it now
            </motion.button>
            {settings.whatsapp && (
              <a href={whatsappLink(settings.whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="btn w-full border border-[#25D366]/40 bg-[#25D366]/10 py-3 text-[#128C7E] hover:bg-[#25D366]/15">
                <WhatsAppIcon size={18} /> Order on WhatsApp
              </a>
            )}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-line bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <AnimatedIcon icon={MapPin} size={16} className="text-brand" /> Check delivery
          </p>
          <div className="mt-3 flex gap-2">
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter pincode" className="input py-2.5" aria-label="Pincode" />
            <button onClick={checkPin} className="btn-outline shrink-0 px-5 py-2.5">
              Check
            </button>
          </div>
          <AnimatePresence>{eta && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs font-medium text-emerald-700">{eta}</motion.p>}</AnimatePresence>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] text-ink-soft">
          {[
            [Truck, `Free over ${formatINR(settings.freeDeliveryAbove)}`],
            [RotateCcw, "7-day returns"],
            [ShieldCheck, "Secure checkout"],
          ].map(([Icon, label], i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-ivory-deep/60 px-2 py-3">
              <AnimatedIcon icon={Icon as typeof Truck} size={18} className="text-brand" delay={i * 0.06} />
              {label as string}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Accordion title="Description" defaultOpen>
            {product.description}
          </Accordion>
          <Accordion title="Fabric & care">
            <p>
              <b className="text-ink">Fabric:</b> {product.fabric}
            </p>
            <p className="mt-2">
              <b className="text-ink">Care:</b> {product.care}
            </p>
          </Accordion>
          <Accordion title="Shipping & returns">
            Dispatched within 24–48 hours. Standard delivery in 3–6 working days across India, express in 1–3 days. Easy 7-day returns and exchanges with free reverse pickup.
          </Accordion>
        </div>
      </div>

      <SizeChart open={chart} onClose={() => setChart(false)} sizes={product.sizes} />

      {!out && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-ivory/95 p-3 pr-20 backdrop-blur lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-mute">{product.name}</p>
            <p className="font-semibold">{formatINR(product.salePrice)}</p>
          </div>
          <button onClick={() => (size ? addToCart(false) : (window.scrollTo({ top: 300, behavior: "smooth" }), addToCart(false)))} className="btn-dark px-5 py-2.5">
            <ShoppingBag size={16} /> Add
          </button>
        </div>
      )}
    </div>
  );
}
