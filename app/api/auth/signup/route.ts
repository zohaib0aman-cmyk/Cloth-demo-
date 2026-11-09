import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setCustomerSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, phone, password } = (await req.json().catch(() => ({}))) as Record<string, string>;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email ?? "") || (password ?? "").length < 6) {
    return NextResponse.json({ error: "Enter your name, a valid email and a password of at least 6 characters" }, { status: 400 });
  }
  const lower = email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email: lower } })) return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
  const user = await prisma.user.create({ data: { name: name.trim(), email: lower, phone: (phone ?? "").trim(), passwordHash: await bcrypt.hash(password, 10) } });
  // Link earlier guest orders placed with the same email.
  await prisma.order.updateMany({ where: { email: lower, userId: null }, data: { userId: user.id } });
  await setCustomerSession(user.id);
  return NextResponse.json({ ok: true });
}
