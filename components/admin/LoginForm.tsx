"use client";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Lock, Mail } from "lucide-react";
import { adminLogin } from "@/app/admin/actions";
import { AnimatedIcon } from "../motion/AnimatedIcon";

export function AdminLoginForm({ demo }: { demo: { email: string; password: string } }) {
  const [state, action, pending] = useActionState(adminLogin, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="ae">Email</label>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input id="ae" name="email" type="email" defaultValue={demo.email} required className="input pl-11" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ap">Password</label>
        <div className="relative">
          <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input id="ap" name="password" type="password" defaultValue={demo.password} required className="input pl-11" />
        </div>
      </div>
      {state?.error && <motion.p initial={{ x: -8 }} animate={{ x: 0 }} className="text-sm font-medium text-brand">{state.error}</motion.p>}
      <button disabled={pending} className="btn-primary w-full py-3.5">
        {pending ? "Signing in…" : "Sign in to admin"}
      </button>
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-accent/50 bg-accent/5 p-3 text-xs">
        <AnimatedIcon icon={KeyRound} size={16} className="mt-0.5 text-accent" />
        <div>
          <p className="font-semibold text-ink">Demo login</p>
          <p className="text-ink-mute">
            Email: <span className="font-mono text-ink">{demo.email}</span>
            <br />
            Password: <span className="font-mono text-ink">{demo.password}</span>
          </p>
        </div>
      </div>
    </form>
  );
}
