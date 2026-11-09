"use client";
import { motion } from "framer-motion";

const COLORS = ["rgb(var(--brand))", "rgb(var(--accent))", "#1d6b4a", "#c98f8f", "#2f3e75"];

/** Animated check with a light confetti burst — shown when an order has just been placed. */
export function OrderSuccessHero({ celebrate }: { celebrate: boolean }) {
  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
      {celebrate &&
        Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          const dist = 70 + (i % 3) * 22;
          return (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-sm"
              style={{ background: COLORS[i % COLORS.length] }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
              animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 1, rotate: 180 }}
              transition={{ duration: 1.3, delay: 0.35, ease: "easeOut" }}
            />
          );
        })}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 14 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lift">
        <svg viewBox="0 0 24 24" width={44} height={44} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
        </svg>
      </motion.div>
    </div>
  );
}
