import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { slugOf } from "./brand";
import { getBrand } from "./brand-server";
import { safeJSON } from "./format";
import type { Banner, StoreSettings } from "./types";
import { DEFAULT_SETTINGS } from "./seed-data";

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const [row, brand] = await Promise.all([prisma.setting.findUnique({ where: { id: 1 } }), getBrand()]);
  const base = row ?? { ...DEFAULT_SETTINGS, id: 1 };
  const banners = safeJSON<Banner[]>(base.banners, []);
  return {
    announcement: base.announcement,
    announcementOn: base.announcementOn,
    primaryColor: base.primaryColor,
    accentColor: base.accentColor,
    banners,
    deliveryCharge: base.deliveryCharge,
    expressCharge: base.expressCharge,
    freeDeliveryAbove: base.freeDeliveryAbove,
    codCharge: base.codCharge,
    gstPercent: base.gstPercent,
    // Contact email defaults to the brand's own domain so it always matches brand.json.
    email: base.email || `care@${slugOf(brand.brandName)}.in`,
    phone: base.phone,
    whatsapp: base.whatsapp,
    address: base.address,
    instagram: base.instagram,
    facebook: base.facebook,
    youtube: base.youtube,
    pinterest: base.pinterest,
  };
});

export function hexToRgbChannels(hex: string, fallback = "122 34 50"): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
