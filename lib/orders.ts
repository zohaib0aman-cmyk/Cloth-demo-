import "server-only";
import { prisma } from "./db";
import { safeJSON } from "./format";
import type { ShippingAddress } from "./types";

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.toUpperCase() },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return null;
  return toOrderDTO(order);
}

type OrderRow = NonNullable<Awaited<ReturnType<typeof prisma.order.findFirst<{ include: { items: true; events: true } }>>>>;

export function toOrderDTO(order: OrderRow) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    address: safeJSON<ShippingAddress>(order.address, { name: "", phone: "", email: "", line1: "", line2: "", city: "", state: "", pincode: "" }),
    subtotal: order.subtotal,
    discount: order.discount,
    couponCode: order.couponCode,
    gst: order.gst,
    gstPercent: order.gstPercent,
    delivery: order.delivery,
    total: order.total,
    deliveryOption: order.deliveryOption,
    paymentMethod: order.paymentMethod,
    paymentRef: order.paymentRef,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((i) => ({ id: i.id, productId: i.productId, name: i.name, image: i.image, size: i.size, color: i.color, price: i.price, qty: i.qty })),
    events: order.events.map((e) => ({ status: e.status, note: e.note, createdAt: e.createdAt.toISOString() })),
  };
}

export type OrderDTO = ReturnType<typeof toOrderDTO>;

export function estimatedDelivery(createdAt: string, option: string) {
  const days = option === "express" ? 2 : 5;
  return new Date(new Date(createdAt).getTime() + days * 86400000);
}
