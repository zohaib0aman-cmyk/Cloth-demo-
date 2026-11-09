"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Check, Megaphone, Palette, Phone, Plus, Receipt, Save, Share2, Image as ImageIcon, Trash2, Truck } from "lucide-react";
import { saveSettings, type SettingsInput } from "@/app/admin/actions";
import { SingleImageField } from "./ImageUploader";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { cn } from "@/lib/format";
import type { Banner } from "@/lib/types";

const PRESETS = [
  ["Maroon & gold", "#7a2232", "#b8893b"],
  ["Indigo & saffron", "#2f3e75", "#d98b2b"],
  ["Emerald & brass", "#1d5c45", "#b08d3c"],
  ["Charcoal & rose", "#2b2b2b", "#c98f8f"],
  ["Plum & peach", "#5b2a4d", "#e09f7d"],
];

function Section({ icon, title, children }: { icon: typeof Palette; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
        <AnimatedIcon icon={icon} size={19} className="text-brand" /> {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingsForm({ initial, emailPlaceholder }: { initial: SettingsInput; emailPlaceholder: string }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) => setS((x) => ({ ...x, [k]: v }));
  const setBanner = (i: number, patch: Partial<Banner>) => set("banners", s.banners.map((b, k) => (k === i ? { ...b, ...patch } : b)));

  const text = (k: keyof SettingsInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label className="label" htmlFor={`st-${k}`}>{label}</label>
      <input id={`st-${k}`} {...props} className="input" value={String(s[k] ?? "")} onChange={(e) => set(k, (props.type === "number" ? Number(e.target.value) : e.target.value) as never)} />
    </div>
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await saveSettings(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      <div className="grid gap-6 xl:grid-cols-2">
        <Section icon={Palette} title="Theme colours">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(([name, p, a]) => (
              <button type="button" key={name} onClick={() => setS({ ...s, primaryColor: p, accentColor: a })} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", s.primaryColor === p ? "border-ink" : "border-line")}>
                <span className="flex">
                  <span className="h-4 w-4 rounded-full" style={{ background: p }} />
                  <span className="-ml-1 h-4 w-4 rounded-full ring-2 ring-white" style={{ background: a }} />
                </span>
                {name}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {(["primaryColor", "accentColor"] as const).map((k) => (
              <div key={k}>
                <label className="label" htmlFor={`st-${k}`}>{k === "primaryColor" ? "Primary" : "Accent"}</label>
                <div className="flex gap-2">
                  <input type="color" value={s[k]} onChange={(e) => set(k, e.target.value)} className="h-12 w-14 cursor-pointer rounded-xl border border-line bg-white p-1" aria-label={`${k} picker`} />
                  <input id={`st-${k}`} value={s[k]} onChange={(e) => set(k, e.target.value)} className="input font-mono" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl p-4" style={{ background: `${s.primaryColor}12` }}>
            <span className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: s.primaryColor }}>Primary button</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: s.accentColor }}>Accent text</span>
          </div>
        </Section>

        <Section icon={Megaphone} title="Announcement bar">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={s.announcementOn} onChange={(e) => set("announcementOn", e.target.checked)} className="h-4 w-4 accent-[rgb(var(--brand))]" /> Show announcement bar
          </label>
          {text("announcement", "Message")}
          <div className="mt-4 overflow-hidden rounded-xl bg-ink px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-ivory">{s.announcement || "Your message here"}</div>
        </Section>
      </div>

      <Section icon={ImageIcon} title="Home page banners">
        <div className="grid gap-4 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {s.banners.map((b, i) => (
              <motion.div key={i} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="space-y-3 rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">Slide {i + 1}</span>
                  <button type="button" onClick={() => set("banners", s.banners.filter((_, k) => k !== i))} className="rounded-full p-1.5 text-ink-mute hover:bg-red-50 hover:text-red-700" aria-label="Remove slide"><Trash2 size={14} /></button>
                </div>
                <SingleImageField value={b.image} onChange={(v) => setBanner(i, { image: v })} label="Background image" />
                <input value={b.eyebrow} onChange={(e) => setBanner(i, { eyebrow: e.target.value })} placeholder="Small heading" className="input py-2 text-sm" aria-label="Small heading" />
                <input value={b.title} onChange={(e) => setBanner(i, { title: e.target.value })} placeholder="Headline" className="input py-2 text-sm" aria-label="Headline" />
                <textarea value={b.subtitle} onChange={(e) => setBanner(i, { subtitle: e.target.value })} placeholder="Supporting text" rows={2} className="input py-2 text-sm" aria-label="Supporting text" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={b.cta} onChange={(e) => setBanner(i, { cta: e.target.value })} placeholder="Button text" className="input py-2 text-sm" aria-label="Button text" />
                  <input value={b.link} onChange={(e) => setBanner(i, { link: e.target.value })} placeholder="/shop" className="input py-2 text-sm" aria-label="Button link" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {s.banners.length < 5 && (
            <button type="button" onClick={() => set("banners", [...s.banners, { eyebrow: "New season", title: "", subtitle: "", image: "", cta: "Shop now", link: "/shop" }])} className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-ink-mute hover:border-ink/30">
              <Plus size={20} /> Add slide
            </button>
          )}
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section icon={Truck} title="Delivery charges">
          <div className="grid grid-cols-2 gap-4">
            {text("deliveryCharge", "Standard (₹)", { type: "number", min: 0 })}
            {text("freeDeliveryAbove", "Free above (₹)", { type: "number", min: 0 })}
            {text("expressCharge", "Express (₹)", { type: "number", min: 0 })}
            {text("codCharge", "COD fee (₹)", { type: "number", min: 0 })}
          </div>
        </Section>
        <Section icon={Receipt} title="Tax">
          {text("gstPercent", "GST percentage", { type: "number", min: 0, max: 28 })}
          <p className="mt-2 text-xs text-ink-mute">Added on the discounted subtotal at checkout and split into CGST + SGST on the bill.</p>
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section icon={Phone} title="Contact details">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("phone", "Phone")}
            {text("whatsapp", "WhatsApp number (with country code)", { placeholder: "919876543210" })}
            {text("email", "Email", { type: "email", placeholder: emailPlaceholder, className: "sm:col-span-2" })}
            {text("address", "Address", { className: "sm:col-span-2" })}
          </div>
        </Section>
        <Section icon={Share2} title="Social links">
          <div className="grid gap-4">
            {text("instagram", "Instagram URL")}
            {text("facebook", "Facebook URL")}
            {text("youtube", "YouTube URL")}
            {text("pinterest", "Pinterest URL")}
          </div>
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 lg:px-6">
          <AnimatePresence>{saved && <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-emerald-700">Saved — your store is updated</motion.span>}</AnimatePresence>
          <button disabled={pending} className={cn("btn-primary px-8", saved && "!bg-emerald-700")}>
            {saved ? <Check size={16} /> : <Save size={16} />} {pending ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </form>
  );
}
