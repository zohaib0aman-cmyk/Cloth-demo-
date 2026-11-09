"use client";
import { useState } from "react";
import { useBrand } from "./BrandContext";
import { cn } from "@/lib/format";

const BOX = { sm: "h-8 max-w-[110px]", md: "h-10 max-w-[140px]", lg: "h-14 max-w-[190px]", xl: "h-24 max-w-[280px]" };
const CIRCLE = { sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg", xl: "h-24 w-24 text-3xl" };

/** Brand initials in a circle — used when a lead has no logo or the logo can't be loaded. */
export function BrandInitials({ size = "md", className }: { size?: keyof typeof CIRCLE; className?: string }) {
  const { initials, brandName } = useBrand();
  return (
    <span role="img" aria-label={`${brandName} logo`} className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-brand font-serif font-semibold tracking-wide text-white ring-2 ring-accent/40 ring-offset-2 ring-offset-transparent", CIRCLE[size], className)}>
      {initials}
    </span>
  );
}

/**
 * Renders the brand's logo at any aspect ratio (square, round or wide): fixed height, width grows up to a cap,
 * object-contain with safe padding so nothing is cropped. Falls back to initials in a circle.
 */
export function BrandLogo({ className, size = "md", withName = false, nameClassName }: { className?: string; size?: "sm" | "md" | "lg" | "xl"; withName?: boolean; nameClassName?: string }) {
  const brand = useBrand();
  const [failed, setFailed] = useState(false);
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {brand.logoUrl && !failed ? (
        <img src={brand.logoUrl} alt={`${brand.brandName} logo`} className={cn("w-auto object-contain p-0.5", BOX[size])} draggable={false} onError={() => setFailed(true)} />
      ) : (
        <BrandInitials size={size} />
      )}
      {withName && <span className={cn("font-serif text-xl font-semibold leading-none tracking-tight", nameClassName)}>{brand.brandName}</span>}
    </span>
  );
}
