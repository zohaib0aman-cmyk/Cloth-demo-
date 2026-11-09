"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send, CircleCheck } from "lucide-react";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { useStore, whatsappLink } from "./StoreContext";
import { WhatsAppIcon } from "./WhatsAppButton";
import { brand } from "@/lib/brand";

export function ContactClient() {
  const { settings } = useStore();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  return (
    <div className="container grid gap-8 py-14 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        {[
          { icon: Phone, label: "Call us", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
          { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
          { icon: MapPin, label: "Studio", value: settings.address },
          { icon: Clock, label: "Hours", value: "Mon – Sat, 10 am – 7 pm IST" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="card flex items-start gap-4 p-5">
            <span className="rounded-full bg-brand/10 p-3 text-brand">
              <AnimatedIcon icon={c.icon} size={19} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="mt-0.5 block font-medium hover:text-brand">{c.value}</a>
              ) : (
                <p className="mt-0.5 font-medium">{c.value}</p>
              )}
            </div>
          </motion.div>
        ))}
        {settings.whatsapp && (
          <a href={whatsappLink(settings.whatsapp, `Hi ${brand.brandName}, I have a question.`)} target="_blank" rel="noopener noreferrer" className="btn w-full bg-[#25D366] py-4 text-white hover:-translate-y-0.5">
            <WhatsAppIcon size={20} /> Chat with us on WhatsApp
          </a>
        )}
      </div>
      <div className="card p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <CircleCheck size={48} className="text-emerald-600" strokeWidth={1.4} />
              <p className="mt-4 font-serif text-3xl font-semibold">Message received</p>
              <p className="mt-2 max-w-sm text-sm text-ink-mute">Thank you, {form.name.split(" ")[0] || "friend"}. Our team usually replies within a few hours on working days.</p>
            </motion.div>
          ) : (
            <motion.form key="form" exit={{ opacity: 0 }} onSubmit={(e) => (e.preventDefault(), setSent(true))} className="space-y-4">
              <h2 className="text-3xl font-semibold">Write to us</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">Name</label>
                  <input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="c-email">Email</label>
                  <input id="c-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="c-msg">Message</label>
                <textarea id="c-msg" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input" />
              </div>
              <button className="btn-primary w-full py-3.5">
                <AnimatedIcon icon={Send} size={16} /> Send message
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
