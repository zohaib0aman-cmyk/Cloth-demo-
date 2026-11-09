"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CouponDTO, ShippingAddress } from "../types";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  size: string;
  color: string;
  price: number;
  mrp: number;
  qty: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  coupon: CouponDTO | null;
  drawerOpen: boolean;
  bump: number;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCoupon: (c: CouponDTO | null) => void;
  openDrawer: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      drawerOpen: false,
      bump: 0,
      add: (item, qty = 1) =>
        set((s) => {
          const key = `${item.productId}|${item.size}|${item.color}`;
          const existing = s.items.find((i) => i.key === key);
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, Math.max(1, item.stock)) } : i))
            : [...s.items, { ...item, key, qty: Math.min(qty, Math.max(1, item.stock)) }];
          return { items, bump: s.bump + 1 };
        }),
      setQty: (key, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, Math.max(1, i.stock))) } : i)) })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      openDrawer: (drawerOpen) => set({ drawerOpen }),
    }),
    {
      name: "demo-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, coupon: s.coupon }),
    },
  ),
);

type WishState = { ids: string[]; toggle: (id: string) => void; has: (id: string) => boolean };

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [id, ...s.ids] })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "demo-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);

export type CheckoutDraft = {
  address: ShippingAddress;
  deliveryOption: "standard" | "express";
  paymentMethod: "UPI" | "CARD" | "NETBANKING" | "COD";
  saveAddress: boolean;
};

type CheckoutState = {
  draft: CheckoutDraft | null;
  setDraft: (d: CheckoutDraft | null) => void;
};

export const useCheckout = create<CheckoutState>()(
  persist((set) => ({ draft: null, setDraft: (draft) => set({ draft }) }), {
    name: "demo-checkout",
    storage: createJSONStorage(() => sessionStorage),
  }),
);

/** True once the persisted stores have loaded on the client (avoids hydration mismatch). */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
