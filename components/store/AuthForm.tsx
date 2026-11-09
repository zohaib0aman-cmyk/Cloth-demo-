"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Lock, Mail, Phone, User as UserIcon, Sparkles } from "lucide-react";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { BrandLogo } from "../BrandLogo";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/format";

export function AuthForm({ next = "/account", demo }: { next?: string; demo: { email: string; password: string } }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    router.replace(next.startsWith("/") ? next : "/account");
    router.refresh();
  }

  const input = (key: keyof typeof form, label: string, icon: typeof Mail, type = "text") => (
    <div>
      <label className="label" htmlFor={`a-${key}`}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute">
          <AnimatedIcon icon={icon} size={16} />
        </span>
        <input id={`a-${key}`} type={type} required={key !== "phone"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input pl-11" autoComplete={key === "password" ? (mode === "login" ? "current-password" : "new-password") : key} />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto w-full max-w-md p-6 sm:p-8">
      <div className="text-center">
        <BrandLogo size="lg" />
        <h1 className="mt-4 text-3xl font-semibold">{mode === "login" ? "Welcome back" : `Join ${brand.brandName}`}</h1>
        <p className="mt-1 text-sm text-ink-mute">{mode === "login" ? "Sign in to track orders and checkout faster." : "Create an account to save addresses and your wishlist."}</p>
      </div>
      <div className="mt-6 flex rounded-full bg-ivory-deep p-1 text-sm font-semibold">
        {(["login", "signup"] as const).map((m) => (
          <button key={m} type="button" onClick={() => (setMode(m), setError(""))} className={cn("relative flex-1 rounded-full py-2.5", mode === m ? "text-ink" : "text-ink-mute")}>
            {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-white shadow" />}
            <span className="relative">{m === "login" ? "Sign in" : "Create account"}</span>
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <AnimatePresence initial={false}>
          {mode === "signup" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              {input("name", "Full name", UserIcon)}
              {input("phone", "Mobile (optional)", Phone, "tel")}
            </motion.div>
          )}
        </AnimatePresence>
        {input("email", "Email", Mail, "email")}
        {input("password", "Password", Lock, "password")}
        {error && <motion.p initial={{ x: -8 }} animate={{ x: 0 }} className="text-sm font-medium text-brand">{error}</motion.p>}
        <button disabled={busy} className="btn-primary w-full py-3.5">
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      {mode === "login" && (
        <button
          type="button"
          onClick={() => setForm({ ...form, email: demo.email, password: demo.password })}
          className="mt-5 flex w-full items-center gap-3 rounded-xl border border-dashed border-accent/50 bg-accent/5 p-3 text-left text-xs"
        >
          <AnimatedIcon icon={Sparkles} size={16} className="text-accent" />
          <span>
            <b className="block text-ink">Demo customer login (tap to fill)</b>
            <span className="text-ink-mute">
              {demo.email} · {demo.password}
            </span>
          </span>
        </button>
      )}
    </motion.div>
  );
}
