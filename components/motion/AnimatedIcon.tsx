"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

type Props = {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Delay for the entry fade, in seconds. */
  delay?: number;
  fill?: string;
};

/** Every icon in the site goes through this wrapper: entry fade, hover lift, tap bounce. */
export function AnimatedIcon({ icon: Icon, size = 20, className, strokeWidth = 1.6, delay = 0, fill }: Props) {
  return (
    <motion.span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22, delay }}
      whileHover={{ y: -2, scale: 1.08 }}
      whileTap={{ scale: 0.82 }}
      aria-hidden
    >
      <Icon size={size} strokeWidth={strokeWidth} fill={fill ?? "none"} />
    </motion.span>
  );
}

/** Same animation for server components: pass the rendered icon as children, e.g. <MotionIcon><Truck size={18} /></MotionIcon>. */
export function MotionIcon({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22, delay }}
      whileHover={{ y: -2, scale: 1.08 }}
      whileTap={{ scale: 0.82 }}
      aria-hidden
    >
      {children}
    </motion.span>
  );
}
