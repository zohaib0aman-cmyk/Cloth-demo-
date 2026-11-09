"use client";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { ZYNTRA_DEMO_NOTICE } from "@/lib/brand";
import { AnimatedIcon } from "../motion/AnimatedIcon";

/** Clear, tasteful demo notice shown after payment. */
export function DemoNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      role="note"
      className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/10 to-transparent p-4 sm:items-center sm:p-5"
    >
      <span className="rounded-full bg-accent/20 p-2 text-accent">
        <AnimatedIcon icon={Info} size={18} delay={1} />
      </span>
      <p className="text-sm font-medium leading-relaxed text-ink">{ZYNTRA_DEMO_NOTICE}</p>
    </motion.div>
  );
}
