import type { Metadata } from "next";
import { PageHero } from "@/components/store/PageHero";
import { FaqList } from "@/components/store/FaqList";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqPage() {
  const s = await getSettings();
  const items = [
    { q: "How long does delivery take?", a: `Standard delivery takes 3–6 working days and is free on orders above ${formatINR(s.freeDeliveryAbove)} (otherwise ${formatINR(s.deliveryCharge)}). Express delivery arrives in 1–3 working days for ${formatINR(s.expressCharge)}.` },
    { q: "Do you offer cash on delivery?", a: "Yes, cash on delivery is available on most pincodes across India. You can also pay the delivery partner by UPI at your door." },
    { q: "How do I choose my size?", a: "Every product page has a size guide with garment measurements. If you are between sizes, we recommend sizing up for a relaxed fit. You can also message us on WhatsApp for personal help." },
    { q: "Can I return or exchange an item?", a: "Absolutely. You have 7 days from delivery to request a return or a free size exchange. We pick it up from your doorstep." },
    { q: "Is GST included in the price?", a: `Product prices are shown before GST. GST at ${s.gstPercent}% is added at checkout and shown clearly on your bill.` },
    { q: "How can I track my order?", a: "Use the Track Order page with the order ID from your confirmation page or bill. The timeline updates live as your order moves." },
    { q: "Do you ship internationally?", a: "We currently ship within India only. International shipping is coming soon — follow us on Instagram for updates." },
  ];
  return (
    <>
      <PageHero eyebrow="Help centre" title="Frequently asked questions" />
      <div className="container max-w-3xl py-14">
        <FaqList items={items} />
      </div>
    </>
  );
}
