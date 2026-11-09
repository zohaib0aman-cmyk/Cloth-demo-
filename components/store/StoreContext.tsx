"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { StoreSettings } from "@/lib/types";

export type NavCategory = { name: string; slug: string; image: string };
export type NavCollection = { name: string; slug: string; image: string; tagline: string };
export type SessionUser = { id: string; name: string; email: string; phone: string } | null;

type Ctx = { settings: StoreSettings; categories: NavCategory[]; collections: NavCollection[]; user: SessionUser };

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ value, children }: { value: Ctx; children: ReactNode }) {
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
