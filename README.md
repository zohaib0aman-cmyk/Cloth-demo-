# Zyntra Demo Store — clothing brand master demo

A fully working, animated e-commerce demo for Indian clothing brands. Leads can browse, add to bag, apply coupons, check out, pay through a simulated gateway, download a GST bill, track their order live, and run the whole store from an admin panel.

The only difference from a real store: **payments are simulated**. After payment the customer sees: *"This is a demo website made by Zyntra. No real payment was taken."* The footer also carries a small "Demo by Zyntra" badge.

---

## How AI customizes this demo

**Only one file needs to change: `config/brand.json`.**

```json
{
  "brandName": "Brand Name Here",
  "logoUrl": "/brand/logo.png",
  "leadId": "ZYN-XXXX"
}
```

To rebrand for a lead, make exactly these two edits (and set the lead ID):

1. **`brandName`**: replace it with the lead's brand name, e.g. `"Kesar & Co."`.
2. **`logoUrl`**: put the lead's logo file in `public/brand/` (for example `public/brand/logo.png`) and point `logoUrl` at it (`"/brand/logo.png"`). A full `https://…` URL also works. PNG, JPG, WebP and SVG are all supported.
3. **`leadId`**: the lead's ID from the Zyntra Lead System, e.g. `"ZYN-1042"`.

Then build and start the app. Nothing else should be edited. The brand name and logo are read from this file everywhere they appear: navbar, footer, page titles and meta tags, favicon, loading screen, PDF invoices, the admin panel, WhatsApp messages and the order confirmation. No brand name or logo is hardcoded anywhere else.

The logo can be any shape (square, round or wide). It is fitted into a fixed-height box with `object-contain` and safe padding, so it is never cropped or stretched.

### Personalised demo links (lead tracking ID)

One deployed demo can show any lead's brand. Add the lead's tracking ID to the URL:

```
https://<your-demo-domain>/?id=ZYN-IN-GJ-000123
```

- The ID must match `ZYN-XX-XX-000000` (two groups of letters/digits, then six digits). Anything else is ignored and the default demo from `config/brand.json` is shown.
- On the server only, the demo calls `GET ${LEAD_API_URL}/api/v1/demo/leads/{id}` with `Authorization: Bearer ${LEAD_API_KEY}`. The key and API URL never reach the browser.
- From the response, only `brand_name`, `logo_url`, `city`, `state` and `niche` are used. They replace the brand name (header, footer, page title, meta description, splash screen, admin, PDF bill, WhatsApp messages), the logo (or the brand initials in a circle when `logo_url` is null), the store location, and a few niche-appropriate lines. All other lead fields are dropped on the server.
- Lead logos are served through `/api/brand/logo/{id}`, so the Lead System's host never appears in the page source.
- Lookups are cached for 10 minutes per ID (Next.js `unstable_cache`, `revalidate: 600`). Not-found answers are cached too. Errors are not cached, so a temporary outage recovers on the next visit.
- If the API returns 404, fails, times out (5 s) or isn't configured, the visitor sees the default demo with no error. The reason is logged on the server as `[lead] …`.
- The ID is remembered for the browser session (an HttpOnly cookie), so the lead stays branded while browsing the shop, cart and checkout. Opening a link with an invalid `id` resets to the default demo.

#### Environment variables

| Name | Value |
|---|---|
| `LEAD_API_URL` | Base URL of the Zyntra Lead System, without a trailing slash or `/api/v1` (e.g. `https://leads.example.com`). |
| `LEAD_API_KEY` | A **read-only** API key for the demo leads endpoint. Never prefix it with `NEXT_PUBLIC_` and never commit it. |

Locally, copy `.env.example` to `.env.local` and fill in the values (`.env.local` is git-ignored). On Vercel, add them under **Project → Settings → Environment Variables** and redeploy.

### One-command copy for the Lead System

```bash
node scripts/create-demo.mjs --out ../demos/ZYN-1042 --name "Kesar & Co." --lead ZYN-1042 --logo ./kesar-logo.png
cd ../demos/ZYN-1042 && npm install && npm run build && npm start
```

The script copies the project (skipping `node_modules`, build output, the database and uploads), writes `config/brand.json` and drops the logo into `public/brand/`. No code changes.

### Data isolation per lead

Each copy has its **own SQLite database** (`prisma/demo.db`, set in `.env`) and its own uploads folder (`data/uploads/`). One lead's orders, products or settings never appear in another lead's demo. On first build the database is created and filled with sample data automatically. The admin **Reset demo** button restores that sample data before the next viewing.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000 (creates and seeds the database on first run)
# or production:
npm run build && npm start
```

Requires Node.js 18.18+ (tested on Node 22).

| What | Where | Demo login |
|---|---|---|
| Storefront | `/` | — |
| Customer account | `/account/login` | `priya@demo.store` / `demo1234` (shown on the screen) |
| Admin panel | `/admin` | `admin@demo.store` / `demo1234` (shown on the login screen) |

Coupons to try: `WELCOME10`, `FESTIVE20`, `FLAT300`.

### Deployment notes

- Run it on a Node host with a persistent disk (VPS, Docker, Railway, Render, Fly.io). Serverless hosts with read-only filesystems can't keep the SQLite file or uploaded photos.
- Login cookies are `Secure` in production. If a demo is served over plain HTTP (not HTTPS), set `INSECURE_COOKIES=1`.
- Optionally set `SESSION_SECRET` to a random string. Otherwise a key is derived from the lead ID.
- `LEAD_API_URL` and `LEAD_API_KEY` enable personalised demo links (see above). Without them the default demo is always shown.

---

## Features

**Storefront:** animated hero carousel, trust badges, category rail, featured collections, new arrivals, offers strip, bestsellers, reviews, an Instagram-style gallery. The shop has category, collection, size, colour, price and stock filters, plus sort, search and a grid/list toggle. Product pages have a gallery with hover zoom and a swipeable lightbox, colour and size pickers, a size guide, stock status, add to bag with a fly-to-cart animation, buy now, wishlist, order on WhatsApp, a pincode delivery check, reviews (with a write-a-review form) and related products. The bag supports quantity changes, coupons, and a GST and delivery breakdown. Checkout has an address form (saved addresses for signed-in users), standard or express delivery, and UPI, card, net banking or COD.

**Simulated payment gateway:** UPI QR or UPI ID, a card form with a live card preview, a bank picker, and COD. It plays a processing animation, then a success screen, then the order confirmation with a downloadable PDF bill and the demo notice.

**Order tracking:** an animated timeline (Placed → Packed → Shipped → Out for delivery → Delivered). It polls every 4 seconds, so admin status changes show up live.

**Customer account:** sign up and log in, order history, saved addresses, wishlist and profile.

**Admin panel (`/admin`):** dashboard (today's sales, orders, revenue chart, top products, low-stock alerts), products (add, edit or delete, photo upload, price, discount, sizes, colours, stock), categories and collections (create and reorder), orders (status changes, print or download the bill), customers with order history, coupons, store settings (banners, theme colours, announcement bar, delivery charges, GST, contact and social links), and **Reset demo**. Every admin change is reflected on the storefront straight away.

**Quality:** mobile-first, skeleton loaders, a branded loading screen, animated icons (entry fade, hover lift, tap bounce), scroll reveals, soft page transitions, and `prefers-reduced-motion` support. If a product photo can't load, the store shows designed artwork in the product's colour instead of a broken image.

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lucide icons · Prisma + SQLite · PDFKit (+ sharp for logos) · Zustand (bag and wishlist).

## Project map

```
config/brand.json        ← default brand (shown when no lead ID is in the URL)
middleware.ts            ← validates ?id= and remembers it for the session
lib/lead.ts              ← server-only Lead System client (10-minute cache)
public/brand/            ← lead logo goes here
app/(store)/             ← storefront routes
app/admin/               ← admin login + panel, server actions in actions.ts
app/api/                 ← orders, invoice PDF, auth, coupons, uploads
components/              ← UI (store/, admin/, home/, motion/)
lib/                     ← brand, db, pricing, invoice, seed data
prisma/schema.prisma     ← data model; seed.ts loads the sample store
scripts/create-demo.mjs  ← copy the master demo for a new lead
```
