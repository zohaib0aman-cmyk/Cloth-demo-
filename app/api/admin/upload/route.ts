import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files received" }, { status: 400 });
  const dir = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const urls: string[] = [];
  for (const file of files.slice(0, 8)) {
    if (file.size > 12 * 1024 * 1024) continue;
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const out = await sharp(input).rotate().resize({ width: 1400, height: 1750, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}.webp`;
      await fs.writeFile(path.join(dir, name), out);
      urls.push(`/api/uploads/${name}`);
    } catch {
      // skip files that aren't images
    }
  }
  if (!urls.length) return NextResponse.json({ error: "Please upload JPG, PNG or WebP images under 12 MB" }, { status: 400 });
  return NextResponse.json({ urls });
}
