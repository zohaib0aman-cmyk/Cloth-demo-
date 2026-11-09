"use client";
import { createContext, useContext, type ReactNode } from "react";
import { defaultResolvedBrand, type ResolvedBrand } from "@/lib/brand";

const Ctx = createContext<ResolvedBrand>(defaultResolvedBrand());

export function BrandProvider({ value, children }: { value: ResolvedBrand; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The brand for this visitor: the lead's details when opened with a tracking ID, otherwise brand.json. */
export function useBrand() {
  return useContext(Ctx);
}
