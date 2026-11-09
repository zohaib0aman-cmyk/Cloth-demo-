"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ADMIN_DEMO, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { seedDatabase } from "@/lib/seed";
import { ORDER_STEPS } from "@/lib/types";
import type { Banner, ProductColor } from "@/lib/types";

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** Every admin change refreshes the whole site so the storefront reflects it instantly. */
function refreshAll() {
  revalidatePath("/", "layout");
}

export async function adminLogin(_prev: { error?: string } | undefined, form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (email !== ADMIN_DEMO.email || password !== ADMIN_DEMO.password) return { error: "Incorrect email or password" };
  await setAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function resetDemo() {
  await guard();
  await seedDatabase(prisma);
  refreshAll();
  return { ok: true };
}

/* ---------- Products ---------- */

export type ProductInput = {
  id?: string;
  name: string;
  description: string;
  fabric: string;
  care: string;
  price: number;
  discount: number;
  stock: number;
  categoryId: string;
  collectionIds: string[];
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  active: boolean;
};

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "product";
  let slug = base;
  for (let i = 2; ; i++) {
    const hit = await prisma.product.findUnique({ where: { slug } });
    if (!hit || hit.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

export async function saveProduct(input: ProductInput): Promise<{ error?: string; id?: string }> {
  await guard();
  if (!input.name.trim()) return { error: "Product name is required" };
  if (!(input.price > 0)) return { error: "Price must be greater than zero" };
  if (!input.categoryId) return { error: "Choose a category" };
  if (!input.sizes.length) return { error: "Add at least one size" };
  const data = {
    name: input.name.trim(),
    description: input.description.trim() || input.name.trim(),
    fabric: input.fabric.trim(),
    care: input.care.trim(),
    price: Math.round(input.price),
    discount: Math.max(0, Math.min(90, Math.round(input.discount || 0))),
    stock: Math.max(0, Math.round(input.stock || 0)),
    categoryId: input.categoryId,
    images: JSON.stringify(input.images.filter(Boolean)),
    sizes: JSON.stringify(input.sizes),
    colors: JSON.stringify(input.colors.filter((c) => c.name.trim()).length ? input.colors.filter((c) => c.name.trim()) : [{ name: "Default", hex: "#7a2232" }]),
    isNew: input.isNew,
    isBestseller: input.isBestseller,
    isFeatured: input.isFeatured,
    active: input.active,
  };
  let id = input.id;
  if (id) {
    await prisma.product.update({
      where: { id },
      data: { ...data, slug: await uniqueSlug(data.name, id), collections: { set: input.collectionIds.map((cid) => ({ id: cid })) } },
    });
  } else {
    const created = await prisma.product.create({
      data: { ...data, slug: await uniqueSlug(data.name), collections: { connect: input.collectionIds.map((cid) => ({ id: cid })) } },
    });
    id = created.id;
  }
  refreshAll();
  return { id };
}

export async function deleteProduct(id: string) {
  await guard();
  await prisma.product.delete({ where: { id } });
  refreshAll();
}

export async function setStock(id: string, stock: number) {
  await guard();
  await prisma.product.update({ where: { id }, data: { stock: Math.max(0, Math.round(stock)) } });
  refreshAll();
}

/* ---------- Categories & collections ---------- */

export async function saveCategory(input: { id?: string; name: string; description: string; image: string }) {
  await guard();
  if (!input.name.trim()) return { error: "Name is required" };
  const slug = slugify(input.name);
  if (input.id) {
    await prisma.category.update({ where: { id: input.id }, data: { name: input.name.trim(), description: input.description, image: input.image } });
  } else {
    if (await prisma.category.findUnique({ where: { slug } })) return { error: "A category with this name already exists" };
    const count = await prisma.category.count();
    await prisma.category.create({ data: { name: input.name.trim(), slug, description: input.description, image: input.image, sortOrder: count } });
  }
  refreshAll();
  return {};
}

export async function deleteCategory(id: string) {
  await guard();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) return { error: `Move or delete the ${count} products in this category first` };
  await prisma.category.delete({ where: { id } });
  refreshAll();
  return {};
}

export async function saveCollection(input: { id?: string; name: string; tagline: string; image: string; featured: boolean }) {
  await guard();
  if (!input.name.trim()) return { error: "Name is required" };
  const slug = slugify(input.name);
  if (input.id) {
    await prisma.collection.update({ where: { id: input.id }, data: { name: input.name.trim(), tagline: input.tagline, image: input.image, featured: input.featured } });
  } else {
    if (await prisma.collection.findUnique({ where: { slug } })) return { error: "A collection with this name already exists" };
    const count = await prisma.collection.count();
    await prisma.collection.create({ data: { name: input.name.trim(), slug, tagline: input.tagline, image: input.image, featured: input.featured, sortOrder: count } });
  }
  refreshAll();
  return {};
}

export async function deleteCollection(id: string) {
  await guard();
  await prisma.collection.delete({ where: { id } });
  refreshAll();
  return {};
}

export async function reorder(kind: "category" | "collection", ids: string[]) {
  await guard();
  await prisma.$transaction(
    ids.map((id, i) => (kind === "category" ? prisma.category.update({ where: { id }, data: { sortOrder: i } }) : prisma.collection.update({ where: { id }, data: { sortOrder: i } }))),
  );
  refreshAll();
}

/* ---------- Orders ---------- */

export async function updateOrderStatus(orderId: string, status: string, note = "") {
  await guard();
  const valid = [...ORDER_STEPS, "CANCELLED"] as string[];
  if (!valid.includes(status)) return { error: "Unknown status" };
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { events: true, items: true } });
  if (!order) return { error: "Order not found" };
  if (order.status === status) return {};

  const ops = [];
  const target = ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number]);
  if (target >= 0) {
    // Fill in any skipped steps so the customer timeline stays complete.
    const have = new Set(order.events.map((e) => e.status));
    ORDER_STEPS.slice(0, target + 1).forEach((s, i) => {
      if (!have.has(s)) ops.push(prisma.orderEvent.create({ data: { orderId, status: s, note: s === status ? note : "", createdAt: new Date(Date.now() - (target - i) * 1000) } }));
    });
    // Moving backwards removes later events.
    const later = ORDER_STEPS.slice(target + 1) as readonly string[];
    ops.push(prisma.orderEvent.deleteMany({ where: { orderId, status: { in: [...later, "CANCELLED"] } } }));
  } else {
    ops.push(prisma.orderEvent.create({ data: { orderId, status, note } }));
    // Return stock to inventory when cancelling.
    for (const it of order.items) if (it.productId) ops.push(prisma.product.updateMany({ where: { id: it.productId }, data: { stock: { increment: it.qty } } }));
  }
  if (order.status === "CANCELLED" && status !== "CANCELLED") {
    for (const it of order.items) if (it.productId) ops.push(prisma.product.updateMany({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } }));
  }
  ops.push(prisma.order.update({ where: { id: orderId }, data: { status } }));
  await prisma.$transaction(ops);
  refreshAll();
  return {};
}

/* ---------- Coupons ---------- */

export async function saveCoupon(input: { id?: string; code: string; type: string; value: number; minOrder: number; maxDiscount: number; description: string; active: boolean }) {
  await guard();
  const code = input.code.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9]{3,20}$/.test(code)) return { error: "Use 3–20 letters or numbers for the code" };
  if (!(input.value > 0)) return { error: "Discount value must be more than zero" };
  if (input.type === "PERCENT" && input.value > 90) return { error: "Percentage can be at most 90" };
  const data = { code, type: input.type === "FLAT" ? "FLAT" : "PERCENT", value: Math.round(input.value), minOrder: Math.max(0, Math.round(input.minOrder || 0)), maxDiscount: Math.max(0, Math.round(input.maxDiscount || 0)), description: input.description.trim(), active: input.active };
  const clash = await prisma.coupon.findUnique({ where: { code } });
  if (clash && clash.id !== input.id) return { error: "This code already exists" };
  if (input.id) await prisma.coupon.update({ where: { id: input.id }, data });
  else await prisma.coupon.create({ data });
  refreshAll();
  return {};
}

export async function toggleCoupon(id: string, active: boolean) {
  await guard();
  await prisma.coupon.update({ where: { id }, data: { active } });
  refreshAll();
}

export async function deleteCoupon(id: string) {
  await guard();
  await prisma.coupon.delete({ where: { id } });
  refreshAll();
}

/* ---------- Settings ---------- */

export type SettingsInput = {
  announcement: string;
  announcementOn: boolean;
  primaryColor: string;
  accentColor: string;
  banners: Banner[];
  deliveryCharge: number;
  expressCharge: number;
  freeDeliveryAbove: number;
  codCharge: number;
  gstPercent: number;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  youtube: string;
  pinterest: string;
};

export async function saveSettings(input: SettingsInput) {
  await guard();
  const hex = (v: string, d: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d);
  const n = (v: number) => Math.max(0, Math.round(Number(v) || 0));
  const data = {
    announcement: input.announcement.trim(),
    announcementOn: input.announcementOn,
    primaryColor: hex(input.primaryColor, "#7a2232"),
    accentColor: hex(input.accentColor, "#b8893b"),
    banners: JSON.stringify(input.banners.filter((b) => b.title.trim())),
    deliveryCharge: n(input.deliveryCharge),
    expressCharge: n(input.expressCharge),
    freeDeliveryAbove: n(input.freeDeliveryAbove),
    codCharge: n(input.codCharge),
    gstPercent: Math.min(28, n(input.gstPercent)),
    email: input.email.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp.replace(/\D/g, ""),
    address: input.address.trim(),
    instagram: input.instagram.trim(),
    facebook: input.facebook.trim(),
    youtube: input.youtube.trim(),
    pinterest: input.pinterest.trim(),
  };
  await prisma.setting.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  refreshAll();
  return {};
}
