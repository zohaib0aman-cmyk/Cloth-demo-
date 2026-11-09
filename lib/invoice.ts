import "server-only";
import path from "path";
import fs from "fs/promises";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import { defaultBrand, ZYNTRA_DEMO_NOTICE, type ResolvedBrand } from "./brand";
import { getLeadLogoSource } from "./brand-server";
import type { OrderDTO } from "./orders";
import type { StoreSettings } from "./types";
import { PAYMENT_LABEL } from "./types";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN") + ".00";

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  const n = m ? parseInt(m[1], 16) : 0x7a2232;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Loads the visitor's logo (lead logo, or brand.json's local/remote logo) and converts any format to PNG for the PDF. */
async function loadLogo(brand: ResolvedBrand): Promise<Buffer | null> {
  const source = brand.isLead ? await getLeadLogoSource() : defaultBrand.logoUrl;
  if (!source) return null;
  try {
    let input: Buffer;
    if (/^https?:\/\//i.test(source)) {
      const res = await fetch(source, { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      input = Buffer.from(await res.arrayBuffer());
    } else {
      const rel = source.replace(/^\/+/, "");
      input = await fs.readFile(path.join(process.cwd(), "public", rel));
    }
    return await sharp(input, { density: 300 }).resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: false }).png().toBuffer();
  } catch {
    return null;
  }
}

function numberToWordsINR(num: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n: number) => (n < 20 ? a[n] : `${b[Math.floor(n / 10)]}${n % 10 ? " " + a[n % 10] : ""}`);
  const three = (n: number) => (n >= 100 ? `${a[Math.floor(n / 100)]} Hundred${n % 100 ? " " + two(n % 100) : ""}` : two(n));
  if (num === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;
  if (crore) parts.push(`${two(crore)} Crore`);
  if (lakh) parts.push(`${two(lakh)} Lakh`);
  if (thousand) parts.push(`${two(thousand)} Thousand`);
  if (rest) parts.push(three(rest));
  return parts.join(" ");
}

export async function renderInvoice(order: OrderDTO, settings: StoreSettings, brand: ResolvedBrand): Promise<Buffer> {
  const logo = await loadLogo(brand);
  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Invoice ${order.orderNumber} — ${brand.brandName}`, Author: brand.brandName, Subject: "Tax invoice", Keywords: brand.isLead ? "demo" : defaultBrand.leadId } });
  doc.registerFont("body", path.join(FONT_DIR, "Manrope-400-normal.ttf"));
  doc.registerFont("bold", path.join(FONT_DIR, "Manrope-700-normal.ttf"));
  doc.registerFont("semi", path.join(FONT_DIR, "Manrope-600-normal.ttf"));
  doc.registerFont("serif", path.join(FONT_DIR, "CormorantGaramond-600-normal.ttf"));

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const brandRgb = hexToRgb(settings.primaryColor);
  const ink: [number, number, number] = [29, 26, 23];
  const mute: [number, number, number] = [133, 124, 114];
  const line: [number, number, number] = [231, 223, 211];
  const L = 48;
  const R = doc.page.width - 48;
  const W = R - L;

  // Top accent band
  doc.rect(0, 0, doc.page.width, 6).fill(brandRgb);

  // Header: logo + brand name
  let y = 40;
  let textX = L;
  if (logo) {
    doc.image(logo, L, y, { fit: [64, 64], align: "center", valign: "center" });
  } else {
    // No logo: brand initials in a circle, matching the website.
    doc.circle(L + 32, y + 32, 30).fill(brandRgb);
    doc.fillColor([255, 255, 255]).font("serif").fontSize(brand.initials.length > 1 ? 24 : 28).text(brand.initials, L, y + 16, { width: 64, align: "center" });
  }
  textX = L + 78;
  doc.fillColor(ink).font("serif").fontSize(24).text(brand.brandName, textX, y + 8, { width: 260 });
  doc.fillColor(mute).font("body").fontSize(8.5).text(brand.location ?? settings.address, textX, doc.y + 2, { width: 250 });
  doc.text(`${settings.phone}  ·  ${settings.email}`, textX, doc.y + 1, { width: 260 });

  doc.fillColor(brandRgb).font("bold").fontSize(9).text("TAX INVOICE", R - 200, y + 4, { width: 200, align: "right", characterSpacing: 2 });
  doc.fillColor(ink).font("semi").fontSize(16).text(order.orderNumber.replace("ORD", "INV"), R - 200, y + 18, { width: 200, align: "right" });
  doc.fillColor(mute).font("body").fontSize(8.5);
  const created = new Date(order.createdAt);
  doc.text(`Invoice date: ${created.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, R - 200, y + 40, { width: 200, align: "right" });
  doc.text(`Order ID: ${order.orderNumber}`, R - 200, doc.y + 1, { width: 200, align: "right" });

  y = Math.max(doc.y, 120) + 18;
  doc.moveTo(L, y).lineTo(R, y).lineWidth(0.8).strokeColor(line).stroke();
  y += 16;

  // Bill to / Ship to / Payment
  const col = W / 3;
  const block = (title: string, lines: string[], x: number) => {
    doc.fillColor(mute).font("bold").fontSize(7.5).text(title, x, y, { characterSpacing: 1.5 });
    doc.fillColor(ink).font("semi").fontSize(10).text(lines[0], x, y + 13, { width: col - 12 });
    doc.font("body").fontSize(8.5).fillColor([74, 68, 62]);
    lines.slice(1).forEach((l) => doc.text(l, x, doc.y + 1, { width: col - 12 }));
    return doc.y;
  };
  const a = order.address;
  const b1 = block("BILLED TO", [order.customerName, order.email, order.phone], L);
  const b2 = block("SHIP TO", [a.name, a.line1 + (a.line2 ? `, ${a.line2}` : ""), `${a.city}, ${a.state} ${a.pincode}`, `Phone: ${a.phone}`], L + col);
  const b3 = block("PAYMENT", [PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod, `Ref: ${order.paymentRef}`, `Delivery: ${order.deliveryOption === "express" ? "Express" : "Standard"}`, order.paymentMethod === "COD" ? "Status: Pay on delivery" : "Status: Paid (demo)"], L + col * 2);
  y = Math.max(b1, b2, b3) + 22;

  // Items table
  const cols = [
    { label: "#", x: L + 8, w: 18, align: "left" as const },
    { label: "ITEM", x: L + 30, w: W - 250, align: "left" as const },
    { label: "QTY", x: R - 216, w: 40, align: "center" as const },
    { label: "RATE", x: R - 170, w: 76, align: "right" as const },
    { label: "AMOUNT", x: R - 92, w: 84, align: "right" as const },
  ];
  doc.roundedRect(L, y, W, 24, 4).fill([243, 237, 227]);
  doc.fillColor(ink).font("bold").fontSize(7.5);
  cols.forEach((c) => doc.text(c.label, c.x, y + 8.5, { width: c.w, align: c.align, characterSpacing: 1.2 }));
  y += 32;

  order.items.forEach((it, i) => {
    if (y > doc.page.height - 230) {
      doc.addPage();
      y = 60;
    }
    const startY = y;
    doc.fillColor(mute).font("body").fontSize(9).text(String(i + 1), cols[0].x, y, { width: cols[0].w });
    doc.fillColor(ink).font("semi").fontSize(9.5).text(it.name, cols[1].x, y, { width: cols[1].w });
    doc.fillColor(mute).font("body").fontSize(8).text(`Size: ${it.size}   ·   Colour: ${it.color}`, cols[1].x, doc.y + 1, { width: cols[1].w });
    const rowBottom = doc.y;
    doc.fillColor(ink).font("body").fontSize(9.5);
    doc.text(String(it.qty), cols[2].x, startY, { width: cols[2].w, align: "center" });
    doc.text(money(it.price), cols[3].x, startY, { width: cols[3].w, align: "right" });
    doc.font("semi").text(money(it.price * it.qty), cols[4].x, startY, { width: cols[4].w, align: "right" });
    y = rowBottom + 10;
    doc.moveTo(L, y - 4).lineTo(R, y - 4).lineWidth(0.5).strokeColor(line).stroke();
    y += 6;
  });

  // Totals
  y += 6;
  const tx = R - 230;
  const half = Math.floor(order.gst / 2);
  const rows: [string, string, boolean?][] = [
    ["Subtotal", money(order.subtotal)],
    ...(order.discount > 0 ? ([[`Discount (${order.couponCode})`, `− ${money(order.discount)}`]] as [string, string][]) : []),
    ["Taxable value", money(order.subtotal - order.discount)],
    [`CGST @ ${order.gstPercent / 2}%`, money(half)],
    [`SGST @ ${order.gstPercent / 2}%`, money(order.gst - half)],
    ["Delivery charges", order.delivery ? money(order.delivery) : "Free"],
  ];
  rows.forEach(([k, v]) => {
    doc.fillColor([74, 68, 62]).font("body").fontSize(9).text(k, tx, y, { width: 130 });
    doc.fillColor(ink).text(v, tx + 130, y, { width: 100, align: "right" });
    y += 16;
  });
  y += 4;
  doc.roundedRect(tx - 10, y, 240, 34, 6).fill(brandRgb);
  doc.fillColor([255, 255, 255]).font("bold").fontSize(10).text(order.paymentMethod === "COD" ? "AMOUNT DUE" : "TOTAL PAID", tx, y + 12, { width: 120, characterSpacing: 1 });
  doc.font("bold").fontSize(13).text(money(order.total), tx + 100, y + 10, { width: 120, align: "right" });

  doc.fillColor(mute).font("body").fontSize(8).text("Amount in words", L, y - 70, { width: 240 });
  doc.fillColor(ink).font("semi").fontSize(9.5).text(`Indian Rupees ${numberToWordsINR(order.total)} Only`, L, doc.y + 2, { width: 250 });
  y += 60;

  // Demo notice
  doc.roundedRect(L, y, W, 40, 6).lineWidth(0.8).strokeColor([184, 137, 59]).stroke();
  doc.fillColor([120, 86, 30]).font("semi").fontSize(9).text(ZYNTRA_DEMO_NOTICE, L + 14, y + 9, { width: W - 28, align: "center" });
  if (!brand.isLead) doc.fillColor(mute).font("body").fontSize(7.5).text(`Demo reference ${defaultBrand.leadId}`, L + 14, doc.y + 2, { width: W - 28, align: "center" });
  y += 58;

  doc.fillColor(ink).font("serif").fontSize(15).text(`Thank you for shopping with ${brand.brandName}`, L, y, { width: W, align: "center" });
  doc.fillColor(mute).font("body").fontSize(8).text("This is a computer-generated invoice and does not require a signature. Returns accepted within 7 days of delivery.", L, doc.y + 4, { width: W, align: "center" });

  doc.end();
  return done;
}
