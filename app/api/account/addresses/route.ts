import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function list(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  return NextResponse.json({ addresses: await list(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, string | boolean>;
  const s = (k: string) => String(b[k] ?? "").trim();
  if (!s("name") || !s("phone") || !s("line1") || !s("city") || !s("state") || !/^\d{6}$/.test(s("pincode"))) return NextResponse.json({ error: "Please fill every required field" }, { status: 400 });
  const count = await prisma.address.count({ where: { userId: user.id } });
  const isDefault = count === 0 || b.isDefault === true;
  if (isDefault) await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.address.create({ data: { userId: user.id, label: s("label") || "Home", name: s("name"), phone: s("phone"), line1: s("line1"), line2: s("line2"), city: s("city"), state: s("state"), pincode: s("pincode"), isDefault } });
  return NextResponse.json({ addresses: await list(user.id) });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  const addr = id ? await prisma.address.findFirst({ where: { id, userId: user.id } }) : null;
  if (!addr) return NextResponse.json({ error: "Address not found" }, { status: 404 });
  await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.address.update({ where: { id: addr.id }, data: { isDefault: true } });
  return NextResponse.json({ addresses: await list(user.id) });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  const rest = await list(user.id);
  if (rest.length && !rest.some((a) => a.isDefault)) await prisma.address.update({ where: { id: rest[0].id }, data: { isDefault: true } });
  return NextResponse.json({ addresses: await list(user.id) });
}
