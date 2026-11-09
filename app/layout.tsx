import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { brand } from "@/lib/brand";
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

export const metadata: Metadata = {
  title: { default: `${brand.brandName} — Indian Clothing & Ethnic Wear`, template: `%s | ${brand.brandName}` },
  description: `Shop handcrafted kurtis, sarees, co-ord sets, ethnic wear, tees and denim from ${brand.brandName}. Free shipping, easy returns and cash on delivery across India.`,
  applicationName: brand.brandName,
  icons: { icon: brand.logoUrl, apple: brand.logoUrl, shortcut: brand.logoUrl },
  openGraph: {
    siteName: brand.brandName,
    title: brand.brandName,
    description: `Handcrafted Indian clothing by ${brand.brandName}.`,
    images: [brand.logoUrl],
    type: "website",
  },
  other: { "zyntra-lead-id": brand.leadId },
};

export const viewport: Viewport = { themeColor: "#fbf8f3", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const vars = `:root{--brand:${hexToRgbChannels(settings.primaryColor)};--accent:${hexToRgbChannels(settings.accentColor, "184 137 59")};}`;
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
