"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Heart, LogOut, MapPin, Package, Plus, Star, Trash2, User as UserIcon, ChevronRight } from "lucide-react";
import type { ProductDTO } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { INDIAN_STATES } from "@/lib/states";
import { useHydrated, useWishlist } from "@/lib/store/cart";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { SmartImage } from "../SmartImage";
import { ProductCard } from "./ProductCard";
import { cn, formatDate, formatINR } from "@/lib/format";

type Order = { orderNumber: string; total: number; status: string; createdAt: string; items: { name: string; image: string; qty: number }[] };
type Address = { id: string; label: string; name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string; isDefault: boolean };
type Props = { user: { name: string; email: string; phone: string; createdAt: string }; orders: Order[]; addresses: Address[]; products: ProductDTO[] };

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: UserIcon },
] as const;

export function AccountClient({ user, orders, addresses: initialAddresses, products }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const [addresses, setAddresses] = useState(initialAddresses);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "Home", name: user.name, phone: user.phone, line1: "", line2: "", city: "", state: "", pincode: "" });
  const [err, setErr] = useState("");
  const wishIds = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const wished = hydrated ? wishIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as ProductDTO[] : [];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    if (!r.ok) return setErr(d.error);
    setAddresses(d.addresses);
    setAdding(false);
    setForm({ ...form, line1: "", line2: "", city: "", state: "", pincode: "" });
  }

  async function removeAddress(id: string) {
    const r = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    if (r.ok) setAddresses((await r.json()).addresses);
  }

  async function makeDefault(id: string) {
    const r = await fetch("/api/account/addresses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) setAddresses((await r.json()).addresses);
  }

  return (
    <div className="container py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="section-title mt-2">Namaste, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-ink-mute">Member since {formatDate(user.createdAt)}</p>
        </div>
        <button onClick={logout} className="btn-outline w-fit px-5 py-2.5">
          <AnimatedIcon icon={LogOut} size={16} /> Sign out
        </button>
      </div>

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("relative flex shrink-0 items-center gap-2 px-4 pb-3 text-sm font-semibold transition", tab === t.id ? "text-ink" : "text-ink-mute hover:text-ink")}>
            <AnimatedIcon icon={t.icon} size={16} /> {t.label}
            {t.id === "orders" && <span className="rounded-full bg-ivory-deep px-1.5 text-[10px]">{orders.length}</span>}
            {t.id === "wishlist" && hydrated && <span className="rounded-full bg-ivory-deep px-1.5 text-[10px]">{wished.length}</span>}
            {tab === t.id && <motion.span layoutId="acct-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-8">
          {tab === "orders" &&
            (orders.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="font-serif text-2xl">No orders yet</p>
                <Link href="/shop" className="btn-primary mt-5">Start shopping</Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {orders.map((o, i) => (
                  <motion.li key={o.orderNumber} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/track/${o.orderNumber}`} className="card flex flex-wrap items-center gap-4 p-4 transition hover:border-ink/30 sm:flex-nowrap">
                      <div className="flex -space-x-3">
                        {o.items.slice(0, 3).map((it, k) => (
                          <div key={k} className="h-16 w-12 overflow-hidden rounded-lg border-2 border-white bg-ivory-deep">
                            <SmartImage src={it.image} alt={it.name} fallbackKey={it.name} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-bold">{o.orderNumber}</p>
                        <p className="truncate text-xs text-ink-mute">
                          {formatDate(o.createdAt)} · {o.items.reduce((n, it) => n + it.qty, 0)} items
                        </p>
                      </div>
                      <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider", o.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : o.status === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-brand/10 text-brand")}>
                        {STATUS_LABEL[o.status]}
                      </span>
                      <span className="font-semibold">{formatINR(o.total)}</span>
                      <ChevronRight size={16} className="text-ink-mute" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            ))}

          {tab === "addresses" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {addresses.map((a) => (
                <motion.div layout key={a.id} className={cn("card relative p-5", a.isDefault && "border-ink")}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">{a.label}</span>
                    {a.isDefault && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">Default</span>}
                  </div>
                  <p className="mt-3 text-sm font-semibold">{a.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {a.line1}
                    {a.line2 && `, ${a.line2}`}
                    <br />
                    {a.city}, {a.state} {a.pincode}
                    <br />
                    {a.phone}
                  </p>
                  <div className="mt-4 flex gap-3 text-xs font-semibold">
                    {!a.isDefault && (
                      <button onClick={() => makeDefault(a.id)} className="flex items-center gap-1 text-ink-soft hover:text-ink">
                        <Star size={13} /> Make default
                      </button>
                    )}
                    <button onClick={() => removeAddress(a.id)} className="flex items-center gap-1 text-brand">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
              {!adding ? (
                <button onClick={() => setAdding(true)} className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-ink-soft transition hover:border-ink/30 hover:text-ink">
                  <AnimatedIcon icon={Plus} size={22} /> Add new address
                </button>
              ) : (
                <motion.form initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} onSubmit={saveAddress} className="card grid gap-3 p-5 sm:col-span-2">
                  <div className="grid grid-cols-2 gap-3">
                    <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input" aria-label="Address label">
                      {["Home", "Office", "Other"].map((l) => <option key={l}>{l}</option>)}
                    </select>
                    <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" aria-label="Full name" />
                  </div>
                  <input required placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" aria-label="Mobile number" />
                  <input required placeholder="House no., building, street" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="input" aria-label="Address line 1" />
                  <input placeholder="Area, landmark (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="input" aria-label="Address line 2" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" aria-label="City" />
                    <input required placeholder="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} className="input" aria-label="Pincode" />
                  </div>
                  <select required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" aria-label="State">
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  {err && <p className="text-sm text-brand">{err}</p>}
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1">Save address</button>
                    <button type="button" onClick={() => setAdding(false)} className="btn-outline">Cancel</button>
                  </div>
                </motion.form>
              )}
            </div>
          )}

          {tab === "wishlist" &&
            (wished.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="font-serif text-2xl">Your wishlist is empty</p>
                <p className="mt-2 text-sm text-ink-mute">Tap the heart on any product to save it here.</p>
                <Link href="/shop" className="btn-primary mt-5">Discover pieces</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
                {wished.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ))}

          {tab === "profile" && (
            <div className="card max-w-lg divide-y divide-line">
              {[
                ["Name", user.name],
                ["Email", user.email],
                ["Mobile", user.phone || "—"],
                ["Orders placed", String(orders.length)],
                ["Total spent", formatINR(orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0))],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 p-4 text-sm">
                  <span className="text-ink-mute">{k}</span>
                  <span className="text-right font-medium">{v}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
