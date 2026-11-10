#!/usr/bin/env node
/**
 * Creates an isolated copy of this master demo for one lead.
 *
 *   node scripts/create-demo.mjs --out ../demos/ZYN-1042 --name "Kesar & Co." --logo ./kesar.png --lead ZYN-1042
 *
 * It copies the project (without node_modules, build output or local env files), writes config/brand.json
 * and drops the logo into public/brand/. No code is changed. Then set DATABASE_URL to this demo's own Postgres database and: cd <out> && npm install && npm run build && npm start
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => (cur.startsWith("--") ? [...acc, [cur.slice(2), arr[i + 1]]] : acc), []),
);
if (!args.out || !args.name || !args.lead) {
  console.error('Usage: node scripts/create-demo.mjs --out <dir> --name "<Brand Name>" --lead <ZYN-XXXX> [--logo <file-or-url>]');
  process.exit(1);
}
const out = path.resolve(args.out);
if (fs.existsSync(out) && fs.readdirSync(out).length) {
  console.error(`Refusing to overwrite non-empty folder: ${out}`);
  process.exit(1);
}

const SKIP = new Set(["node_modules", ".next", ".git", "out", "tsconfig.tsbuildinfo", "next-env.d.ts"]);
function copy(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.name === ".env" || entry.name === ".env.local") continue;
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copy(s, d);
    } else fs.copyFileSync(s, d);
  }
}
fs.mkdirSync(out, { recursive: true });
copy(root, out);

let logoUrl = "/brand/logo.png";
if (args.logo) {
  if (/^https?:\/\//i.test(args.logo)) logoUrl = args.logo;
  else {
    const ext = path.extname(args.logo).toLowerCase() || ".png";
    const file = `logo${ext}`;
    fs.copyFileSync(path.resolve(args.logo), path.join(out, "public", "brand", file));
    logoUrl = `/brand/${file}`;
  }
}
fs.writeFileSync(path.join(out, "config", "brand.json"), JSON.stringify({ brandName: args.name, logoUrl, leadId: args.lead }, null, 2) + "\n");
console.log(`Demo for ${args.name} (${args.lead}) created at ${out}`);
console.log("Next: npm install && npm run build && npm start");
