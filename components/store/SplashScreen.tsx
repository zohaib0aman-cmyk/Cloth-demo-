"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";

/** Branded loading screen with the logo, shown once per browser session. */
export function SplashScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("splash-seen") === "1";
      sessionStorage.setItem("splash-seen", "1");
    } catch {}
    const t = setTimeout(() => setShow(false), seen ? 0 : 1300);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ivory"
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <motion.img
            src={brand.logoUrl}
            alt={brand.brandName}
            className="h-24 w-auto max-w-[240px] object-contain p-1"
            initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.p
            className="mt-5 font-serif text-2xl font-semibold tracking-tight text-ink"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {brand.brandName}
          </motion.p>
          <div className="mt-6 h-[2px] w-32 overflow-hidden rounded-full bg-line">
            <motion.div className="h-full bg-brand" initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 1.1, ease: "easeInOut" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
