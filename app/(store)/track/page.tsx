import type { Metadata } from "next";
import { Package } from "lucide-react";
import { TrackForm } from "@/components/store/Tracking";
import { Reveal } from "@/components/motion/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { STATUS_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage() {
  const user = await getCurrentUser();
  const recent = user ? await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }) : [];
  return (
    <div className="container max-w-2xl py-16 text-center sm:py-24">
      <Reveal>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Package size={28} strokeWidth={1.5} />
        </span>
        <p className="eyebrow mt-6">Order tracking</p>
        <h1 className="section-title mt-2">Where&apos;s my order?</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">Enter the order ID from your confirmation page or bill to see live updates.</p>
      </Reveal>
      <Reveal delay={0.1} className="mt-8">
        <TrackForm />
      </Reveal>
      {recent.length > 0 && (
        <Reveal delay={0.2} className="mt-10 text-left">
          <p className="label">Your recent orders</p>
          <div className="space-y-2">
            {recent.map((o) => (
              <Link key={o.id} href={`/track/${o.orderNumber}`} className="card flex items-center justify-between p-4 transition hover:border-ink/30">
                <span className="font-mono font-semibold">{o.orderNumber}</span>
                <span className="text-sm text-ink-mute">{STATUS_LABEL[o.status]}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
