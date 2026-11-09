import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setCustomerSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as Record<string, string>;
  const user = email ? await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } }) : null;
  if (!user || !(await bcrypt.compare(password ?? "", user.passwordHash))) return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  await setCustomerSession(user.id);
  return NextResponse.json({ ok: true });
}
