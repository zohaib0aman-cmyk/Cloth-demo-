"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CreditCard, HandCoins, Landmark, Lock, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { useCart, useCheckout, useHydrated } from "@/lib/store/cart";
import { useTotals } from "./useTotals";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { BrandLogo } from "../BrandLogo";
import { useBrand } from "@/components/BrandContext";
import { cn, formatINR } from "@/lib/format";
import { PAYMENT_LABEL } from "@/lib/types";

function FakeQR({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const out: boolean[] = [];
    for (let i = 0; i < 625; i++) {
      h = (h * 1103515245 + 12345) >>> 0;
      out.push(((h >> 16) & 3) === 0 || ((h >> 9) & 1) === 1);
    }
    return out;
  }, [seed]);
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="#1d1a17" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#1d1a17" />
    </g>
  );
  const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
  return (
    <svg viewBox="0 0 25 25" className="h-full w-full" shapeRendering="crispEdges" aria-label="UPI QR code">
      <rect width={25} height={25} fill="#fff" />
      {cells.map((on, i) => {
        const x = i % 25;
        const y = Math.floor(i / 25);
        return on && !inFinder(x, y) ? <rect key={i} x={x} y={y} width={1} height={1} fill="#1d1a17" /> : null;
      })}
      {finder(0, 0)}
      {finder(18, 0)}
      {finder(0, 18)}
    </svg>
  );
}

const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "Yes Bank"];
const STAGES = ["Connecting securely", "Authorising payment", "Confirming with bank", "Placing your order"];

export function PaymentGateway() {
  const brand = useBrand();
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const coupon = useCart((s) => s.coupon);
  const clearCart = useCart((s) => s.clear);
  const draft = useCheckout((s) => s.draft);
  const setDraft = useCheckout((s) => s.setDraft);
  const totals = useTotals(draft?.deliveryOption, draft?.paymentMethod);
  const method = draft?.paymentMethod ?? "UPI";
  const [upiMode, setUpiMode] = useState<"qr" | "id">("qr");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [bank, setBank] = useState("");
  const [phase, setPhase] = useState<"form" | "processing" | "success" | "error">("form");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && phase === "form" && (!draft || items.length === 0)) router.replace(items.length ? "/checkout" : "/cart");
  }, [hydrated, draft, items.length, phase, router]);

  const ready =
    method === "COD" ||
    (method === "UPI" && (upiMode === "qr" || /^[\w.-]{2,}@[a-z]{2,}$/i.test(upiId))) ||
    (method === "CARD" && card.number.replace(/\s/g, "").length >= 15 && card.name.length > 1 && /^\d\d\/\d\d$/.test(card.expiry) && card.cvv.length >= 3) ||
    (method === "NETBANKING" && !!bank);

  function fillDemo() {
    if (method === "UPI") {
      setUpiMode("id");
      setUpiId("demo.customer@okbank");
    }
    if (method === "CARD") setCard({ number: "4111 1111 1111 1111", name: draft?.address.name || "Demo Customer", expiry: "12/29", cvv: "123" });
    if (method === "NETBANKING") setBank(BANKS[1]);
  }

  async function pay() {
    if (!draft) return;
    setPhase("processing");
    setStage(0);
    const timers = STAGES.map((_, i) => setTimeout(() => setStage(i), i * 750));
    const started = Date.now();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, qty: i.qty })),
          address: draft.address,
          deliveryOption: draft.deliveryOption,
          paymentMethod: draft.paymentMethod,
          couponCode: coupon?.code ?? null,
          saveAddress: draft.saveAddress,
          paymentDetail: method === "CARD" ? `Card ending ${card.number.replace(/\s/g, "").slice(-4)}` : method === "NETBANKING" ? bank : method === "UPI" ? upiId || "UPI QR" : "Cash on delivery",
        }),
      });
      const data = await res.json();
      await new Promise((r) => setTimeout(r, Math.max(0, 3000 - (Date.now() - started))));
      if (!res.ok) throw new Error(data.error ?? "Payment could not be completed");
      setPhase("success");
      setTimeout(() => {
        clearCart();
        setDraft(null);
        router.replace(`/order/${data.orderNumber}?placed=1`);
      }, 1600);
    } catch (e) {
      timers.forEach(clearTimeout);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
    }
  }

  if (!hydrated || !draft) return <div className="flex min-h-[70vh] items-center justify-center"><div className="skeleton h-[520px] w-full max-w-3xl" /></div>;

  const cardBrand = card.number.startsWith("4") ? "VISA" : card.number.startsWith("5") ? "MASTERCARD" : card.number.startsWith("6") ? "RUPAY" : card.number.startsWith("3") ? "AMEX" : "";

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-ivory to-ivory-deep px-3 py-8 sm:px-4 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-lift">
        <div className="grid md:grid-cols-[260px_1fr]">
          <div className="relative overflow-hidden bg-ink p-6 text-ivory">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/40 blur-3xl" />
            <div className="relative">
              <div className="inline-flex rounded-xl bg-ivory p-2">
                <BrandLogo size="sm" />
              </div>
              <p className="mt-4 text-sm text-ivory/60">Paying</p>
              <p className="font-serif text-2xl font-semibold">{brand.brandName}</p>
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ivory/50">Amount</p>
              <p className="font-serif text-4xl font-semibold">{formatINR(totals.total)}</p>
              <p className="mt-1 text-xs text-ivory/50">{totals.itemCount} items · incl. GST & delivery</p>
              <div className="mt-8 space-y-2 border-t border-ivory/10 pt-5 text-xs text-ivory/70">
                <p className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-accent" /> 256-bit encrypted
                </p>
                <p className="flex items-center gap-2">
                  <Lock size={14} className="text-accent" /> PCI-DSS style secure flow
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[460px] p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {phase === "form" && (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center justify-between">
                    <button onClick={() => router.push("/checkout")} className="flex items-center gap-1 text-xs font-semibold text-ink-mute hover:text-ink">
                      <ArrowLeft size={14} /> Change method
                    </button>
                    <span className="rounded-full bg-ivory-deep px-3 py-1 text-[11px] font-semibold">{PAYMENT_LABEL[method]}</span>
                  </div>

                  {method === "UPI" && (
                    <div className="mt-6">
                      <div className="flex rounded-full bg-ivory-deep p-1 text-sm font-semibold">
                        {(["qr", "id"] as const).map((m) => (
                          <button key={m} onClick={() => setUpiMode(m)} className={cn("relative flex-1 rounded-full py-2", upiMode === m ? "text-ink" : "text-ink-mute")}>
                            {upiMode === m && <motion.span layoutId="upi-tab" className="absolute inset-0 rounded-full bg-white shadow" />}
                            <span className="relative inline-flex items-center gap-2">
                              {m === "qr" ? <QrCode size={15} /> : <Smartphone size={15} />} {m === "qr" ? "Scan QR" : "UPI ID"}
                            </span>
                          </button>
                        ))}
                      </div>
                      {upiMode === "qr" ? (
                        <div className="mt-6 flex flex-col items-center">
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative h-44 w-44 rounded-2xl border border-line p-3">
                            <FakeQR seed={`${brand.brandName}${totals.total}`} />
                            <motion.span className="absolute inset-x-3 h-0.5 bg-brand/70 shadow-[0_0_12px_rgb(var(--brand))]" animate={{ top: ["12%", "88%", "12%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
                          </motion.div>
                          <p className="mt-4 text-center text-sm text-ink-soft">Scan with any UPI app, then tap the button below</p>
                          <div className="mt-3 flex gap-2 text-[11px] font-semibold text-ink-mute">
                            {["GPay", "PhonePe", "Paytm", "BHIM"].map((a) => (
                              <span key={a} className="rounded-full border border-line px-2.5 py-1">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6">
                          <label className="label" htmlFor="upi">
                            Your UPI ID
                          </label>
                          <input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value.trim())} placeholder="yourname@okbank" className="input" />
                          <p className="mt-2 text-xs text-ink-mute">A collect request will be sent to your UPI app.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {method === "CARD" && (
                    <div className="mt-6">
                      <motion.div layout className="relative mb-5 h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink to-brand p-5 text-ivory shadow-soft">
                        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                        <div className="flex justify-between">
                          <span className="h-7 w-10 rounded-md bg-gradient-to-br from-accent to-yellow-200/70" />
                          <span className="text-xs font-bold tracking-widest">{cardBrand}</span>
                        </div>
                        <p className="mt-6 font-mono text-lg tracking-[0.18em]">{card.number || "•••• •••• •••• ••••"}</p>
                        <div className="mt-3 flex justify-between text-[11px] uppercase tracking-wider text-ivory/70">
                          <span className="truncate">{card.name || "Card holder"}</span>
                          <span>{card.expiry || "MM/YY"}</span>
                        </div>
                      </motion.div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="label" htmlFor="cn">Card number</label>
                          <input
                            id="cn"
                            inputMode="numeric"
                            value={card.number}
                            onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })}
                            placeholder="1234 5678 9012 3456"
                            className="input font-mono"
                            autoComplete="cc-number"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="label" htmlFor="ch">Name on card</label>
                          <input id="ch" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="input" autoComplete="cc-name" />
                        </div>
                        <div>
                          <label className="label" htmlFor="ce">Expiry</label>
                          <input
                            id="ce"
                            inputMode="numeric"
                            value={card.expiry}
                            onChange={(e) => {
                              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                            }}
                            placeholder="MM/YY"
                            className="input font-mono"
                            autoComplete="cc-exp"
                          />
                        </div>
                        <div>
                          <label className="label" htmlFor="cv">CVV</label>
                          <input id="cv" inputMode="numeric" type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="•••" className="input font-mono" autoComplete="cc-csc" />
                        </div>
                      </div>
                    </div>
                  )}

                  {method === "NETBANKING" && (
                    <div className="mt-6">
                      <p className="label">Choose your bank</p>
                      <div className="grid grid-cols-2 gap-2">
                        {BANKS.map((b) => (
                          <button key={b} onClick={() => setBank(b)} className={cn("flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition", bank === b ? "border-ink bg-ivory" : "border-line hover:border-ink/30")}>
                            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", bank === b ? "bg-brand text-white" : "bg-ivory-deep text-ink-soft")}>
                              {b.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </span>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {method === "COD" && (
                    <div className="mt-8 flex flex-col items-center text-center">
                      <span className="rounded-full bg-brand/10 p-5 text-brand">
                        <HandCoins size={34} strokeWidth={1.4} />
                      </span>
                      <p className="mt-4 font-serif text-2xl font-semibold">Pay on delivery</p>
                      <p className="mt-2 max-w-xs text-sm text-ink-mute">
                        Keep {formatINR(totals.total)} ready in cash, or pay by UPI to the delivery partner when your parcel arrives.
                      </p>
                    </div>
                  )}

                  {method !== "COD" && (
                    <button onClick={fillDemo} className="mt-4 text-xs font-semibold text-brand underline-offset-4 hover:underline">
                      Fill demo details
                    </button>
                  )}

                  <motion.button whileTap={{ scale: 0.98 }} disabled={!ready} onClick={pay} className="btn-primary mt-6 w-full py-4">
                    {method === "COD" ? <AnimatedIcon icon={Check} size={17} /> : method === "CARD" ? <AnimatedIcon icon={CreditCard} size={17} /> : method === "NETBANKING" ? <AnimatedIcon icon={Landmark} size={17} /> : <AnimatedIcon icon={QrCode} size={17} />}
                    {method === "COD" ? "Confirm order" : method === "UPI" && upiMode === "qr" ? "I have paid" : `Pay ${formatINR(totals.total)}`}
                  </motion.button>
                  <p className="mt-3 text-center text-[11px] text-ink-mute">Demo gateway · no real money is charged</p>
                </motion.div>
              )}

              {phase === "processing" && (
                <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="relative h-24 w-24">
                    <motion.span className="absolute inset-0 rounded-full border-4 border-line" />
                    <motion.span className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand" animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} />
                    <span className="absolute inset-0 flex items-center justify-center text-brand">
                      <Lock size={26} />
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-6 font-serif text-2xl font-semibold">
                      {STAGES[stage]}…
                    </motion.p>
                  </AnimatePresence>
                  <p className="mt-2 text-sm text-ink-mute">Please don&apos;t close or refresh this page</p>
                  <div className="mt-6 flex gap-1.5">
                    {STAGES.map((_, i) => (
                      <span key={i} className={cn("h-1.5 w-8 rounded-full transition-colors duration-500", i <= stage ? "bg-brand" : "bg-line")} />
                    ))}
                  </div>
                </motion.div>
              )}

              {phase === "success" && (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lift">
                    <svg viewBox="0 0 24 24" width={46} height={46} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
                    </svg>
                  </motion.div>
                  <p className="mt-6 font-serif text-3xl font-semibold">{method === "COD" ? "Order confirmed" : "Payment successful"}</p>
                  <p className="mt-2 text-sm text-ink-mute">Taking you to your order…</p>
                </motion.div>
              )}

              {phase === "error" && (
                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                  <p className="font-serif text-3xl font-semibold text-brand">Payment not completed</p>
                  <p className="mt-2 max-w-sm text-sm text-ink-mute">{error}</p>
                  <div className="mt-6 flex gap-2">
                    <button onClick={() => setPhase("form")} className="btn-primary">
                      Try again
                    </button>
                    <button onClick={() => router.push("/cart")} className="btn-outline">
                      Back to bag
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
