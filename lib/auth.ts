import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { defaultBrand as brand } from "./brand";
import { prisma } from "./db";

const SECRET = process.env.SESSION_SECRET || `zyntra-demo-${brand.leadId}-session-key`;
export const CUSTOMER_COOKIE = "store_session";
export const ADMIN_COOKIE = "store_admin";

/** Demo admin login, shown on the admin login screen so leads can sign straight in. */
export const ADMIN_DEMO = { email: "admin@demo.store", password: "demo1234" };
/** Demo customer login, shown on the customer login screen. */
export const CUSTOMER_DEMO = { email: "priya@demo.store", password: "demo1234" };

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function unsign(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 1) return null;
  const value = token.slice(0, idx);
  const expected = sign(value);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
  maxAge: 60 * 60 * 24 * 30,
};

export async function setCustomerSession(userId: string) {
  (await cookies()).set(CUSTOMER_COOKIE, sign(`u:${userId}`), cookieOpts);
}

export async function clearCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function getCurrentUser() {
  const value = unsign((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!value?.startsWith("u:")) return null;
  return prisma.user.findUnique({
    where: { id: value.slice(2) },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
}

export async function setAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, sign(`admin:${brand.leadId}`), { ...cookieOpts, maxAge: 60 * 60 * 12 });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const value = unsign((await cookies()).get(ADMIN_COOKIE)?.value);
  return value === `admin:${brand.leadId}`;
}
