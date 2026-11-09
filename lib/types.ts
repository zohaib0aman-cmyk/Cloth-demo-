export type ProductColor = { name: string; hex: string };

export type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric: string;
  care: string;
  price: number;
  discount: number;
  salePrice: number;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  category: { name: string; slug: string };
  collections: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
};

export type Banner = {
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  cta: string;
  link: string;
};

export type StoreSettings = {
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

export type CouponDTO = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrder: number;
  maxDiscount: number;
  description: string;
};

export type ShippingAddress = {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export const ORDER_STEPS = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
export type OrderStatus = (typeof ORDER_STEPS)[number] | "CANCELLED";

export const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PAYMENT_LABEL: Record<string, string> = {
  UPI: "UPI",
  CARD: "Credit / Debit card",
  NETBANKING: "Net banking",
  COD: "Cash on delivery",
};
