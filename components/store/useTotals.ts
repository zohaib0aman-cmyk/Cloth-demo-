"use client";
import { computeTotals } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { useStore } from "./StoreContext";

export function useTotals(deliveryOption: "standard" | "express" = "standard", paymentMethod?: string) {
  const { settings } = useStore();
  const items = useCart((s) => s.items);
  const coupon = useCart((s) => s.coupon);
  return computeTotals({
    lines: items,
    coupon,
    gstPercent: settings.gstPercent,
    deliveryCharge: settings.deliveryCharge,
    expressCharge: settings.expressCharge,
    freeDeliveryAbove: settings.freeDeliveryAbove,
    codCharge: settings.codCharge,
    deliveryOption,
    paymentMethod,
  });
}
