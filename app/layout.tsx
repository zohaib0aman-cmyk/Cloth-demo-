import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { defaultBrand } from "@/lib/brand";
import { getBrand } from "@/lib/brand-server";
import { BrandProvider } from "@/components/BrandContext";
import { getSettings, hexToRgbChannels } from "@/lib/settings";
import { Providers } from "@/components/Providers";

const serif = localFont({
  variable: "--font-serif",
  display: "swap",
  src: [
    { path: "../assets/fonts/CormorantGaramond-500-normal.ttf", weight: "500", style: "normal" },
    { path: "../assets/fonts/CormorantGaramond-600-normal.ttf", weight: "600", style: "normal" },
    { path: "../assets/fonts/CormorantGaramond-700-normal.ttf", weight: "700", style: "normal" },
    { path: "../assets/fonts/CormorantGaramond-500-italic.ttf", weight: "500", style: "italic" },
    { path: "../assets/fonts/CormorantGaramond-600-italic.ttf", weight: "600", style: "italic" },
  ],
});

const sans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "../assets/fonts/Manrope-400-normal.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/Manrope-500-normal.ttf", weight: "500", style: "normal" },
    { path: "../assets/fonts/Manrope-600-normal.ttf", weight: "600", style: "normal" },
    { path: "../assets/fonts/Manrope-700-normal.ttf", weight: "700", style: "normal" },
  ],
});

export const dynamic = "force-dynamic";

function initialsIcon(initials: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${color}"/><text x="32" y="41" font-family="Georgia,serif" font-size="26" font-weight="600" fill="#fff" text-anchor="middle">${initials.replace(/[<&>"]/g, "")}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const [brand, settings] = await Promise.all([getBrand(), getSettings()]);
  const what = brand.niche ?? "Indian Clothing & Ethnic Wear";
  const where = brand.location ? ` in ${brand.location}` : " across India";
  const description = brand.niche
    ? `Shop ${brand.niche.toLowerCase()} from ${brand.brandName}. Free shipping, easy returns and cash on delivery${where}.`
    : `Shop handcrafted kurtis, sarees, co-ord sets, ethnic wear, tees and denim from ${brand.brandName}. Free shipping, easy returns and cash on delivery across India.`;
  const icon = brand.logoUrl ?? initialsIcon(brand.initials, /^#[0-9a-f]{6}$/i.test(settings.primaryColor) ? settings.primaryColor : "#7a2232");
  return {
    title: { default: `${brand.brandName} — ${what}`, template: `%s | ${brand.brandName}` },
    description,
    applicationName: brand.brandName,
    icons: { icon, apple: icon, shortcut: icon },
    openGraph: { siteName: brand.brandName, title: brand.brandName, description, ...(brand.logoUrl ? { images: [brand.logoUrl] } : {}), type: "website" },
    // Identifies the master demo copy; omitted for lead views so no lead field is added to the page.
    ...(brand.isLead ? {} : { other: { "zyntra-lead-id": defaultBrand.leadId } }),
  };
}

export const viewport: Viewport = { themeColor: "#fbf8f3", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, brand] = await Promise.all([getSettings(), getBrand()]);
  const vars = `:root{--brand:${hexToRgbChannels(settings.primaryColor)};--accent:${hexToRgbChannels(settings.accentColor, "184 137 59")};}`;
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>
        <BrandProvider value={brand}>
          <Providers>{children}</Providers>
        </BrandProvider>
      </body>
    </html>
  );
}
