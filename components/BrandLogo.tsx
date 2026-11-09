import { brand } from "@/lib/brand";
import { cn } from "@/lib/format";

/**
 * Renders the logo from brand.json at any aspect ratio (square, round or wide):
 * fixed height, width grows up to a cap, object-contain with safe padding so nothing is cropped.
 */
export function BrandLogo({ className, size = "md", withName = false, nameClassName }: { className?: string; size?: "sm" | "md" | "lg" | "xl"; withName?: boolean; nameClassName?: string }) {
  const box = { sm: "h-8 max-w-[110px]", md: "h-10 max-w-[140px]", lg: "h-14 max-w-[190px]", xl: "h-24 max-w-[280px]" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {brand.logoUrl && (
        <img src={brand.logoUrl} alt={`${brand.brandName} logo`} className={cn("w-auto object-contain p-0.5", box)} draggable={false} />
      )}
      {withName && <span className={cn("font-serif text-xl font-semibold leading-none tracking-tight", nameClassName)}>{brand.brandName}</span>}
    </span>
  );
}
