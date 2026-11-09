"use client";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Flight = { id: number; src: string; from: DOMRect; to: DOMRect };
const FlyCtx = createContext<(src: string, from: HTMLElement | null) => void>(() => {});

export function useFlyToCart() {
  return useContext(FlyCtx);
}

/** Renders a thumbnail that arcs from the product image into the cart icon. */
export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [flights, setFlights] = useState<Flight[]>([]);

  const fly = useCallback((src: string, fromEl: HTMLElement | null) => {
    if (typeof window === "undefined" || !fromEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
    const target = targets.find((el) => el.offsetParent !== null) ?? targets[0];
    if (!target) return;
    setFlights((f) => [...f, { id: Date.now() + Math.random(), src, from: fromEl.getBoundingClientRect(), to: target.getBoundingClientRect() }]);
  }, []);

  return (
    <FlyCtx.Provider value={fly}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[100]">
        <AnimatePresence>
          {flights.map((f) => {
            const size = Math.min(f.from.width, f.from.height, 160);
            const startX = f.from.left + f.from.width / 2 - size / 2;
            const startY = f.from.top + f.from.height / 2 - size / 2;
            const endX = f.to.left + f.to.width / 2 - size / 2;
            const endY = f.to.top + f.to.height / 2 - size / 2;
            return (
              <motion.img
                key={f.id}
                src={f.src}
                alt=""
                className="absolute rounded-2xl object-cover shadow-lift"
                style={{ width: size, height: size, left: 0, top: 0 }}
                initial={{ x: startX, y: startY, scale: 1, opacity: 0.95 }}
                animate={{ x: [startX, (startX + endX) / 2, endX], y: [startY, Math.min(startY, endY) - 120, endY], scale: [1, 0.6, 0.12], opacity: [0.95, 0.9, 0.4] }}
                transition={{ duration: 0.85, ease: [0.5, 0, 0.3, 1] }}
                onAnimationComplete={() => setFlights((all) => all.filter((x) => x.id !== f.id))}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </FlyCtx.Provider>
  );
}
