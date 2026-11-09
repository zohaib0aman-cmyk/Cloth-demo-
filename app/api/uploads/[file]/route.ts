import path from "path";
import fs from "fs/promises";
import { NextResponse } from "next/server";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" };

/** Serves photos uploaded from the admin panel (stored per demo copy in data/uploads). */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = path.basename((await params).file);
  const ext = path.extname(name).toLowerCase();
  if (!TYPES[ext]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const buf = await fs.readFile(path.join(process.cwd(), "data", "uploads", name));
    return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
