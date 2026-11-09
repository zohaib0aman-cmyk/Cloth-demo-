"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { useStore } from "./StoreContext";

export function AnnouncementBar() {
  const { settings } = useStore();
  if (!settings.announcementOn || !settings.announcement) return null;
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden bg-ink text-ivory">
      <div className="container flex items-center justify-center gap-2 py-2 text-center text-[11px] font-medium tracking-[0.14em] sm:text-xs">
        <AnimatedIcon icon={Sparkles} size={13} className="text-accent" />
        <span className="uppercase">{settings.announcement}</span>
      </div>
    </motion.div>
  );
}
