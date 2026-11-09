import type { CouponDTO } from "./types";

export function salePriceOf(price: number, discount: number): number {
  return Math.round((price * (100 - Math.min(Math.max(discount, 0), 95))) / 100);
}

export function couponDiscount(coupon: CouponDTO | null | undefined, subtotal: number): { amount: number; error?: string } {
  if (!coupon) return { amount: 0 };
  if (subtotal < coupon.minOrder) {
    return { amount: 0, error: `Add items worth ₹${(coupon.minOrder - subtotal).toLocaleString("en-IN")} more to use ${coupon.code}` };
  }
  let amount = coupon.type === "PERCENT" ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount > 0) amount = Math.min(amount, coupon.maxDiscount);
  return { amount: Math.min(amount, subtotal) };
}

export type TotalsInput = {
  lines: { price: number; qty: number }[];
  coupon?: CouponDTO | null;
  gstPercent: number;
  deliveryCharge: number;
  expressCharge: number;
  freeDeliveryAbove: number;
  codCharge: number;
  deliveryOption?: "standard" | "express";
  paymentMethod?: string;
};

export type Totals = {
  subtotal: number;
  discount: number;
  taxable: number;
  gst: number;
  delivery: number;
  total: number;
  itemCount: number;
  couponError?: string;
  freeDeliveryGap: number;
};

export function computeTotals(input: TotalsInput): Totals {
  const subtotal = input.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const itemCount = input.lines.reduce((s, l) => s + l.qty, 0);
  const { amount: discount, error } = couponDiscount(input.coupon, subtotal);
  const taxable = subtotal - discount;
  const gst = Math.round((taxable * input.gstPercent) / 100);
  let delivery = 0;
  if (itemCount > 0) {
    if (input.deliveryOption === "express") delivery = input.expressCharge;
    else delivery = taxable >= input.freeDeliveryAbove ? 0 : input.deliveryCharge;
    if (input.paymentMethod === "COD") delivery += input.codCharge;
  }
  return {
    subtotal,
    discount,
    taxable,
    gst,
    delivery,
    total: taxable + gst + delivery,
    itemCount,
    couponError: error,
    freeDeliveryGap: Math.max(0, input.freeDeliveryAbove - taxable),
  };
}
