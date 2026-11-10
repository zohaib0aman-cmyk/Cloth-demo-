import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES, COLLECTIONS, COUPONS, DEFAULT_SETTINGS, PRODUCTS, SAMPLE_CUSTOMERS, SAMPLE_ORDERS, reviewsFor } from "./seed-data";
import { computeTotals, salePriceOf } from "./pricing";
import { slugify } from "./format";
import { ORDER_STEPS } from "./types";

const DAY = 24 * 60 * 60 * 1000;

/** Wipes every table and loads the sample store. Used on first run and by "Reset demo". */
export async function seedDatabase(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.orderEvent.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.address.deleteMany(),
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.category.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.upload.deleteMany(),
  ]);

  await prisma.setting.create({ data: { id: 1, ...DEFAULT_SETTINGS } });

  const categoryIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await prisma.category.create({ data: { ...c, sortOrder: i } });
    categoryIds[c.slug] = row.id;
  }
  for (const [i, c] of COLLECTIONS.entries()) {
    await prisma.collection.create({ data: { ...c, sortOrder: i, featured: true } });
  }

  const now = Date.now();
  const productRows: { id: string; name: string; price: number; discount: number }[] = [];
  for (const [i, p] of PRODUCTS.entries()) {
    const row = await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        fabric: p.fabric,
        care: p.care,
        price: p.price,
        discount: p.discount,
        images: JSON.stringify(p.images),
        sizes: JSON.stringify(p.sizes),
        colors: JSON.stringify(p.colors),
        stock: p.stock,
        isNew: p.flags?.includes("new") ?? false,
        isBestseller: p.flags?.includes("best") ?? false,
        isFeatured: p.flags?.includes("featured") ?? false,
        categoryId: categoryIds[p.category],
        collections: { connect: p.collections.map((slug) => ({ slug })) },
        // Older products first so "new arrivals" sort naturally.
        createdAt: new Date(now - (PRODUCTS.length - i) * DAY * (p.flags?.includes("new") ? 0.2 : 2)),
        reviews: {
          create: reviewsFor(i).map((r) => ({
            name: r.name,
            city: r.city,
            rating: r.rating,
            title: r.title,
            body: r.body,
            createdAt: new Date(now - r.daysAgo * DAY),
          })),
        },
      },
    });
    productRows.push(row);
  }

  for (const c of COUPONS) await prisma.coupon.create({ data: c });

  const passwordHash = await bcrypt.hash("demo1234", 8);
  const demo = SAMPLE_CUSTOMERS[0];
  const demoUser = await prisma.user.create({
    data: {
      name: demo.name,
      email: demo.email,
      phone: demo.phone,
      passwordHash,
      createdAt: new Date(now - 40 * DAY),
      addresses: {
        create: [
          { label: "Home", name: demo.name, phone: demo.phone, line1: demo.line1, line2: demo.line2, city: demo.city, state: demo.state, pincode: demo.pincode, isDefault: true },
          { label: "Office", name: demo.name, phone: demo.phone, line1: "WeWork, 5th Floor, Raheja Platinum", line2: "Andheri East", city: "Mumbai", state: "Maharashtra", pincode: "400059", isDefault: false },
        ],
      },
    },
  });

  for (const [n, [ci, pids, status, daysAgo, payment, couponCode]] of SAMPLE_ORDERS.entries()) {
    const cust = SAMPLE_CUSTOMERS[ci];
    const items = pids.map((pi, k) => {
      const p = productRows[pi];
      const seed = PRODUCTS[pi];
      return {
        productId: p.id,
        name: p.name,
        image: seed.images[0],
        size: seed.sizes[Math.min(2, seed.sizes.length - 1)],
        color: seed.colors[k % seed.colors.length].name,
        price: salePriceOf(p.price, p.discount),
        qty: 1 + ((n + k) % 2 === 0 && seed.price < 2000 ? 1 : 0),
      };
    });
    const coupon = couponCode ? COUPONS.find((c) => c.code === couponCode) : undefined;
    const totals = computeTotals({
      lines: items,
      coupon: coupon ? { ...coupon, type: coupon.type as "PERCENT" | "FLAT" } : null,
      gstPercent: DEFAULT_SETTINGS.gstPercent,
      deliveryCharge: DEFAULT_SETTINGS.deliveryCharge,
      expressCharge: DEFAULT_SETTINGS.expressCharge,
      freeDeliveryAbove: DEFAULT_SETTINGS.freeDeliveryAbove,
      codCharge: DEFAULT_SETTINGS.codCharge,
      deliveryOption: "standard",
      paymentMethod: payment,
    });
    const placedAt = now - daysAgo * DAY - (n % 5) * 3600 * 1000 - 2 * 3600 * 1000;
    const stepIndex = ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number]);
    await prisma.order.create({
      data: {
        orderNumber: `ORD-${(24101 + n * 37).toString()}`,
        userId: ci === 0 ? demoUser.id : null,
        customerName: cust.name,
        email: cust.email,
        phone: cust.phone,
        address: JSON.stringify({ name: cust.name, phone: cust.phone, email: cust.email, line1: cust.line1, line2: cust.line2, city: cust.city, state: cust.state, pincode: cust.pincode }),
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: totals.discount > 0 ? couponCode : null,
        gst: totals.gst,
        gstPercent: DEFAULT_SETTINGS.gstPercent,
        delivery: totals.delivery,
        total: totals.total,
        paymentMethod: payment,
        paymentRef: payment === "COD" ? "COD-PENDING" : `DEMO${(9381200 + n * 7919).toString(36).toUpperCase()}`,
        status,
        createdAt: new Date(placedAt),
        items: { create: items },
        events: {
          create: ORDER_STEPS.slice(0, stepIndex + 1).map((s, k) => ({
            status: s,
            createdAt: new Date(Math.min(placedAt + k * 0.9 * DAY, now - 60 * 1000)),
          })),
        },
      },
    });
  }
}
