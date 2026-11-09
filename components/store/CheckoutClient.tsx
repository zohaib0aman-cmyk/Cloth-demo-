"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, CreditCard, HandCoins, Landmark, Lock, QrCode, Truck, Zap, MapPin } from "lucide-react";
import { useCart, useCheckout, useHydrated, type CheckoutDraft } from "@/lib/store/cart";
import type { ShippingAddress } from "@/lib/types";
import { INDIAN_STATES } from "@/lib/states";
import { useStore } from "./StoreContext";
import { useTotals } from "./useTotals";
import { PriceSummary } from "./PriceSummary";
import { SmartImage } from "../SmartImage";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { cn, formatINR } from "@/lib/format";

type SavedAddress = ShippingAddress & { id: string; label: string; isDefault: boolean };

export function Steps({ current }: { current: number }) {
  const steps = ["Bag", "Details", "Payment", "Done"];
  return (
    <ol className="flex items-center gap-2 text-xs font-semibold sm:gap-3">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2 sm:gap-3">
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border transition", i < current ? "border-brand bg-brand text-white" : i === current ? "border-ink text-ink" : "border-line text-ink-mute")}>
            {i < current ? <Check size={12} strokeWidth={3} /> : i + 1}
          </span>
          <span className={cn("hidden sm:inline", i === current ? "text-ink" : "text-ink-mute")}>{s}</span>
          {i < steps.length - 1 && <span className="h-px w-5 bg-line sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}

const PAYMENTS = [
  { id: "UPI", icon: QrCode, title: "UPI", text: "Google Pay, PhonePe, Paytm, BHIM" },
  { id: "CARD", icon: CreditCard, title: "Credit / Debit card", text: "Visa, Mastercard, RuPay, Amex" },
  { id: "NETBANKING", icon: Landmark, title: "Net banking", text: "All major Indian banks" },
  { id: "COD", icon: HandCoins, title: "Cash on delivery", text: "Pay in cash or UPI at your door" },
] as const;

export function CheckoutClient() {
  const router = useRouter();
  const { user, settings } = useStore();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const coupon = useCart((s) => s.coupon);
  const draft = useCheckout((s) => s.draft);
  const setDraft = useCheckout((s) => s.setDraft);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [address, setAddress] = useState<ShippingAddress>({ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [delivery, setDelivery] = useState<CheckoutDraft["deliveryOption"]>("standard");
  const [payment, setPayment] = useState<CheckoutDraft["paymentMethod"]>("UPI");
  const [saveAddress, setSaveAddress] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totals = useTotals(delivery, payment);

  useEffect(() => {
    if (draft) {
      setAddress(draft.address);
      setDelivery(draft.deliveryOption);
      setPayment(draft.paymentMethod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/account/addresses")
      .then((r) => (r.ok ? r.json() : { addresses: [] }))
      .then((d: { addresses: SavedAddress[] }) => {
        setSaved(d.addresses);
        const def = d.addresses.find((a) => a.isDefault) ?? d.addresses[0];
        if (def && !draft) setAddress({ ...def, email: user.email });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/cart");
  }, [hydrated, items.length, router]);

  function validate() {
    const e: Record<string, string> = {};
    if (address.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(address.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a valid 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(address.email)) e.email = "Enter a valid email";
    if (address.line1.trim().length < 4) e.line1 = "Enter your house / street address";
    if (!address.city.trim()) e.city = "Enter your city";
    if (!address.state) e.state = "Choose your state";
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Enter a 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function proceed(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setDraft({ address, deliveryOption: delivery, paymentMethod: payment, saveAddress: !!user && saveAddress });
    router.push("/payment");
  }

  const field = (key: keyof ShippingAddress, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label className="label" htmlFor={`f-${key}`}>
        {label}
      </label>
      <input id={`f-${key}`} {...props} className={cn("input", errors[key] && "border-brand")} value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} />
      {errors[key] && (
        <p data-error className="mt-1 text-xs font-medium text-brand">
          {errors[key]}
        </p>
      )}
    </div>
  );

  if (!hydrated || items.length === 0)
    return (
      <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_400px]">
        <div className="skeleton h-[480px]" />
        <div className="skeleton h-80" />
      </div>
    );

  return (
    <form onSubmit={proceed} className="container py-8 sm:py-12" noValidate>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="section-title">Checkout</h1>
        <Steps current={1} />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <AnimatedIcon icon={MapPin} size={20} className="text-brand" /> Shipping address
            </h2>
            {!user && (
              <p className="mt-2 text-sm text-ink-mute">
                Have an account?{" "}
                <Link href="/account/login?next=/checkout" className="font-semibold text-brand">
                  Sign in
                </Link>{" "}
                for faster checkout.
              </p>
            )}
            {saved.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {saved.map((a) => {
                  const on = a.line1 === address.line1 && a.pincode === address.pincode;
                  return (
                    <button type="button" key={a.id} onClick={() => setAddress({ ...a, email: user?.email ?? address.email })} className={cn("rounded-xl border p-3 text-left text-sm transition", on ? "border-ink bg-ivory" : "border-line hover:border-ink/30")}>
                      <span className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        {a.label} {on && <Check size={14} />}
                      </span>
                      <span className="mt-1 block text-ink-soft">
                        {a.line1}, {a.city} {a.pincode}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {field("name", "Full name", { autoComplete: "name", className: "sm:col-span-2" })}
              {field("phone", "Mobile number", { autoComplete: "tel", inputMode: "tel", placeholder: "10-digit mobile" })}
              {field("email", "Email", { autoComplete: "email", type: "email" })}
              {field("line1", "House no., building, street", { autoComplete: "address-line1", className: "sm:col-span-2" })}
              {field("line2", "Area, landmark (optional)", { autoComplete: "address-line2", className: "sm:col-span-2" })}
              {field("pincode", "Pincode", { inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
              {field("city", "City", { autoComplete: "address-level2" })}
              <div className="sm:col-span-2">
                <label className="label" htmlFor="f-state">
                  State
                </label>
                <select id="f-state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className={cn("input", errors.state && "border-brand")}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {errors.state && (
                  <p data-error className="mt-1 text-xs font-medium text-brand">
                    {errors.state}
                  </p>
                )}
              </div>
            </div>
            {user && (
              <label className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--brand))]" />
                Save this address to my account
              </label>
            )}
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <AnimatedIcon icon={Truck} size={20} className="text-brand" /> Delivery
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { id: "standard" as const, icon: Truck, title: "Standard delivery", text: "3–6 working days", price: totals.taxable >= settings.freeDeliveryAbove ? "Free" : formatINR(settings.deliveryCharge) },
                { id: "express" as const, icon: Zap, title: "Express delivery", text: "1–3 working days", price: formatINR(settings.expressCharge) },
              ].map((o) => (
                <button type="button" key={o.id} onClick={() => setDelivery(o.id)} className={cn("relative flex items-start gap-3 rounded-2xl border p-4 text-left transition", delivery === o.id ? "border-ink bg-ivory" : "border-line hover:border-ink/30")}>
                  {delivery === o.id && <motion.span layoutId="delivery-ring" className="absolute inset-0 rounded-2xl ring-2 ring-ink" />}
                  <AnimatedIcon icon={o.icon} size={20} className="mt-0.5 text-brand" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{o.title}</span>
                    <span className="text-xs text-ink-mute">{o.text}</span>
                  </span>
                  <span className="text-sm font-semibold">{o.price}</span>
                </button>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <AnimatedIcon icon={Lock} size={20} className="text-brand" /> Payment method
            </h2>
            <div className="mt-4 grid gap-3">
              {PAYMENTS.map((p) => (
                <button type="button" key={p.id} onClick={() => setPayment(p.id)} className={cn("relative flex items-center gap-4 rounded-2xl border p-4 text-left transition", payment === p.id ? "border-ink bg-ivory" : "border-line hover:border-ink/30")}>
                  {payment === p.id && <motion.span layoutId="pay-ring" className="absolute inset-0 rounded-2xl ring-2 ring-ink" />}
                  <span className={cn("rounded-xl p-2.5", payment === p.id ? "bg-brand text-white" : "bg-ivory-deep text-ink-soft")}>
                    <AnimatedIcon icon={p.icon} size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{p.title}</span>
                    <span className="text-xs text-ink-mute">{p.text}</span>
                  </span>
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border-2", payment === p.id ? "border-brand" : "border-line")}>
                    {payment === p.id && <motion.span layoutId="pay-dot" className="h-2.5 w-2.5 rounded-full bg-brand" />}
                  </span>
                </button>
              ))}
            </div>
          </motion.section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5 sm:p-6">
            <p className="label">Order summary</p>
            <ul className="mb-5 max-h-64 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-ivory-deep">
                    <SmartImage src={i.image} alt={i.name} fallbackKey={i.category} className="h-full w-full object-cover" />
                    <span className="absolute -right-0 -top-0 rounded-bl-lg bg-ink px-1.5 text-[10px] font-bold text-white">{i.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{i.name}</p>
                    <p className="text-xs text-ink-mute">
                      {i.size} · {i.color}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatINR(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line pt-4">
              <PriceSummary totals={totals} couponCode={coupon?.code} />
            </div>
            <motion.button whileTap={{ scale: 0.98 }} className="btn-primary mt-6 w-full py-4">
              <AnimatedIcon icon={Lock} size={16} /> {payment === "COD" ? "Place order" : `Pay ${formatINR(totals.total)}`}
            </motion.button>
            <Link href="/cart" className="mt-3 block text-center text-xs font-semibold text-ink-mute hover:text-ink">
              ← Back to bag
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
