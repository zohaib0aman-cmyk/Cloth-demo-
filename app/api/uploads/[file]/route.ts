import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Serves photos uploaded from the admin panel (stored in this demo's own database). */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.[a-z0-9]+$/i, "");
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const row = await prisma.upload.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(new Uint8Array(row.data), {
    headers: { "Content-Type": row.contentType, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
