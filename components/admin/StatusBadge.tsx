import { STATUS_LABEL } from "@/lib/types";
import { cn } from "@/lib/format";

const TONE: Record<string, string> = {
  PLACED: "bg-sky-50 text-sky-800",
  PACKED: "bg-violet-50 text-violet-800",
  SHIPPED: "bg-amber-50 text-amber-800",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-800",
  DELIVERED: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", TONE[status] ?? "bg-ivory-deep")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
