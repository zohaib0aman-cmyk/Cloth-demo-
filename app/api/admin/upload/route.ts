import sharp from "sharp";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files received" }, { status: 400 });
  const urls: string[] = [];
  for (const file of files.slice(0, 8)) {
    if (file.size > 12 * 1024 * 1024) continue;
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const out = await sharp(input).rotate().resize({ width: 1400, height: 1750, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      const row = await prisma.upload.create({ data: { data: new Uint8Array(out), contentType: "image/webp" }, select: { id: true } });
      urls.push(`/api/uploads/${row.id}.webp`);
    } catch {
      // skip files that aren't images
    }
  }
  if (!urls.length) return NextResponse.json({ error: "Please upload JPG, PNG or WebP images under 12 MB" }, { status: 400 });
  return NextResponse.json({ urls });
}
