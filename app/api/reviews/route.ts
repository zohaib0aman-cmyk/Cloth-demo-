import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { productId?: string; name?: string; city?: string; rating?: number; title?: string; body?: string };
  const rating = Math.round(Number(b.rating));
  if (!b.productId || !b.name?.trim() || !b.body?.trim() || !(rating >= 1 && rating <= 5)) return NextResponse.json({ error: "Please add your name, a rating and a short review" }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { id: b.productId }, select: { slug: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  await prisma.review.create({
    data: { productId: b.productId, name: b.name.trim().slice(0, 60), city: (b.city ?? "").trim().slice(0, 40), rating, title: (b.title ?? "").trim().slice(0, 100), body: b.body.trim().slice(0, 1200) },
  });
  revalidatePath(`/product/${product.slug}`);
  return NextResponse.json({ ok: true });
}
