"use client";
import { motion } from "framer-motion";
import { brand } from "@/lib/brand";
import { useStore, whatsappLink } from "./StoreContext";

export function WhatsAppIcon({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M16.04 3C8.86 3 3.04 8.82 3.04 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.94 12.94 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.64c-1.97 0-3.9-.53-5.58-1.53l-.4-.24-3.96 1.04 1.06-3.86-.26-.4a10.6 10.6 0 0 1-1.63-5.65c0-5.87 4.78-10.64 10.66-10.64 5.86 0 10.63 4.77 10.63 10.64 0 5.87-4.77 10.64-10.52 10.64Zm5.84-7.96c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.21-.18-.32-.02-.5.14-.65.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.2 2.25 3.43 5.44 4.81.76.33 1.35.52 1.82.67.76.24 1.46.2 2 .12.62-.09 1.89-.77 2.16-1.52.26-.74.26-1.38.18-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const { settings } = useStore();
  if (!settings.whatsapp) return null;
  return (
    <motion.a
      href={whatsappLink(settings.whatsapp, `Hi ${brand.brandName}! I'd like to place an order.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lift sm:bottom-6 sm:right-6 sm:pr-5"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.4, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.6s]" />
      <WhatsAppIcon />
      <span className="hidden text-sm font-semibold sm:inline">Order on WhatsApp</span>
    </motion.a>
  );
}
